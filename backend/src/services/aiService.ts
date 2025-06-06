import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// export async function getDealCoachAdvice(
//   prompt: string
// ): Promise<{ nextSteps: string; probability: number }> {
//   if (!OPENAI_API_KEY) throw new Error("OpenAI API key not set");
//   try {
//     const response = await axios.post(
//       OPENAI_API_URL,
//       {
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "system",
//             content:
//               'You are a sales deal coach AI. Given deal data, provide actionable next steps and a close probability (0-100%). Respond in JSON: {"nextSteps": string, "probability": number}.',
//           },
//           { role: "user", content: prompt },
//         ],
//         temperature: 0.7,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${OPENAI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     // Parse the AI's JSON response
//     const content = response.data.choices[0].message.content;
//     const result = JSON.parse(content);
//     return result;
//   } catch (error: any) {
//     console.error("OpenAI API error:", error.response?.data || error.message);
//     throw new Error("Failed to get AI advice");
//   }
// }

export async function getDealCoachAdvice(
  prompt: string
): Promise<{ nextSteps: string; probability: number }> {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not set");

  try {
    const systemPrompt = `
You are a sales deal coach AI. Given deal data, provide actionable next steps and a close probability (0-100%).

Respond strictly in this JSON format without explanation:
{
  "nextSteps": string,
  "probability": number
}

Prompt: ${prompt}
    `.trim();

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
      }),
    });

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) throw new Error("No valid response from Gemini");

    const cleaned = content
      .replace(/```json/i, "") // remove ```json if present
      .replace(/```/, "") // remove closing ```
      .trim();

    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error: any) {
    console.error("Gemini API error:", error.message || error);
    throw new Error("Failed to get AI advice");
  }
}

// export async function getPersonaProfile(
//   prompt: string
// ): Promise<{
//   persona: string;
//   traits: string[];
//   communicationStyle: string;
//   recommendations: string;
// }> {
//   try {
//     const res = await fetch("http://localhost:11434/api/generate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         model: "llama3:latest",
//         prompt: `
// You are an expert sales AI. Given lead data and interaction history, along with user's name and details generate a behavioral persona profile for a sales team. Respond in JSON format like this:
// {"persona": string, "traits": string[], "communicationStyle": string, "recommendations": string}

// Prompt: ${prompt}
//         `.trim(),
//       }),
//     });

//     const text = await res.text();

//     // Combine partial streamed responses
//     let combined = "";
//     text.split("\n").forEach((line) => {
//       if (line.trim()) {
//         try {
//           const json = JSON.parse(line);
//           if (json.response) {
//             combined += json.response;
//           }
//         } catch (err) {
//           // skip malformed line
//         }
//       }
//     });

//     console.log("combined", combined);

//     // Try parsing the final combined output as JSON
//     const result = JSON.parse(combined);
//     return result;
//   } catch (error: any) {
//     console.error("LLaMA3 API error:", error.message);
//     throw new Error("Failed to get persona profile");
//   }
// }

export async function getPersonaProfile(prompt: string): Promise<{
  persona: string;
  traits: string[];
  communicationStyle: string;
  recommendations: string;
}> {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not set");

  try {
    const systemPrompt = `
You are an expert sales AI. Given lead data and interaction history, generate a behavioral persona using user's details if present.

Respond strictly in this JSON format:
{
  "persona": string (heading + user name if present),
  "traits": string[],
  "communicationStyle": string,
  "recommendations": string
}

Prompt: ${prompt}
    `.trim();

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
      }),
    });

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) throw new Error("No valid response from Gemini");

    // Clean markdown-style code block if present
    const cleaned = content
      .replace(/```json/i, "") // remove ```json
      .replace(/```/, "") // remove closing ```
      .trim();

    const parsed = JSON.parse(cleaned);

    return parsed;
  } catch (error: any) {
    console.error("Gemini API error:", error.message || error);
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
        model: "gpt-3.5-turbo",
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
    const result = JSON.parse(content);
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
        model: "gpt-3.5-turbo",
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
    const result = JSON.parse(content);
    return result;
  } catch (error: any) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    throw new Error("Failed to get win-loss explanation");
  }
}

export async function getAICoachAnswer(question: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not set");

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: question }] }],
      }),
    });

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) throw new Error("No valid response from Gemini");

    return content
      .replace(/```json/i, "") // remove ```json if present
      .replace(/```/, "") // remove closing ```
      .trim();
  } catch (error: any) {
    console.error("Gemini API error:", error.message || error);
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
        model: "gpt-3.5-turbo",
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
    const result = JSON.parse(content);
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
        model: "gpt-3.5-turbo",
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
