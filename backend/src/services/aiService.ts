import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL_NAME = "gpt-4o-mini";

// Helper function to clean AI response and extract JSON
function cleanJsonResponse(content: string): string {
  // Remove markdown code blocks if present
  let cleaned = content.trim();
  
  // Remove ```json and ``` if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  
  return cleaned.trim();
}

export async function getDealCoachAdvice(
  prompt: string
): Promise<{ nextSteps: string; probability: number }> {
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key not set");
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content:
              'You are a sales deal coach AI. Given deal data, provide actionable next steps and a close probability (0-100%). Respond in JSON: {"nextSteps": string, "probability": number}.',
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    // Parse the AI's JSON response
    const content = response.data.choices[0].message.content;
    const cleanedContent = cleanJsonResponse(content);
    const result = JSON.parse(cleanedContent);
    return result;
  } catch (error: any) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    throw new Error("Failed to get AI advice");
  }
}

export async function getPersonaProfile(prompt: string): Promise<{
  persona: string;
  traits: string[];
  communicationStyle: string;
  recommendations: string;
}> {
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key not set");

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content:
              'You are an expert sales AI. Given lead data and interaction history, generate a behavioral persona using user\'s details if present. Respond in JSON: {"persona": string (heading + user name if present), "traits": string[], "communicationStyle": string, "recommendations": string}.',
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const cleanedContent = cleanJsonResponse(content);
    const result = JSON.parse(cleanedContent);
    return result;
  } catch (error: any) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    throw new Error("Failed to get persona profile");
  }
}

export async function getObjectionResponses(
  prompt: string
): Promise<{ responses: string[] }> {
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key not set");
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content:
              'You are an expert sales AI. Given a customer objection (and optional deal context), suggest 2-3 convincing, professional responses a sales rep can use. Respond in JSON: {"responses": string[] }.',
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const content = response.data.choices[0].message.content;
    const cleanedContent = cleanJsonResponse(content);
    const result = JSON.parse(cleanedContent);
    return result;
  } catch (error: any) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    throw new Error("Failed to get objection handler responses");
  }
}

export async function getWinLossExplanation(
  prompt: string
): Promise<{ explanation: string }> {
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key not set");
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content:
              'You are an expert sales AI. Given a closed deal, explain in detail why the deal was won or lost. Respond in JSON: {"explanation": string}.',
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const content = response.data.choices[0].message.content;
    const cleanedContent = cleanJsonResponse(content);
    const result = JSON.parse(cleanedContent);
    return result;
  } catch (error: any) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    throw new Error("Failed to get win-loss explanation");
  }
}

export async function getAICoachAnswer(question: string): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key not set");

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI coach for a CRM system. Answer questions about CRM features, sales best practices, and how to use the system effectively. Provide clear, actionable advice.",
          },
          { role: "user", content: question },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content.trim();
    return content;
  } catch (error: any) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    throw new Error("Failed to get AI answer");
  }
}

export async function generateEmailWithAI(
  prompt: string,
  lead: any
): Promise<{ subject: string; message: string }> {
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key not set");
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content:
              'You are an expert sales email assistant. Given a lead and a prompt, generate a professional email subject and message. Respond in JSON: {"subject": string, "message": string }.',
          },
          {
            role: "user",
            content: `Lead: ${JSON.stringify(lead)}\nPrompt: ${prompt}`,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const content = response.data.choices[0].message.content;
    const cleanedContent = cleanJsonResponse(content);
    const result = JSON.parse(cleanedContent);
    return result;
  } catch (error: any) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    throw new Error("Failed to generate email with AI");
  }
}

export async function getHumanAnswerFromResults(
  question: string,
  results: any
): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key not set");
  try {
    const prompt = `You are a helpful assistant. If the MongoDB results are empty or not relevant, answer the user's question in a general, helpful way. Otherwise, answer based on the results. Try to arrange in answer in proper heading and format by braking line after each heading. \n\nUser's question: ${question}\nMongoDB results: ${JSON.stringify(
      results,
      null,
      2
    )}\n\nAnswer:`;
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const content = response.data.choices[0].message.content.trim();
    return content;
  } catch (error: any) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    throw new Error("API LIMIT REACHED...");
  }
}
