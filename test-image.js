import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: 'hello'
    });
    console.log(res);
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
run();
