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
app.use(express.json()); // <--- ADICIONE ESTA LINHA
app.use(bodyParser.urlencoded({ extended: true }));

// Rota para servir a página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Rota para processar perguntas
app.post('/ask', async (req, res) => {
  const { question, mode } = req.body;

  if (!question || question.trim() === '') {
    return res.json({ success: false, message: 'Por favor, insira uma pergunta válida.' });
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
