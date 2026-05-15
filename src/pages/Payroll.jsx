import React from 'react';
import { useData } from '../context/DataContext';
import { Users, AlertCircle } from 'lucide-react';

export default function Payroll() {
  const { transactions, branches } = useData();

  // Filter salaries
  const salaryTransactions = transactions.filter(t => t.category === 'משכורות');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>משכורות ושכר</h2>
          <p style={{ color: 'var(--text-secondary)' }}>ריכוז הוצאות שכר ועלויות מעביד לפי סניפים.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} className="text-primary" style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.95rem' }}>
            מודול זה מציג את הוצאות השכר שהוזנו במערכת. באפשרותך להוסיף רשומות שכר דרך מסך "הוצאות והלוואות" תחת הקטגוריה "משכורות".
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem', fontWeight: 500 }}>תאריך תשלום</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>סניף מקושר</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>תיאור (חודש משכורת)</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>עלות כוללת (ברוטו + מעביד)</th>
              </tr>
            </thead>
            <tbody>
              {salaryTransactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1rem' }}>{new Date(tx.date).toLocaleDateString('he-IL')}</td>
                  <td style={{ padding: '1rem' }}>{branches.find(b => b.id === Number(tx.branch_id))?.name || 'כללי'}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{tx.description}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-danger)' }}>
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
              {salaryTransactions.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    לא הוזנו נתוני שכר במערכת.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
