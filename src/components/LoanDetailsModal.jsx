import React from 'react';
import { useData } from '../context/DataContext';
import { X, TrendingUp, DollarSign, Calendar, CreditCard, PiggyBank, Trash2 } from 'lucide-react';

export default function LoanDetailsModal({ loan, onClose }) {
  const { transactions, deleteLoan } = useData();

  if (!loan) return null;

  // Filter the transactions related specifically to this loan
  const loanTxs = transactions.filter(t => t.loan_id === loan.id).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Calculate stats based on transactions
  const now = new Date();
  
  // A transaction is considered paid if its date is in the past
  const paidTxs = loanTxs.filter(t => new Date(t.date) < now);
  const futureTxs = loanTxs.filter(t => new Date(t.date) >= now);

  const amountPaid = paidTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  const amountRemaining = futureTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalAmountWithInterest = Number(loan.principal_amount) + Number(loan.interest_amount);
  
  // If transactions are missing or messed up, fallback to basic math:
  const displayAmountPaid = loanTxs.length > 0 ? amountPaid : 0;
  const displayAmountRemaining = loanTxs.length > 0 ? amountRemaining : totalAmountWithInterest;
  const progressPercent = Math.min(100, Math.max(0, (displayAmountPaid / totalAmountWithInterest) * 100)).toFixed(1);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
  };

  const handleDelete = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק הלוואה זו? מחיקת ההלוואה תמחק את כל התשלומים העתידיים שלה מהתזרים.')) {
      deleteLoan(loan.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
      <div className="glass-panel w-full max-w-3xl" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6" style={{ borderBottom: '1px solid var(--border-glass)' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PiggyBank className="text-warning" />
              {loan.name}
            </h2>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                תחילת ההלוואה: {new Date(loan.start_date).toLocaleDateString('he-IL')}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>•</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {loan.total_payments} תשלומים
              </span>
              {loan.billing_day && (
                <>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>•</span>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    מועד חיוב: יום {loan.billing_day} לחודש
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDelete} className="btn btn-outline" style={{ color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' }}>
              <Trash2 size={18} />
              מחק הלוואה
            </button>
            <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ flex: 1 }}>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div className="flex justify-between items-center mb-2">
                <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>סכום קרן (ללא ריבית)</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{formatCurrency(loan.principal_amount)}</div>
            </div>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div className="flex justify-between items-center mb-2">
                <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>סך ריבית לתשלום</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-warning)' }}>{formatCurrency(loan.interest_amount)}</div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div className="flex justify-between items-center mb-2">
                <span style={{ color: 'var(--accent-danger)', fontWeight: 'bold' }}>החזר חודשי משוער</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-danger)' }}>
                {formatCurrency(totalAmountWithInterest / loan.total_payments)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 p-6" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div className="flex justify-between items-center mb-3">
              <span style={{ fontWeight: 'bold' }}>התקדמות החזר ההלוואה</span>
              <span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>{progressPercent}% שולם</span>
            </div>
            
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-success)', transition: 'width 1s ease-in-out' }}></div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div style={{ color: 'var(--accent-success)' }}>
                <strong>שולם עד כה:</strong> {formatCurrency(displayAmountPaid)}
              </div>
              <div style={{ color: 'var(--accent-danger)' }}>
                <strong>יתרה לסילוק:</strong> {formatCurrency(displayAmountRemaining)}
              </div>
            </div>
          </div>

          {/* Payment Schedule (לוח סילוקין) */}
          <div>
            <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: '1.2rem' }}>
              <Calendar className="text-primary" />
              לוח סילוקין (תשלומים שנוצרו)
            </h3>
            
            {loanTxs.length === 0 ? (
              <div className="text-secondary py-4 text-center bg-black/20 rounded-lg">לא נמצאו תנועות מקושרות להלוואה זו.</div>
            ) : (
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#0a0a0f', zIndex: 1 }}>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.75rem', fontWeight: 500 }}>מס' תשלום</th>
                      <th style={{ padding: '0.75rem', fontWeight: 500 }}>תאריך תשלום</th>
                      <th style={{ padding: '0.75rem', fontWeight: 500 }}>סכום</th>
                      <th style={{ padding: '0.75rem', fontWeight: 500 }}>סטטוס</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loanTxs.map((tx, index) => {
                      const isPaid = new Date(tx.date) < now;
                      return (
                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-glass)', opacity: isPaid ? 0.6 : 1 }}>
                          <td style={{ padding: '0.75rem' }}>{index + 1}</td>
                          <td style={{ padding: '0.75rem' }}>{new Date(tx.date).toLocaleDateString('he-IL')}</td>
                          <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{formatCurrency(tx.amount)}</td>
                          <td style={{ padding: '0.75rem' }}>
                            {isPaid ? (
                              <span style={{ color: 'var(--accent-success)', fontSize: '0.85rem' }}>שולם</span>
                            ) : (
                              <span style={{ color: 'var(--accent-warning)', fontSize: '0.85rem' }}>עתידי</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
