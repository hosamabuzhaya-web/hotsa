import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  TrendingUp, TrendingDown, Percent, Activity,
  Building2, Store, ChevronDown, ChevronUp, ArrowDownRight, ArrowUpRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Dashboard() {
  const { transactions, branches, getDashboardStats } = useData();
  const [expandedBranch, setExpandedBranch] = useState(null);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);

  // ─── Per-branch P&L ───────────────────────────────────────────────────────
  const getBranchStats = (branchId) => {
    const txs = transactions.filter(t => Number(t.branch_id) === Number(branchId));
    const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = txs.filter(t => t.type === 'expense' || t.type === 'loan_repayment').reduce((s, t) => s + Number(t.amount), 0);
    const profit  = income - expense;
    const margin  = income > 0 ? ((profit / income) * 100).toFixed(1) : 0;
    return { income, expense, profit, margin };
  };

  // ─── Company-level (no branch) general expenses ───────────────────────────
  const generalExpenses = transactions
    .filter(t => !t.branch_id && (t.type === 'expense' || t.type === 'loan_repayment'))
    .reduce((s, t) => s + Number(t.amount), 0);

  const generalIncome = transactions
    .filter(t => !t.branch_id && t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);

  // ─── Consolidated company totals ──────────────────────────────────────────
  const branchStats = branches.map(b => ({ ...b, stats: getBranchStats(b.id) }));
  const totalBranchProfit = branchStats.reduce((s, b) => s + b.stats.profit, 0);
  const companyNetProfit  = totalBranchProfit + generalIncome - generalExpenses;
  const totalIncome       = branchStats.reduce((s, b) => s + b.stats.income, 0) + generalIncome;
  const totalExpenses     = branchStats.reduce((s, b) => s + b.stats.expense, 0) + generalExpenses;
  const profitMargin      = totalIncome > 0 ? ((companyNetProfit / totalIncome) * 100).toFixed(1) : 0;

  // ─── Bar chart data (branches comparison) ─────────────────────────────────
  const barData = branchStats.map(b => ({
    name: b.name,
    הכנסות: b.stats.income,
    הוצאות: b.stats.expense,
    רווח:   b.stats.profit,
  }));

  // ─── Expense breakdown pie ─────────────────────────────────────────────────
  const expCat = {};
  transactions
    .filter(t => t.type === 'expense' || t.type === 'loan_repayment')
    .forEach(t => { expCat[t.category || 'אחר'] = (expCat[t.category || 'אחר'] || 0) + Number(t.amount); });
  const pieData = Object.entries(expCat).map(([name, value]) => ({ name, value }));
  const COLORS  = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const isProfit = companyNetProfit >= 0;

  return (
    <div className="animate-fade-in">

      {/* ── TOP KPI CARDS ── */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: `3px solid ${isProfit ? 'var(--accent-success)' : 'var(--accent-danger)'}` }}>
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>רווח נקי חברה</h3>
            <div style={{ background: isProfit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
              {isProfit ? <TrendingUp size={20} style={{ color: 'var(--accent-success)' }} /> : <TrendingDown size={20} style={{ color: 'var(--accent-danger)' }} />}
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 'bold', color: isProfit ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
            {formatCurrency(companyNetProfit)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            סה"כ כל הסניפים + מטה
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>סך הכנסות</h3>
            <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
              <ArrowUpRight size={20} style={{ color: 'var(--accent-success)' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 'bold', color: 'var(--accent-success)' }}>
            {formatCurrency(totalIncome)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>סך הוצאות</h3>
            <div style={{ background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
              <ArrowDownRight size={20} style={{ color: 'var(--accent-danger)' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 'bold', color: 'var(--accent-danger)' }}>
            {formatCurrency(totalExpenses)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>שולי רווח</h3>
            <div style={{ background: 'rgba(245,158,11,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
              <Percent size={20} style={{ color: 'var(--accent-warning)' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 'bold', color: 'var(--accent-warning)' }}>
            {profitMargin}%
          </div>
        </div>
      </div>

      {/* ── PYRAMID: COMPANY → BRANCHES ── */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        {/* Company header row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem', marginBottom: '1rem',
          background: isProfit ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
          border: `1px solid ${isProfit ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={28} style={{ color: isProfit ? 'var(--accent-success)' : 'var(--accent-danger)' }} />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>🏢 החברה — סיכום מאוחד</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {branches.length} סניפים + הוצאות כלליות
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'left', display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>הכנסות</div>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-success)' }}>{formatCurrency(totalIncome)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>הוצאות</div>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-danger)' }}>{formatCurrency(totalExpenses)}</div>
            </div>
            <div style={{ textAlign: 'center', background: isProfit ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>רווח נקי</div>
              <div style={{ fontWeight: '900', fontSize: '1.1rem', color: isProfit ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {formatCurrency(companyNetProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* Connector line */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <div style={{ width: '2px', height: '20px', background: 'var(--border-glass)' }}></div>
        </div>

        {/* Branch rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {branchStats.map((branch, idx) => {
            const s = branch.stats;
            const bp = s.profit >= 0;
            const isExpanded = expandedBranch === branch.id;

            return (
              <div key={branch.id}>
                {/* Branch row */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.85rem 1.25rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    marginRight: '1.5rem',
                    borderRight: `3px solid ${bp ? 'var(--accent-success)' : 'var(--accent-danger)'}`
                  }}
                  onClick={() => setExpandedBranch(isExpanded ? null : branch.id)}
                  className="hover:bg-white/5"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Store size={18} style={{ color: bp ? 'var(--accent-success)' : 'var(--accent-danger)' }} />
                    <span style={{ fontWeight: 'bold' }}>{branch.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      שולי רווח: {s.margin}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>הכנסות</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--accent-success)', fontWeight: 'bold' }}>{formatCurrency(s.income)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>הוצאות</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--accent-danger)', fontWeight: 'bold' }}>{formatCurrency(s.expense)}</div>
                    </div>
                    <div style={{ minWidth: '110px', textAlign: 'center', background: bp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>רווח סניף</div>
                      <div style={{ fontWeight: '900', color: bp ? 'var(--accent-success)' : 'var(--accent-danger)' }}>{formatCurrency(s.profit)}</div>
                    </div>
                    {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />}
                  </div>
                </div>

                {/* Expanded branch detail */}
                {isExpanded && (
                  <div style={{
                    marginRight: '3rem', marginTop: '0.25rem', marginBottom: '0.25rem',
                    padding: '1rem 1.25rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '0 0 10px 10px',
                    border: '1px solid var(--border-glass)',
                    borderTop: 'none',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {transactions
                        .filter(t => Number(t.branch_id) === Number(branch.id))
                        .slice(0, 6)
                        .map(tx => (
                          <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                              {new Date(tx.date).toLocaleDateString('he-IL')} · {tx.description || tx.category}
                            </span>
                            <span style={{ fontWeight: 'bold', color: tx.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)', fontSize: '0.8rem' }}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                    {transactions.filter(t => Number(t.branch_id) === Number(branch.id)).length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>אין תנועות לסניף זה עדיין</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* General expenses row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            background: 'rgba(239,68,68,0.04)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '10px',
            marginRight: '1.5rem',
            borderRight: '3px solid rgba(239,68,68,0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Activity size={18} style={{ color: 'var(--accent-warning)' }} />
              <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>הוצאות כלליות (מטה)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>רואה חשבון, הלוואות, מע"מ...</span>
            </div>
            <div style={{ minWidth: '110px', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>עלות חברה</div>
              <div style={{ fontWeight: '900', color: 'var(--accent-danger)' }}>-{formatCurrency(generalExpenses)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Branches comparison bar chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>השוואת ביצועי סניפים</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} tickFormatter={v => `₪${(v/1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="הכנסות" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="הוצאות" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="רווח"   fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense breakdown pie */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>התפלגות הוצאות לפי קטגוריה</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                />
                <Legend formatter={(v) => <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              אין נתוני הוצאות להצגה
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
