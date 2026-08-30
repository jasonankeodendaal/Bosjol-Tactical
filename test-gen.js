import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'imagen-3.0-generate-001',
      contents: 'hello'
    });
    console.log(res.candidates[0]?.content);
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
run();
