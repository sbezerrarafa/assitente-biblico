const form = document.getElementById('question-form');
const responseDiv = document.getElementById('response');

const API_URL = '/api/ask';

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const question = document.getElementById('question').value.trim();
  if (!question) return;

  responseDiv.innerHTML = '<p>Aguarde, estamos buscando a resposta...</p>';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();
    if (data.success) {
      responseDiv.innerHTML = `<p>${data.answer}</p>`;
    } else {
      responseDiv.innerHTML = `<p>Erro: ${data.error}</p>`;
    }
  } catch (error) {
    responseDiv.innerHTML = '<p>Ocorreu um erro ao buscar a resposta. Tente novamente.</p>';
  }
});
