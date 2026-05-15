import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IncomeBank from './pages/IncomeBank';
import ExpensesLoans from './pages/ExpensesLoans';
import Branches from './pages/Branches';
import Payroll from './pages/Payroll';
import Forecasting from './pages/Forecasting';
import { 
  LayoutDashboard, 
  Wallet, 
  Building2, 
  CreditCard, 
  Landmark, 
  Users, 
  TrendingUp,
  LogOut,
  Settings
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>טוען נתונים מאובטחים...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'income':
        return <IncomeBank />;
      case 'expenses':
        return <ExpensesLoans />;
      case 'branches':
        return <Branches />;
      case 'payroll':
        return <Payroll />;
      case 'forecasting':
        return <Forecasting />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
        <div className="sidebar-header">
          <Wallet className="text-gradient" size={28} />
          HOTSA
        </div>
        
        <nav className="sidebar-nav">
          <div className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>
            <LayoutDashboard size={20} />
            <span>דשבורד מנהלים</span>
          </div>
          
          <div className={`nav-item ${activePage === 'income' ? 'active' : ''}`} onClick={() => setActivePage('income')}>
            <Landmark size={20} />
            <span>בנק והכנסות</span>
          </div>
          
          <div className={`nav-item ${activePage === 'expenses' ? 'active' : ''}`} onClick={() => setActivePage('expenses')}>
            <CreditCard size={20} />
            <span>הוצאות והלוואות</span>
          </div>
          
          <div className={`nav-item ${activePage === 'branches' ? 'active' : ''}`} onClick={() => setActivePage('branches')}>
            <Building2 size={20} />
            <span>רווחיות סניפים</span>
          </div>
          
          <div className={`nav-item ${activePage === 'payroll' ? 'active' : ''}`} onClick={() => setActivePage('payroll')}>
            <Users size={20} />
            <span>משכורות</span>
          </div>
          
          <div className={`nav-item ${activePage === 'forecasting' ? 'active' : ''}`} onClick={() => setActivePage('forecasting')}>
            <TrendingUp size={20} className="text-success" />
            <span>תכנון תזרים עתידי</span>
          </div>
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
          <div className="flex items-center justify-between">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              מחובר כ:<br/>
              <strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-outline" 
              style={{ padding: '0.5rem', borderRadius: '8px' }}
              title="התנתק"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="flex items-center gap-4">
            <h2 style={{ margin: 0 }}>
              {activePage === 'dashboard' && 'דשבורד פיננסי מרכזי'}
              {activePage === 'income' && 'בנק והכנסות'}
              {activePage === 'expenses' && 'הוצאות, חובות והלוואות'}
              {activePage === 'branches' && 'רווחיות סניפים (P&L)'}
              {activePage === 'payroll' && 'ניהול שכר ומשכורות'}
              {activePage === 'forecasting' && 'תכנון תזרים מזומנים עתידי'}
            </h2>
            <span style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: 'var(--accent-success)', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '0.75rem',
              fontWeight: 'bold',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              מאובטח RLS
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="page-content">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
