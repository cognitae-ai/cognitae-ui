import { GoogleGenAI } from '@google/genai';

export async function askGemini(apiKey, systemInstruction, history, userText, model = 'gemini-2.5-flash') {
    if (!apiKey) throw new Error("API Key is missing.");

    try {
        const ai = new GoogleGenAI({ apiKey });

        let contents = [];
        if (history && history.length > 0) {
            contents = history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));
        }

        contents.push({ role: 'user', parts: [{ text: userText }] });

        const req = {
            model: model,
            contents: contents
        };

        if (systemInstruction) {
            req.systemInstruction = systemInstruction;
        }

        const response = await ai.models.generateContent(req);
        return response.text;
    } catch (e) {
        console.error("Gemini API Error:", e);
        throw e;
    }
}
