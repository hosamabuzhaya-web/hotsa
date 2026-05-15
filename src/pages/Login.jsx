import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('פרטי התחברות שגויים או שאין לך הרשאה.');
      setLoading(false);
    } else if (data.user) {
      onLogin(data.user);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-panel login-card animate-fade-in">
        <div className="login-header">
          <div className="flex justify-center mb-4">
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <ShieldCheck size={48} className="text-gradient" />
            </div>
          </div>
          <h1>HOTSA Secure</h1>
          <p>ניהול תזרים והוצאות - גישה מאובטחת</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--accent-danger)'
          }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label flex items-center" style={{ gap: '0.5rem' }}>
              <Mail size={16} /> אימייל מורשה
            </label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label flex items-center" style={{ gap: '0.5rem' }}>
              <Lock size={16} /> סיסמה
            </label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '0.875rem' }}
            disabled={loading}
          >
            {loading ? 'מאמת נתונים...' : 'התחבר למערכת'}
          </button>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            מוגן באמצעות טכנולוגיית הצפנה 256-bit ו-Row Level Security (RLS).
          </div>
        </form>
      </div>
    </div>
  );
}
