import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">QuickNotes</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {isRegisterMode ? <UserPlus size={16} /> : <LogIn size={16} />}
            {loading 
              ? (isRegisterMode ? 'Creating account...' : 'Signing in...') 
              : (isRegisterMode ? 'Create Account' : 'Sign In')
            }
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
              setEmail('');
              setPassword('');
            }}
            className="btn btn-secondary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {isRegisterMode ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>
        </div>

        {!isRegisterMode && (
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
            <p>Demo credentials:</p>
            <p><strong>Email:</strong> test@example.com</p>
            <p><strong>Password:</strong> Passw0rd!</p>
          </div>
        )}
      </div>
    </div>
  );
}
