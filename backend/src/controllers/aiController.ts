import { Request, Response } from 'express';
import { Deal } from '../models/Deal';
import { Lead } from '../models/Lead';
import { Contact } from '../models/Contact';
import { getDealCoachAdvice, getPersonaProfile, getObjectionResponses, getWinLossExplanation, generateEmailWithAI, getAICoachAnswer, getHumanAnswerFromResults } from '../services/aiService';
import fs from 'fs';
import path from 'path';
import { User } from '../models/User';
import { EmailLog } from '../models/EmailLog';
import { ChatMessage } from '../models/ChatMessage';

// Schema descriptions for AI prompt context
const leadSchemaDescription = `The Lead model has these fields: firstName (string), lastName (string), email (string), phone (string), company (string), jobTitle (string), source (string), status (string), score (number), assignedTo (ObjectId), budget (object), requirements (string), interests (array), timeline (string), leadMagnet (string), campaign (string), nurturingSequence (string), activities (array), customFields (object), tags (array), location (object), socialProfiles (object), qualificationCriteria (object), conversionDetails (object), metadata (object), createdAt (Date), updatedAt (Date).`;

const dealSchemaDescription = `The Deal model has these fields: title (string), value (number), currency (string), stage (string), probability (number), expectedCloseDate (Date), actualCloseDate (Date), contact (ObjectId), company (ObjectId), assignedTo (ObjectId), products (array), activities (array), notes (string), tags (array), customFields (object), priority (string), lossReason (string), winReason (string), competitors (array), documents (array), createdAt (Date), updatedAt (Date).`;

const userSchemaDescription = `The User model has these fields: email (string), password (string), firstName (string), lastName (string), role (string), isActive (boolean), isEmailVerified (boolean), emailVerificationToken (string), emailVerificationExpires (Date), passwordResetToken (string), passwordResetExpires (Date), lastLogin (Date), createdAt (Date), updatedAt (Date).`;

const contactSchemaDescription = `The Contact model has these fields: firstName (string), lastName (string), email (string), phone (string), company (string), position (string), status (string), source (string), assignedTo (ObjectId), tags (array), notes (string), address (object), socialProfiles (object), interactions (array), preferences (object), lastContactDate (Date), nextFollowUp (Date), createdAt (Date), updatedAt (Date).`;

const emailLogSchemaDescription = `The EmailLog model has these fields: to (string), subject (string), body (string), sentBy (ObjectId), sentAt (Date), status (string), type (string), relatedEntity (object), error (string), createdAt (Date), updatedAt (Date).`;

const chatMessageSchemaDescription = `The ChatMessage model has these fields: sender (ObjectId), receiver (ObjectId), content (string), timestamp (Date), status (string).`;

const allSchemas = `
Available models and their schema:

Lead: ${leadSchemaDescription}
Deal: ${dealSchemaDescription}
Contact: ${contactSchemaDescription}
User: ${userSchemaDescription}
EmailLog: ${emailLogSchemaDescription}
ChatMessage: ${chatMessageSchemaDescription}
`;

const modelMap: Record<string, any> = {
  Lead,
  Deal,
  Contact,
  User,
  EmailLog,
  ChatMessage,
};

export const dealCoach = async (req: Request, res: Response) => {
  const { dealId } = req.params;

  try {
    const deal = await Deal.findById(dealId).populate('contact assignedTo');
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    // Prepare prompt for AI
    const prompt = `Deal details: ${JSON.stringify(deal)}. What are the next best actions to close this deal? Estimate close probability.`;

    // Call OpenAI service
    const aiResult = await getDealCoachAdvice(prompt);
    res.json(aiResult);
  } catch (error: any) {
    console.error('Deal Coach AI error:', error.message);
    res.status(500).json({ error: 'Failed to get AI advice' });
  }
};

export const personaProfile = async (req: Request, res: Response) => {
  const { leadId } = req.params;
  try {
    // Try to find as a lead first
    let lead = await Lead.findById(leadId).populate('assignedTo');
    if (lead) {
      const prompt = `Lead details: ${JSON.stringify(lead)}. Based on this data and interaction history, generate a behavioral persona profile for a sales team. Respond in JSON: {"persona": string, "traits": string[], "communicationStyle": string, "recommendations": string}`;
      const aiResult = await getPersonaProfile(prompt);
      return res.json(aiResult);
    }
    // If not a lead, try as a contact
    let contact = await Contact.findById(leadId).populate('assignedTo');
    if (!contact) return res.status(404).json({ error: 'Lead or Contact not found' });
    // Find previous lead info by email (if any)
    let prevLead = await Lead.findOne({ email: contact.email });
    // Find all deals for this contact
    let deals = await Deal.find({ contact: contact._id });
    const prompt = `Contact details: ${JSON.stringify(contact)}. Previous lead info: ${prevLead ? JSON.stringify(prevLead) : 'None'}. All deals: ${JSON.stringify(deals)}. Based on this data and interaction history, generate a behavioral persona profile for a sales team. Respond in JSON: {"persona": string, "traits": string[], "communicationStyle": string, "recommendations": string}`;
    const aiResult = await getPersonaProfile(prompt);
    res.json(aiResult);
  } catch (error: any) {
    console.error('Persona Profile AI error:', error.message);
    res.status(500).json({ error: 'Failed to get persona profile' });
  }
};

export const objectionHandler = async (req: Request, res: Response) => {
  const { objection, dealId } = req.body;
  if (!objection) return res.status(400).json({ error: 'Objection text is required' });
  try {
    let deal = null;
    if (dealId) {
      deal = await Deal.findById(dealId);
    }
    const prompt = `Customer objection: "${objection}"${deal ? `. Deal context: ${JSON.stringify(deal)}` : ''}. Suggest 2-3 convincing, professional responses a sales rep can use. Respond in JSON: {"responses": string[]}`;
    const aiResult = await getObjectionResponses(prompt);
    res.json(aiResult);
  } catch (error: any) {
    console.error('Objection Handler AI error:', error.message);
    res.status(500).json({ error: 'Failed to get objection handler responses' });
  }
};

export const winLossExplainer = async (req: Request, res: Response) => {
  const { dealId } = req.params;
  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (!['closed_won', 'closed_lost'].includes(deal.stage)) {
      return res.status(400).json({ error: 'Deal is not closed (won or lost)' });
    }
    const prompt = `Deal details: ${JSON.stringify(deal)}. Based on this data, explain in detail why this deal was ${deal.stage === 'closed_won' ? 'won' : 'lost'}. Respond in JSON: {"explanation": string}`;
    const aiResult = await getWinLossExplanation(prompt);
    res.json(aiResult);
  } catch (error: any) {
    console.error('Win-Loss Explainer AI error:', error.message);
    res.status(500).json({ error: 'Failed to get win-loss explanation' });
  }
};

export const aiCoach = async (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });
  try {
    const prompt = `
    You are an expert in converting user questions into MongoDB aggregation pipelines.
    Given the following user question, output a JSON object with two fields:
    - "model": the name of the collection/model to query (e.g., "Lead", "Deal", "Contact", etc.)
    - "pipeline": the MongoDB aggregation pipeline as an array

    Only output valid JSON. Do not include any explanations or code blocks.

    ${allSchemas}

    User question: ${question}
    Output:
    `;

   
    const aiResponse = await getAICoachAnswer(prompt);

    let parsed = JSON.parse(aiResponse);
    const { model, pipeline } = parsed;
    // 2. Run the aggregation pipeline on the Lead collection
    let results
    try {
      results = await modelMap[model].aggregate(pipeline);
    } catch (error: any) {
      console.error('AI Coach error:', error.message);
      results = []
    }
    // console.log(parsed, results)
    const answer = await getHumanAnswerFromResults(question, results);
    // 4. Return the answer, results, and pipeline
    res.json({  results, pipeline, answer });
  } catch (error: any) {
    console.error('AI Coach error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const generateEmail = async (req: Request, res: Response) => {
  const { prompt, lead } = req.body;
  if (!prompt || !lead) return res.status(400).json({ error: 'Prompt and lead are required' });
  try {
    const result = await generateEmailWithAI(prompt, lead);
    res.json(result);
  } catch (error: any) {
    console.error('AI Email Generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate email with AI' });
  }
}; 