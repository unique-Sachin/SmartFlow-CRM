import { Request, Response } from 'express';
import { Deal } from '../models/Deal';
import { Lead } from '../models/Lead';
import { Contact } from '../models/Contact';
import { getDealCoachAdvice, getPersonaProfile, getObjectionResponses, getWinLossExplanation } from '../services/aiService';

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
    const { getAICoachAnswer } = require('../services/aiService');
    const result = await getAICoachAnswer(question);
    res.json(result);
  } catch (error: any) {
    console.error('AI Coach error:', error.message);
    res.status(500).json({ error: 'Failed to get AI Coach answer' });
  }
}; 