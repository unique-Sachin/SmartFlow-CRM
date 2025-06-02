import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';


export async function getDealCoachAdvice(prompt: string): Promise<{ nextSteps: string; probability: number }> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not set');
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a sales deal coach AI. Given deal data, provide actionable next steps and a close probability (0-100%). Respond in JSON: {"nextSteps": string, "probability": number}.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    // Parse the AI's JSON response
    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    return result;
  } catch (error: any) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to get AI advice');
  }
}

export async function getPersonaProfile(prompt: string): Promise<{ persona: string; traits: string[]; communicationStyle: string; recommendations: string }> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not set');
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert sales AI. Given lead data and interaction history, generate a behavioral persona profile for a sales team. Respond in JSON: {"persona": string, "traits": string[], "communicationStyle": string, "recommendations": string}.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    return result;
  } catch (error: any) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to get persona profile');
  }
}

export async function getObjectionResponses(prompt: string): Promise<{ responses: string[] }> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not set');
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert sales AI. Given a customer objection (and optional deal context), suggest 2-3 convincing, professional responses a sales rep can use. Respond in JSON: {"responses": string[] }.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    return result;
  } catch (error: any) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to get objection handler responses');
  }
}

export async function getWinLossExplanation(prompt: string): Promise<{ explanation: string }> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not set');
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert sales AI. Given a closed deal, explain in detail why the deal was won or lost. Respond in JSON: {"explanation": string}.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    return result;
  } catch (error: any) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to get win-loss explanation');
  }
}

export async function getAICoachAnswer(question: string): Promise<{ answer: string }> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not set');
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful CRM assistant. Answer user questions about CRM features, best practices, and how to use the system.' },
          { role: 'user', content: question }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const content = response.data.choices[0].message.content;
    return { answer: content };
  } catch (error: any) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to get AI Coach answer');
  }
}

export async function generateEmailWithAI(prompt: string, lead: any): Promise<{ subject: string; message: string }> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not set');
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert sales email assistant. Given a lead and a prompt, generate a professional email subject and message. Respond in JSON: {"subject": string, "message": string }.' },
          { role: 'user', content: `Lead: ${JSON.stringify(lead)}\nPrompt: ${prompt}` }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    return result;
  } catch (error: any) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to generate email with AI');
  }
} 