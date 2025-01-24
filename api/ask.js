const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1024,
  responseMimeType: 'text/plain',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { question } = req.body;

  if (!question) {
    res.status(400).json({ error: 'Missing question in request body' });
    return;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `Você é um assistente cristão protestante de linha arminiana, especialista em estudos bíblicos. Baseie suas respostas na Bíblia e forneça referências bíblicas sempre que possível.`,
    });

    const chat = model.startChat({
      generationConfig: generationConfig,
      history: [],
    });

    const result = await chat.sendMessage(question);
    const responseText = await result.response.text();

    res.status(200).json({ success: true, answer: responseText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erro ao gerar resposta' });
  }
}
