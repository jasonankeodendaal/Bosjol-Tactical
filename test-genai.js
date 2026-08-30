import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: 'AIzaSyFakeKey123' });
async function run() {
  try {
    await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: 'hello'
    });
  } catch (e) {
    console.log(e.message);
  }
}
run();
