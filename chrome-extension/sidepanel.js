const API_URL = 'http://localhost:8000/api/translator/translate';
const AUTH_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

const inputText = document.getElementById('inputText');
const translateBtn = document.getElementById('translateBtn');
const clearBtn = document.getElementById('clearBtn');
const btnText = document.getElementById('btnText');
const errorDiv = document.getElementById('error');
const resultSection = document.getElementById('resultSection');
const translatedText = document.getElementById('translatedText');
const statusText = document.querySelector('.status span:last-child');

translateBtn.addEventListener('click', handleTranslate);
clearBtn.addEventListener('click', handleClear);

// Permettre Ctrl+Enter pour traduire
inputText.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    handleTranslate();
  }
});


async function handleTranslate() {
  const text = inputText.value.trim();
  
  if (!text) {
    showError('Please enter some text to translate');
    return;
  }

  // UI Loading state
  translateBtn.disabled = true;
  btnText.textContent = 'Translating...';
  hideError();
  hideResult();
  updateStatus('Translating...', 'warning');

  try {
    const result = await translateText(text);
    showResult(result.translatedText);
    updateStatus('Translation complete', 'success');
  } catch (error) {
    showError('Translation failed. Make sure the backend server is running.');
    updateStatus('Error', 'error');
    console.error('Translation error:', error);
  } finally {
    translateBtn.disabled = false;
    btnText.textContent = 'Translate';
  }
}

async function translateText(text) {
  const credentials = btoa(`${AUTH_CREDENTIALS.username}:${AUTH_CREDENTIALS.password}`);
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`
    },
    body: JSON.stringify({
      text: text,
      sourceLang: 'en',
      targetLang: 'darija'
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

function handleClear() {
  inputText.value = '';
  hideError();
  hideResult();
  updateStatus('Ready', 'success');
  inputText.focus();
}

function showError(message) {
  errorDiv.textContent = '⚠️ ' + message;
  errorDiv.style.display = 'block';
}

function hideError() {
  errorDiv.style.display = 'none';
}

function showResult(text) {
  translatedText.textContent = text;
  resultSection.style.display = 'block';
}

function hideResult() {
  resultSection.style.display = 'none';
}

function updateStatus(text, type = 'success') {
  statusText.textContent = text;
  const dot = document.querySelector('.status-dot');
  
  const colors = {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336'
  };
  
  dot.style.background = colors[type] || colors.success;
}

// Vérifier la connexion au démarrage
async function checkConnection() {
  try {
    const response = await fetch('http://localhost:8000/api/translator/health');
    if (response.ok) {
      updateStatus('Connected', 'success');
    }
  } catch (error) {
    updateStatus('Backend offline', 'error');
  }
}

checkConnection();