require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

// Inicializa o cliente da API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1024,
  responseMimeType: 'text/plain',
};

// Middleware para servir arquivos estáticos e processar formulários
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Rota para servir a página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Rota para processar perguntas
app.post('/ask', async (req, res) => {
  const question = req.body.question;

  if (!question || question.trim() === '') {
    return res.json({ success: false, message: 'Por favor, insira uma pergunta válida.' });
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
    const response = await result.response.text();

    res.json({ success: true, answer: response });
  } catch (error) {
    console.error('Erro ao obter resposta:', error);
    res.json({ success: false, message: 'Erro ao gerar resposta. Tente novamente mais tarde.' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
