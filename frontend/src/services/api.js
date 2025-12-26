const API_BASE_URL = 'http://localhost:8000/api';

export async function register(username, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    return await response.json();
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

export async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function verifyToken(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify?token=${token}`);
    return await response.json();
  } catch (error) {
    console.error('Verify token error:', error);
    throw error;
  }
}

export async function translateText(text) {
  try {
    const response = await fetch(`${API_BASE_URL}/translator/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/translator/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
}

export async function getLanguages() {
  try {
    const response = await fetch(`${API_BASE_URL}/translator/languages`);
    return await response.json();
  } catch (error) {
    console.error('Get languages error:', error);
    throw error;
  }
}