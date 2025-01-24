const form = document.getElementById('question-form');
const responseDiv = document.getElementById('response');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const question = document.getElementById('question').value.trim();
  if (!question) return;

  // Mostra um feedback enquanto espera a resposta
  responseDiv.textContent = 'Aguarde, estamos buscando a resposta...';

  try {
    const response = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ question }),
    });

    const data = await response.json();
    if (data.success) {
      responseDiv.textContent = `Resposta: ${data.answer}`;
    } else {
      responseDiv.textContent = `Erro: ${data.message}`;
    }
  } catch (error) {
    responseDiv.textContent = 'Ocorreu um erro ao buscar a resposta. Tente novamente.';
  }
});
