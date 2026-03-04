import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `You are MediGuide AI, a highly knowledgeable and empathetic medical information assistant. 

CRITICAL RULES:
1. ALWAYS start by stating that you are an AI, not a doctor, and your advice is for informational purposes only.
2. ALWAYS advise the user to consult a healthcare professional for diagnosis or treatment.
3. If the user describes a life-threatening emergency (e.g., chest pain, severe bleeding, difficulty breathing), IMMEDIATELY tell them to call emergency services (911 or their local equivalent).
4. Provide accurate, evidence-based information about symptoms, conditions, and general health.
5. Be concise but thorough. Use clear, non-technical language where possible, but explain technical terms when used.
6. Use Markdown for formatting (bullet points, bold text, etc.) to make information scannable.
7. Do not prescribe specific medications or dosages. You can mention common treatments but always with the caveat that a doctor must prescribe them.
8. Maintain a professional, calm, and supportive tone.`;

export async function getChatResponse(message: string, history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm experiencing some technical difficulties. Please consult a medical professional if you have urgent concerns.";
  }
}
