import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// 🔍 Verifica se a chave está carregada
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ Chave da API Gemini não encontrada. Verifique seu arquivo .env.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1024,
  responseMimeType: 'text/plain',
};

export default async function handler(req, res) {
  console.log("📥 Requisição recebida:", req.method);

  if (req.method !== 'POST') {
    console.warn("⚠️ Método não permitido:", req.method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { question, mode } = req.body;
  console.log("🟡 Dados recebidos:", { question, mode });

  if (!question || typeof question !== 'string' || question.trim() === '') {
    console.warn("⚠️ Pergunta ausente ou inválida.");
    res.status(400).json({ error: 'Missing or invalid question in request body' });
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
    } else {
      console.warn("⚠️ Modo inválido:", mode);
    }

    console.log("📜 Instrução do sistema:", systemInstruction);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction,
    });

    console.log("🤖 Modelo Gemini inicializado.");

    const chat = model.startChat({
      generationConfig,
      history: [],
    });

    console.log("💬 Chat iniciado. Enviando pergunta...");

    const result = await chat.sendMessage(question);
    console.log("📦 Resposta bruta recebida:", result);

    const responseText = await result.response.text();
    console.log("📝 Texto gerado:", responseText);

    res.status(200).json({ success: true, answer: responseText });
  } catch (error) {
    console.error("❌ Erro ao gerar resposta:", error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao gerar resposta',
    });
  }
}
