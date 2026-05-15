import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Landmark, ArrowUpRight, Search } from 'lucide-react';

export default function IncomeBank() {
  const { transactions, branches, addTransaction } = useData();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    branch_id: branches[0]?.id || '',
    category: 'מכר חודשי',
    description: ''
  });

  const incomeTransactions = transactions.filter(t => t.type === 'income');

  const handleSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      ...formData,
      amount: Number(formData.amount),
      type: 'income'
    });
    setShowModal(false);
    setFormData({ ...formData, amount: '', description: '' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>תנועות בנק והכנסות</h2>
          <p style={{ color: 'var(--text-secondary)' }}>ניהול מעקב אחר הכנסות, הפקדות ותנועות זכות.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          הוסף הכנסה / תנועה
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="חיפוש לפי תיאור או קטגוריה..." 
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem', fontWeight: 500 }}>תאריך</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>סניף / משייך</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>קטגוריה</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>תיאור (אסמכתא)</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>סכום</th>
              </tr>
            </thead>
            <tbody>
              {incomeTransactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                  <td style={{ padding: '1rem' }}>{new Date(tx.date).toLocaleDateString('he-IL')}</td>
                  <td style={{ padding: '1rem' }}>{branches.find(b => b.id === Number(tx.branch_id))?.name || 'כללי'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {tx.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{tx.description}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowUpRight size={16} />
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
              {incomeTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    לא נמצאו תנועות הכנסה.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Landmark className="text-success" />
              הוספת תנועת זכות / הכנסה
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">תאריך התנועה</label>
                  <input type="date" className="form-control" required 
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">סכום (₪)</label>
                  <input type="number" className="form-control" required min="1"
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">שיוך לסניף</label>
                  <select className="form-control" required
                    value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})}>
                    {branches.map(b => (
                      <option key={b.id} value={b.id} style={{color: 'black'}}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">קטגוריה</label>
                  <select className="form-control" required
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option style={{color: 'black'}} value="מכר חודשי">מכר חודשי</option>
                    <option style={{color: 'black'}} value="הלוואת בעלים">הלוואת בעלים</option>
                    <option style={{color: 'black'}} value="החזר מס/ביטוח">החזר מוסדות</option>
                    <option style={{color: 'black'}} value="אחר">אחר</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">תיאור / הערות</label>
                <input type="text" className="form-control" required placeholder="למשל: הפקדת מזומן, העברה מלקוח..."
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex justify-between mt-6">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>ביטול</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-success)' }}>שמור הכנסה</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
