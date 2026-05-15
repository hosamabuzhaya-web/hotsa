import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, CreditCard, ArrowDownRight, Search } from 'lucide-react';

export default function ExpensesLoans() {
  const { transactions, branches, addTransaction } = useData();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    branch_id: branches[0]?.id || '',
    category: 'שכירות',
    type: 'expense', // or 'loan_repayment'
    description: ''
  });

  const expenseTransactions = transactions.filter(t => t.type === 'expense' || t.type === 'loan_repayment');

  const handleSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      ...formData,
      amount: Number(formData.amount),
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
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>הוצאות והלוואות</h2>
          <p style={{ color: 'var(--text-secondary)' }}>ניהול מעקב אחר הוצאות שוטפות, חובות והחזרי הלוואות.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          הוסף הוצאה / הלוואה
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="חיפוש הוצאה..." 
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
                <th style={{ padding: '1rem', fontWeight: 500 }}>סוג הוצאה</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>תיאור (אסמכתא)</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>סכום</th>
              </tr>
            </thead>
            <tbody>
              {expenseTransactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                  <td style={{ padding: '1rem' }}>{new Date(tx.date).toLocaleDateString('he-IL')}</td>
                  <td style={{ padding: '1rem' }}>{branches.find(b => b.id === Number(tx.branch_id))?.name || 'כללי'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {tx.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {tx.type === 'loan_repayment' ? 'החזר הלוואה' : 'הוצאה שוטפת'}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{tx.description}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowDownRight size={16} />
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
              {expenseTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    לא נמצאו תנועות הוצאה.
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
              <CreditCard className="text-danger" />
              הוספת הוצאה / החזר הלוואה
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">תאריך הוצאה</label>
                  <input type="date" className="form-control" required 
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">סכום ההוצאה (₪)</label>
                  <input type="number" className="form-control" required min="1"
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">סוג תנועה</label>
                  <select className="form-control" required
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option style={{color: 'black'}} value="expense">הוצאה שוטפת/קבועה</option>
                    <option style={{color: 'black'}} value="loan_repayment">החזר הלוואה (בנק)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">שיוך לסניף/מטה</label>
                  <select className="form-control" required
                    value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})}>
                    {branches.map(b => (
                      <option key={b.id} value={b.id} style={{color: 'black'}}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">קטגוריה</label>
                <select className="form-control" required
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option style={{color: 'black'}} value="שכירות">שכירות</option>
                  <option style={{color: 'black'}} value="ארנונה">ארנונה</option>
                  <option style={{color: 'black'}} value="חשמל/מים">חשמל ומים</option>
                  <option style={{color: 'black'}} value="הלוואות בנק">הלוואות בנק</option>
                  <option style={{color: 'black'}} value="מע״מ/מוסדות">מע״מ ומוסדות (מס הכנסה/ביטוח לאומי)</option>
                  <option style={{color: 'black'}} value="ספקים">תשלום לספקים</option>
                  <option style={{color: 'black'}} value="אחר">אחר</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">תיאור / הערות</label>
                <input type="text" className="form-control" required placeholder="למשל: תשלום ארנונה לחודש מאי, צ'ק..."
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex justify-between mt-6">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>ביטול</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-danger)' }}>שמור הוצאה</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
