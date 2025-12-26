import { useState, useEffect, useRef } from 'react';
import './Translator.css';

const translateText = async (text) => {
  const response = await fetch('http://localhost:8000/api/translator/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return response.json();
};

const checkHealth = async () => {
  const response = await fetch('http://localhost:8000/api/translator/health');
  return response.json();
};

export default function Translator({ user, onLogout }) {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  
  const [isListening, setIsListening] = useState(false);
  const [isPlayingInput, setIsPlayingInput] = useState(false);
  const [isPlayingOutput, setIsPlayingOutput] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    checkServerHealth();
    initializeSpeechRecognition();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    };
  }, []);

  const checkServerHealth = async () => {
    try {
      await checkHealth();
      setServerStatus('connected');
    } catch (err) {
      setServerStatus('disconnected');
    }
  };

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      setSpeechSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      setNetworkError(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => (prev + ' ' + transcript).trim());
      
      if (isListening) {
        setTimeout(() => {
          try {
            if (recognitionRef.current && isListening) {
              recognitionRef.current.start();
            }
          } catch (err) {
            console.log('Auto-restart stopped');
          }
        }, 500);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        if (isListening) {
          setTimeout(() => {
            try {
              if (recognitionRef.current) {
                recognitionRef.current.start();
              }
            } catch (err) {
              console.log('Restart failed');
            }
          }, 500);
        }
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Click the camera/microphone icon in your browser address bar to allow access.');
        setSpeechSupported(false);
      } else if (event.error === 'network') {
        setNetworkError(true);
        setError('Network error. Speech recognition requires internet. Please check your connection or use the text input instead.');
      } else if (event.error === 'audio-capture') {
        setError('No microphone found. Please connect a microphone and refresh the page.');
        setSpeechSupported(false);
      } else if (event.error === 'service-not-allowed') {
        setError('Speech service blocked. Please check your browser settings or use another browser (Chrome/Edge recommended).');
        setSpeechSupported(false);
      } else if (event.error !== 'aborted') {
        setError(`Speech error: ${event.error}. Try typing your text instead.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (!navigator.onLine) {
        setError('📡 No internet connection detected. Speech recognition requires internet. Please connect and try again.');
        setNetworkError(true);
        return;
      }

      try {
        setNetworkError(false);
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        if (err.message && err.message.includes('already started')) {
          recognitionRef.current.stop();
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {
              setError('🔄 Failed to restart. Please refresh the page and try again.');
            }
          }, 200);
        } else {
          setError('⚠️ Cannot start voice input. Please check your microphone permissions.');
        }
      }
    }
  };

  const speakText = (text, language = 'en-US') => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech not supported in this browser.');
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      if (language.startsWith('en')) {
        setIsPlayingInput(true);
      } else {
        setIsPlayingOutput(true);
      }
    };

    utterance.onend = () => {
      setIsPlayingInput(false);
      setIsPlayingOutput(false);
    };

    utterance.onerror = (e) => {
      console.error('TTS error:', e);
      setIsPlayingInput(false);
      setIsPlayingOutput(false);
      setError('Text-to-speech failed.');
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlayingInput(false);
      setIsPlayingOutput(false);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to translate');
      return;
    }

    setLoading(true);
    setError('');
    setTranslatedText('');

    try {
      const result = await translateText(inputText);
      setTranslatedText(result.translatedText || result.translation || 'Translation not available');
    } catch (err) {
      setError('Translation failed. Check if backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setError('');
    stopSpeaking();
    if (isListening) {
      recognitionRef.current?.stop();
    }
  };

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleTranslate();
    }
  };

  return (
    <div className="translator-page">
      <nav className="translator-navbar">
        <div className="navbar-left">
          <div className="navbar-logo">
            <span className="logo-icon">🇲🇦</span>
            <div className="navbar-title">
              <div className="title-main">Darija Translator</div>
              <div className="title-sub">English → Moroccan Arabic</div>
            </div>
          </div>
        </div>
        <div className="navbar-right">
          <div className="server-status">
            <span className={`status-dot status-${serverStatus}`}></span>
            <span>
              {serverStatus === 'connected' ? 'Connected' : 
               serverStatus === 'disconnected' ? 'Offline' : 'Checking...'}
            </span>
          </div>
          <div className="user-menu">
            <div className="user-avatar">👤</div>
            <span className="user-name">{user?.username || 'User'}</span>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="translator-main">
        <div className="translator-left">
          <div className="card input-section">
            <div className="card-header">
              <h2 className="card-title">
                <span className="section-icon">🖹</span>
                Input Text
              </h2>
              <div className="input-controls">
                {speechSupported && (
                  <button
                    className={`control-button ${isListening ? 'active' : ''} ${networkError ? 'disabled' : ''}`}
                    onClick={toggleListening}
                    disabled={networkError}
                    title={isListening ? 'Stop Listening' : 'Start Voice Input'}
                  >
                    {isListening ? '⏹️ Stop' : '🎙️ Voice'}
                  </button>
                )}
                {!speechSupported && (
                  <span className="voice-disabled-badge">🎙️ Voice unavailable</span>
                )}
                {inputText && (
                  <button
                    className="control-button"
                    onClick={() => isPlayingInput ? stopSpeaking() : speakText(inputText, 'en-US')}
                  >
                    {isPlayingInput ? '⏸️ Stop' : '🔊 Listen'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="textarea-wrapper">
              <textarea
                className="main-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={speechSupported && !networkError 
                  ? "Type your English text here, or use voice input..." 
                  : "Type your English text here..."}
                rows={8}
              />
              <div className="char-counter">{inputText.length} characters</div>
            </div>

            <div className="action-buttons">
              <button
                className="primary-button"
                onClick={handleTranslate}
                disabled={loading || !inputText.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Translating...
                  </>
                ) : (
                  <>Translate</>
                )}
              </button>
              <button className="secondary-button" onClick={handleClear}>
                Clear
              </button>
            </div>

            <div className="keyboard-hint">
              Press <kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">Enter</kbd> to translate
            </div>
          </div>

          <div className="card examples-card">
            <h3 className="examples-title">Quick Examples</h3>
            <div className="examples-grid">
              {[
                "Hello, how are you?",
                "Good morning!",
                "What is your name?",
                "Thank you very much",
                "Where is the market?",
                "I don't understand"
              ].map((example, index) => (
                <button
                  key={index}
                  className="example-item"
                  onClick={() => setInputText(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="translator-right">
          {error && (
            <div className="alert-box alert-error">
              <span className="alert-icon">⚠️</span>
              <strong>Error:</strong> {error}
            </div>
          )}

          {translatedText ? (
            <div className="card output-section">
              <div className="card-header">
                <h2 className="card-title">
                  <span className="section-icon">🇲🇦</span>
                  Darija Translation
                </h2>
                <div className="input-controls">
                  <button
                    className="control-button"
                    onClick={() => isPlayingOutput ? stopSpeaking() : speakText(translatedText, 'ar-SA')}
                  >
                    {isPlayingOutput ? '⏸️ Stop' : '🔊 Listen'}
                  </button>
                  <button 
                    className="copy-button"
                    onClick={() => {
                      navigator.clipboard.writeText(translatedText);
                      alert('Copied to clipboard!');
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              <div className="output-box">
                {translatedText}
              </div>
              <div className="output-footer">
                <span>Translation completed</span>
              </div>
            </div>
          ) : (
            <div className="alert-box alert-info">
              Enter text and click <strong>Translate</strong> to see your Darija translation here.
            </div>
          )}

          <div className="card features-card">
            <h3 className="features-title">
              <span>🎙️</span>
              Voice Features
            </h3>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon"></span>
                <div className="feature-content">
                  <div className="feature-title">Voice Input</div>
                  <div className="feature-description">
                    Speak naturally and see your words appear in real-time
                  </div>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <div className="feature-content">
                  <div className="feature-title">Text-to-Speech</div>
                  <div className="feature-description">
                    Listen to both input and translation with natural voices
                  </div>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <div className="feature-content">
                  <div className="feature-title">Real-time Processing</div>
                  <div className="feature-description">
                    Get instant translations as you type or speak
                  </div>
                </div>
              </div>
            </div>

            {networkError && (
              <div className="network-warning">
                <h4>⚠️ Voice Input Temporarily Unavailable</h4>
                <p>Speech recognition requires an active internet connection. Please:</p>
                <ul>
                  <li>✓ Check your internet connection</li>
                  <li>✓ Try refreshing the page</li>
                  <li>✓ Use text input in the meantime</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}