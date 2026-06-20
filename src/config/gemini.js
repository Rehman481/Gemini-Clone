

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const runChat = async (prompt) => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return result.text;
  } catch (error) {
    console.log(error);
    return "Error generating response";
  }
};

export default runChat;