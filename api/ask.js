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

  const { question, mode } = req.body;

  if (!question) {
    res.status(400).json({ error: 'Missing question in request body' });
    return;
  }

  try {
    let systemInstruction = '';

    if (mode === 'padrao') {
      systemInstruction = `Você é um assistente cristão protestante de linha arminiana, especialista em estudos bíblicos.
      Responda às perguntas com base na Bíblia e forneça referências bíblicas sempre que possível.
      Estruture a resposta da seguinte forma:
      - **Versículos principais:** Apresente versículos que fundamentam o tema.
      - **Explicação:** Explique o significado dos versículos de forma simples e direta.
      - **Aplicação prática:** Dê sugestões de como o leitor pode aplicar esse ensinamento no dia a dia.`;
    } else if (mode === 'estudo') {
      systemInstruction = `Você é um assistente cristão especializado em teologia bíblica avançada. 
      Responda de forma aprofundada, buscando referências ao texto original da Bíblia em hebraico e grego, contexto histórico, exegese e interpretação teológica. 
      Sempre forneça as palavras originais e seus significados.
      - **Versículos principais:** Apresente versículos que fundamentam o tema.
      - **Explicação:** Explique o significado dos versículos de forma simples e direta.
      - **Aplicação prática:** Dê sugestões de como o leitor pode aplicar esse ensinamento no dia a dia.`;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction,
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
