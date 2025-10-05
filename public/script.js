const form = document.getElementById('question-form');
const responseDiv = document.getElementById('response');

const API_URL = '/ask';


function askQuestion(mode) {
  const question = document.getElementById('question').value.trim();

  if (!question) {
    Toastify({
      text: "Por favor, insira uma pergunta!",
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "red",
    }).showToast();
    return;
  }

  responseDiv.innerHTML = '<p>Aguarde, estamos buscando a resposta...</p>';

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, mode }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        responseDiv.innerHTML = formatResponse(data.answer);
        showCopyButton(); // Exibe o botão de copiar
      } else {
        responseDiv.innerHTML = `<p>Erro: ${data.error}</p>`;
      }
    })
    .catch(error => {
      responseDiv.innerHTML = '<p>Ocorreu um erro ao buscar a resposta. Tente novamente.</p>';
    });
}

function formatResponse(response) {
  if (!response) return '<p>Erro ao processar a resposta.</p>';
  let formatted = response.replace(/\*\*(.*?)\*\*/g, '<br><br><strong>$1</strong>');
  formatted = formatted.replace(/(\d\.)/g, '<br><br>$1');

  return `<p>${formatted.trim()}</p>`;
}

function copyToClipboard() {
  const responseText = document.getElementById('response').innerText;

  if (!responseText.trim()) {
    Toastify({
      text: "Nada para copiar!",
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "red",
    }).showToast();
    return;
  }

  navigator.clipboard.writeText(responseText).then(() => {
    Toastify({
      text: "Resposta copiada para a área de transferência! 📋",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "#4CAF50",
    }).showToast();
  });
}


// Exibir botão quando houver resposta
function showCopyButton() {
  document.getElementById('copyButton').classList.remove('hidden');
}

function saveToHistory(question, answer) {
  let history = JSON.parse(localStorage.getItem('history')) || [];
  history.push({ question, answer });

  // Mantém apenas as últimas 10 perguntas no histórico
  if (history.length > 10) {
    history.shift();
  }

  localStorage.setItem('history', JSON.stringify(history));

  // Atualiza a interface do histórico
  loadHistory();
}

/**
 * Carrega o histórico armazenado e exibe na tela.
 */
// function loadHistory() {
//   let history = JSON.parse(localStorage.getItem('history')) || [];
//   const historyList = document.getElementById('historyList');

//   // Limpa a lista antes de renderizar
//   historyList.innerHTML = '';

//   history.forEach((item, index) => {
//     let listItem = document.createElement('li');
//     listItem.innerHTML = `<strong>Pergunta:</strong> ${item.question} <br> <strong>Resposta:</strong> ${item.answer}`;
//     historyList.appendChild(listItem);
//   });
// }

// // Chama a função ao carregar a página
// document.addEventListener('DOMContentLoaded', loadHistory);