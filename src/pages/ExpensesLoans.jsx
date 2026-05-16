import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, CreditCard, ArrowDownRight, Search, PiggyBank, Briefcase, Trash2 } from 'lucide-react';
import LoanDetailsModal from '../components/LoanDetailsModal';

export default function ExpensesLoans() {
  const { transactions, branches, loans, addTransaction, addLoan, deleteTransaction } = useData();
  
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'loans'
  
  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Forms
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    branch_id: branches[0]?.id || '',
    category: 'שכירות',
    type: 'expense',
    description: ''
  });

  const [loanForm, setLoanForm] = useState({
    name: '',
    principal_amount: '',
    monthly_repayment: '',
    total_payments: '',
    start_date: new Date().toISOString().split('T')[0],
    billing_day: new Date().getDate().toString(), // יום בחודש
    branch_id: ''
  });

  const expenseTransactions = transactions.filter(t => t.type === 'expense' || t.type === 'loan_repayment');

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      ...expenseForm,
      amount: Number(expenseForm.amount),
    });
    setShowExpenseModal(false);
    setExpenseForm({ ...expenseForm, amount: '', description: '' });
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    const principal = Number(loanForm.principal_amount);
    const payments = Number(loanForm.total_payments);
    const monthly = Number(loanForm.monthly_repayment);
    
    const totalAmount = monthly * payments;
    const computedInterest = totalAmount - principal;

    if (computedInterest < 0) {
      alert('שגיאה: ההחזר החודשי שהוזן נמוך מדי ולא מכסה את סכום ההלוואה!');
      return;
    }

    await addLoan({
      ...loanForm,
      interest_amount: computedInterest
    });
    
    setShowLoanModal(false);
    setLoanForm({
      name: '',
      principal_amount: '',
      monthly_repayment: '',
      total_payments: '',
      start_date: new Date().toISOString().split('T')[0],
      billing_day: new Date().getDate().toString(),
      branch_id: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק תנועה זו?")) {
      deleteTransaction(id);
    }
  };

  // Helper to calculate loan progress for the cards
  const getLoanProgress = (loanId, totalWithInterest) => {
    const loanTxs = transactions.filter(t => t.loan_id === loanId);
    const now = new Date();
    const paidAmount = loanTxs.filter(t => new Date(t.date) < now).reduce((sum, t) => sum + Number(t.amount), 0);
    const progress = Math.min(100, Math.max(0, (paidAmount / totalWithInterest) * 100));
    return { paidAmount, progress };
  };

  return (
    <div className="animate-fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>הוצאות והלוואות</h2>
          <p style={{ color: 'var(--text-secondary)' }}>ניהול מעקב אחר הוצאות שוטפות, חובות והחזרי הלוואות.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            className="btn btn-outline flex items-center gap-2" 
            onClick={() => setShowLoanModal(true)}
            style={{ color: 'var(--accent-warning)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
          >
            <PiggyBank size={18} />
            הלוואה חדשה
          </button>
          <button 
            className="btn btn-primary flex items-center gap-2" 
            onClick={() => setShowExpenseModal(true)}
          >
            <Plus size={18} />
            הוצאה חדשה
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
        <button 
          className={`pb-2 px-4 ${activeTab === 'expenses' ? 'text-primary' : 'text-secondary'}`}
          style={{ borderBottom: activeTab === 'expenses' ? '2px solid var(--accent-primary)' : 'none', fontWeight: activeTab === 'expenses' ? 'bold' : 'normal' }}
          onClick={() => setActiveTab('expenses')}
        >
          <div className="flex items-center gap-2">
            <Briefcase size={18} />
            יומן הוצאות
          </div>
        </button>
        <button 
          className={`pb-2 px-4 ${activeTab === 'loans' ? 'text-warning' : 'text-secondary'}`}
          style={{ borderBottom: activeTab === 'loans' ? '2px solid var(--accent-warning)' : 'none', fontWeight: activeTab === 'loans' ? 'bold' : 'normal' }}
          onClick={() => setActiveTab('loans')}
        >
          <div className="flex items-center gap-2">
            <PiggyBank size={18} />
            ניהול הלוואות מורחב
          </div>
        </button>
      </div>

      {/* TAB: EXPENSES */}
      {activeTab === 'expenses' && (
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
                  <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'center' }}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {expenseTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                    <td style={{ padding: '1rem' }}>{new Date(tx.date).toLocaleDateString('he-IL')}</td>
                    <td style={{ padding: '1rem' }}>{branches.find(b => b.id === Number(tx.branch_id))?.name || 'כללי'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: tx.type === 'loan_repayment' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: tx.type === 'loan_repayment' ? 'var(--accent-warning)' : 'var(--accent-danger)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {tx.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {tx.type === 'loan_repayment' ? 'החזר הלוואה' : 'הוצאה שוטפת'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {tx.description}
                      {tx.loan_id && <span style={{fontSize: '0.8rem', display: 'block', color: 'var(--accent-warning)', opacity: 0.8}}>נוצר אוטומטית ע"י מערכת ההלוואות</span>}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-danger)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowDownRight size={16} />
                        {formatCurrency(tx.amount)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {tx.loan_id ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} title="למחיקת תשלום זה, עליך למחוק את ההלוואה ממסך ההלוואות">מקושר להלוואה</span>
                      ) : (
                        <button 
                          onClick={() => handleDeleteExpense(tx.id)}
                          className="hover:text-danger"
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
                          title="מחק הוצאה"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {expenseTransactions.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      לא נמצאו תנועות הוצאה.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LOANS */}
      {activeTab === 'loans' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {loans.length === 0 ? (
            <div className="py-12 text-center">
              <PiggyBank size={48} className="mx-auto mb-4 text-warning" style={{ opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>אין הלוואות פעילות</h3>
              <p style={{ color: 'var(--text-secondary)' }}>לחץ על "הלוואה חדשה" כדי להקים הלוואה ולייצר לוח סילוקין אוטומטי.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>שם הלוואה</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>קרן</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>סך ריבית</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>החזר חודשי</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>תשלומים</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>מועד חיוב</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>התקדמות</th>
                  <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'center' }}>פרטים</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => {
                  const totalAmount = Number(loan.principal_amount) + Number(loan.interest_amount);
                  const monthlyPayment = totalAmount / loan.total_payments;
                  const { paidAmount, progress } = getLoanProgress(loan.id, totalAmount);
                  return (
                    <tr
                      key={loan.id}
                      style={{ borderBottom: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'background 0.2s' }}
                      className="hover:bg-white/5"
                      onClick={() => setSelectedLoan(loan)}
                    >
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <PiggyBank size={16} className="text-warning" />
                          {loan.name}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{formatCurrency(loan.principal_amount)}</td>
                      <td style={{ padding: '1rem', color: 'var(--accent-warning)' }}>{formatCurrency(loan.interest_amount)}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-danger)' }}>{formatCurrency(monthlyPayment)}</td>
                      <td style={{ padding: '1rem' }}>{loan.total_payments} חודשים</td>
                      <td style={{ padding: '1rem' }}>
                        {loan.billing_day ? (
                          <span style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
                            יום {loan.billing_day} לחודש
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>לא הוגדר</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', minWidth: '120px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-success)' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)', minWidth: '35px' }}>{progress.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--accent-warning)', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedLoan(loan); }}
                        >
                          פרטים
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* --- MODALS --- */}
      
      {/* 1. Add Regular Expense Modal */}
      {showExpenseModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard className="text-danger" />
              הוספת הוצאה שוטפת
            </h3>
            
            <form onSubmit={handleExpenseSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">תאריך הוצאה</label>
                  <input type="date" className="form-control" required 
                    value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">סכום ההוצאה (₪)</label>
                  <input type="number" className="form-control" required min="1"
                    value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">שיוך לסניף/מטה</label>
                  <select className="form-control"
                    value={expenseForm.branch_id} onChange={e => setExpenseForm({...expenseForm, branch_id: e.target.value})}>
                    <option value="" style={{color: 'black'}}>כללי / מטה</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id} style={{color: 'black'}}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">קטגוריה</label>
                  <select className="form-control" required
                    value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}>
                    <option style={{color: 'black'}} value="שכירות">שכירות</option>
                    <option style={{color: 'black'}} value="ארנונה">ארנונה</option>
                    <option style={{color: 'black'}} value="חשמל/מים">חשמל ומים</option>
                    <option style={{color: 'black'}} value="משכורות">משכורות</option>
                    <option style={{color: 'black'}} value="מע״מ/מוסדות">מע״מ ומוסדות (מס הכנסה/ביטוח לאומי)</option>
                    <option style={{color: 'black'}} value="ספקים">תשלום לספקים</option>
                    <option style={{color: 'black'}} value="אחר">אחר</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">תיאור / הערות</label>
                <input type="text" className="form-control" required placeholder="למשל: תשלום ארנונה לחודש מאי..."
                  value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} />
              </div>

              <div className="flex justify-between mt-6">
                <button type="button" className="btn btn-outline" onClick={() => setShowExpenseModal(false)}>ביטול</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-danger)' }}>שמור הוצאה</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add New Loan Modal */}
      {showLoanModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-warning)' }}>
              <PiggyBank />
              הקמת הלוואה חדשה לתזרים
            </h3>
            <p className="text-secondary text-sm mb-6">המערכת תייצר אוטומטית פריסת תשלומים חודשית בטבלת ההוצאות ובתזרים המזומנים החל מתאריך ההתחלה ותחשב את הריבית.</p>
            
            <form onSubmit={handleLoanSubmit}>
              <div className="form-group">
                <label className="form-label">שם / תיאור ההלוואה</label>
                <input type="text" className="form-control" required placeholder="למשל: הלוואה להקמת סניף ירושלים (בנק לאומי)"
                  value={loanForm.name} onChange={e => setLoanForm({...loanForm, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">סכום ההלוואה (קרן ₪)</label>
                  <input type="number" className="form-control" required min="1" placeholder="100000"
                    value={loanForm.principal_amount} onChange={e => setLoanForm({...loanForm, principal_amount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">החזר חודשי (₪)</label>
                  <input type="number" className="form-control" required min="1" placeholder="5726"
                    value={loanForm.monthly_repayment} onChange={e => setLoanForm({...loanForm, monthly_repayment: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">מספר תשלומים (חודשים)</label>
                  <input type="number" className="form-control" required min="1" max="360" placeholder="60"
                    value={loanForm.total_payments} onChange={e => setLoanForm({...loanForm, total_payments: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">תאריך תשלום ראשון</label>
                  <input type="date" className="form-control" required 
                    value={loanForm.start_date} onChange={e => setLoanForm({...loanForm, start_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">מועד חיוב (יום בחודש)</label>
                  <input type="number" className="form-control" required min="1" max="31" placeholder="10"
                    value={loanForm.billing_day} onChange={e => setLoanForm({...loanForm, billing_day: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">שיוך לסניף (אופציונלי)</label>
                <select className="form-control"
                  value={loanForm.branch_id} onChange={e => setLoanForm({...loanForm, branch_id: e.target.value})}>
                  <option value="" style={{color: 'black'}}>ללא שיוך - הלוואת חברה כללית</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id} style={{color: 'black'}}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Summary Box */}
              {loanForm.principal_amount && loanForm.total_payments && loanForm.monthly_repayment && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-secondary">סך הכל החזר לבנק:</span>
                    <span style={{ fontWeight: 'bold' }}>
                      {formatCurrency(Number(loanForm.monthly_repayment) * Number(loanForm.total_payments))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">סך ריבית שיחושב:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-warning)' }}>
                      {formatCurrency((Number(loanForm.monthly_repayment) * Number(loanForm.total_payments)) - Number(loanForm.principal_amount))}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button type="button" className="btn btn-outline" onClick={() => setShowLoanModal(false)}>ביטול</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-warning)', color: 'black', fontWeight: 'bold' }}>הקם הלוואה ולוח סילוקין</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Drill-down Loan Details */}
      {selectedLoan && (
        <LoanDetailsModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
      )}

    </div>
  );
}
