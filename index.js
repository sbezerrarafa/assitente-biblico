require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

// 🔑 Verifica se a chave da API está carregando
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ Chave da API Gemini não encontrada. Verifique seu arquivo .env.");
}
console.log("🔑 Chave da API:", apiKey);

// Inicializa o cliente da API
const genAI = new GoogleGenerativeAI(apiKey);

// Configuração de geração
const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 2048,
  // responseMimeType: 'text/plain',
};

// Middleware para servir arquivos estáticos e processar JSON
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Rota de perguntas
app.post('/ask', async (req, res) => {
  console.log("📥 Requisição recebida:", req.body);

  const { question, mode } = req.body;

  if (!question || question.trim() === '') {
    console.warn("⚠️ Pergunta inválida.");
    return res.json({ success: false, error: 'Por favor, insira uma pergunta válida.' });
  }

  try {
    console.log("🟡 Modo selecionado:", mode);

    let systemInstruction = '';

    if (mode === 'padrao') {
      systemInstruction = `Você é um assistente cristão protestante de linha arminiana, especialista em estudos bíblicos. Responda às perguntas com base na Bíblia e forneça referências bíblicas sempre que possível. Estruture a resposta da seguinte forma:
- **Versículos principais:** Apresente versículos que fundamentam o tema.
- **Explicação:** Explique o significado dos versículos de forma simples e direta.
- **Aplicação prática:** Dê sugestões de como o leitor pode aplicar esse ensinamento no dia a dia.`;
    } else if (mode === 'estudo') {
      systemInstruction = `Você é um assistente cristão especializado em teologia bíblica avançada. Responda de forma aprofundada, buscando referências ao texto original da Bíblia em hebraico e grego, contexto histórico, exegese e interpretação teológica. Sempre forneça as palavras originais e seus significados. Estruture a resposta da seguinte forma:
- **Versículos principais:** Apresente versículos que fundamentam o tema.
- **Explicação:** Explique o significado dos versículos de forma simples e direta.
- **Aplicação prática:** Dê sugestões de como o leitor pode aplicar esse ensinamento no dia a dia.`;
    }

    console.log("📜 Instrução do sistema:", systemInstruction);

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
    });

    console.log("🤖 Modelo Gemini inicializado.");

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: question }] }],
      generationConfig,
    });

    console.log("📦 Resposta bruta recebida:", result);

    const responseText = result.response.text();
    console.log("📝 Texto gerado pela Gemini:", responseText);

    res.json({ success: true, answer: responseText });
  } catch (error) {
    console.error("❌ Erro ao obter resposta:", error);
    res.json({ success: false, error: error.message || 'Erro ao gerar resposta. Tente novamente mais tarde.' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
