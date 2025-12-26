import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Translator from './components/Translator';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'translator'
  const [user, setUser] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setCurrentView('translator');
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('translator');
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setCurrentView('translator');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('login');
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  // Afficher la vue appropriée
  if (currentView === 'translator' && user) {
    return <Translator user={user} onLogout={handleLogout} />;
  }

  if (currentView === 'register') {
    return (
      <Register 
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={switchToLogin}
      />
    );
  }

  return (
    <Login 
      onLoginSuccess={handleLoginSuccess}
      onSwitchToRegister={switchToRegister}
    />
  );
}

export default App;