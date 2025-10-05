// api/ask.js
// Função serverless para Vercel (Node.js runtime)
// CommonJS: não misture com "type":"module" + import/export.

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'; // ex.: 'gemini-2.0-flash' / 'gemini-2.5-flash'

const genAI = new GoogleGenerativeAI(API_KEY);

// Configuração de geração
const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1048,
};

module.exports = async (req, res) => {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Vercel já entrega JSON em req.body
    const { question, mode } = req.body || {};

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY ausente nas variáveis de ambiente.',
      });
    }

    if (!question || !String(question).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing question in request body',
      });
    }

    // Instrução do sistema conforme o modo
    let systemInstruction = `
Você é um assistente cristão protestante de linha arminiana, especialista em estudos bíblicos.
Responda às perguntas com base na Bíblia e forneça referências bíblicas sempre que possível.
Estruture a resposta da seguinte forma:
- **Versículos principais:** Apresente versículos que fundamentam o tema.
- **Explicação:** Explique o significado dos versículos de forma simples e direta.
- **Aplicação prática:** Dê sugestões de como o leitor pode aplicar esse ensinamento no dia a dia.
    `.trim();

    if (mode === 'estudo') {
      systemInstruction = `
Você é um assistente cristão especializado em teologia bíblica avançada.
Responda de forma aprofundada, buscando referências ao texto original da Bíblia em hebraico e grego,
contexto histórico, exegese e interpretação teológica. Sempre forneça as palavras originais e seus significados.
Estruture a resposta da seguinte forma:
- **Versículos principais:** Apresente versículos que fundamentam o tema.
- **Explicação:** Explique o significado dos versículos de forma simples e direta.
- **Aplicação prática:** Dê sugestões de como o leitor pode aplicar esse ensinamento no dia a dia.
      `.trim();
    }

    // Inicializa o modelo
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction,
    });

    // Gera a resposta
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: String(question) }],
        },
      ],
      generationConfig,
    });

    const answer = result?.response?.text?.() || '';

    if (!answer.trim()) {
      // Caso a SDK mude o shape ou venha vazio
      return res.status(502).json({
        success: false,
        error: 'Resposta vazia do modelo',
      });
    }

    return res.status(200).json({ success: true, answer });
  } catch (err) {
    // Log no servidor (aparece no "vercel dev" e nos logs da Vercel)
    console.error('ask.js error:', err);

    // Expondo mensagem para facilitar o debug; em produção, pode trocar por texto genérico.
    return res.status(500).json({
      success: false,
      error: String(err?.message || err || 'Erro ao gerar resposta'),
    });
  }
};
