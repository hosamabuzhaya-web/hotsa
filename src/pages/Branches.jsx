import React from 'react';
import { useData } from '../context/DataContext';
import { Building2, TrendingUp, TrendingDown, Store } from 'lucide-react';

export default function Branches() {
  const { branches, transactions } = useData();

  const getBranchStats = (branchId) => {
    const branchTxs = transactions.filter(t => t.branch_id === branchId);
    const income = branchTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = branchTxs.filter(t => t.type === 'expense' || t.type === 'loan_repayment').reduce((sum, t) => sum + t.amount, 0);
    const profit = income - expense;
    const margin = income > 0 ? ((profit / income) * 100).toFixed(1) : 0;
    
    return { income, expense, profit, margin };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>רווחיות סניפים (P&L)</h2>
          <p style={{ color: 'var(--text-secondary)' }}>מעקב אחר רווחיות, הכנסות והוצאות לכל סניף בנפרד.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {branches.map(branch => {
          const stats = getBranchStats(branch.id);
          const isProfitable = stats.profit >= 0;

          return (
            <div key={branch.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px' }}>
                    {branch.type === 'hq' ? <Building2 size={24} className="text-gradient" /> : <Store size={24} className="text-gradient" />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{branch.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {branch.type === 'hq' ? 'מטה הנהלה' : 'סניף מכירות'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>הכנסות</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-success)' }}>{formatCurrency(stats.income)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>הוצאות (כולל שכר)</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-danger)' }}>{formatCurrency(stats.expense)}</span>
                </div>

                <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
                  <span style={{ fontWeight: 'bold' }}>רווח נקי</span>
                  <div className="flex items-center gap-2">
                    {isProfitable ? <TrendingUp size={16} className="text-success" /> : <TrendingDown size={16} className="text-danger" />}
                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: isProfitable ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                      {formatCurrency(stats.profit)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>שולי רווח</span>
                  <span style={{ 
                    background: isProfitable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: isProfitable ? 'var(--accent-success)' : 'var(--accent-danger)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    {stats.margin}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
