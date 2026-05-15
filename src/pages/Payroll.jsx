import React, { useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { Users, AlertCircle, Upload, Building2, User, Trash2 } from 'lucide-react';
import { parseExcelFile } from '../utils/excelParser';

export default function Payroll() {
  const { transactions, branches, employees, addEmployeesBatch, updateEmployeeBranch, deleteEmployee } = useData();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Filter salaries
  const salaryTransactions = transactions.filter(t => t.category === 'משכורות');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const data = await parseExcelFile(file);
      
      // Look for columns that contain the relevant data
      const employeesToAdd = [];
      
      data.forEach(row => {
        // Find keys dynamically
        const nameKey = Object.keys(row).find(key => key.includes('שם') || key.includes('עובד') || key.toLowerCase().includes('name'));
        const roleKey = Object.keys(row).find(key => key.includes('תפקיד') || key.includes('תאור') || key.toLowerCase().includes('role'));
        const branchKey = Object.keys(row).find(key => key.includes('סניף') || key.toLowerCase().includes('branch'));
        
        const name = nameKey ? row[nameKey] : Object.values(row)[0]; 
        const role = roleKey ? row[roleKey] : 'עובד כללי';
        const branchString = branchKey ? String(row[branchKey]).trim() : '';
        
        let matchedBranchId = null;
        
        // Try to auto-match branch string from excel with existing branches in system
        if (branchString) {
          const matchedBranch = branches.find(b => 
            b.name.includes(branchString) || branchString.includes(b.name)
          );
          if (matchedBranch) {
            matchedBranchId = matchedBranch.id;
          }
        }
        
        if (name && typeof name === 'string' && name.trim().length > 0) {
          const cleanName = name.trim();
          
          // Check if employee already exists in DB (case and space insensitive)
          const existsInDb = employees.find(emp => 
            emp.name && emp.name.trim().toLowerCase() === cleanName.toLowerCase()
          );
          
          // Check if we already added this employee in the current Excel loop
          const existsInBatch = employeesToAdd.find(emp => 
            emp.name.toLowerCase() === cleanName.toLowerCase()
          );

          if (!existsInDb && !existsInBatch) {
            employeesToAdd.push({
              name: cleanName,
              role: role,
              branch_id: matchedBranchId
            });
          } else if (existsInDb && matchedBranchId && existsInDb.branch_id !== matchedBranchId) {
             // Optional: if they exist but branch changed in Excel, we could update it. 
             // For now we just prevent duplicates.
          }
        }
      });

      if (employeesToAdd.length > 0) {
        await addEmployeesBatch(employeesToAdd);
        alert(`נוספו בהצלחה ${employeesToAdd.length} עובדים חדשים!`);
      } else {
        alert('לא נמצאו עובדים חדשים בקובץ (או שכולם כבר קיימים במערכת).');
      }
      
    } catch (error) {
      console.error("Error parsing excel:", error);
      alert('שגיאה בקריאת קובץ האקסל. אנא ודא שזהו קובץ תקין.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>ניהול עובדים ומשכורות</h2>
          <p style={{ color: 'var(--text-secondary)' }}>ריכוז עלויות שכר ושיוך עובדים לסניפים.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload size={18} />
            {isUploading ? 'טוען קובץ...' : 'העלאת קובץ עובדים (Excel)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Employees List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: '1.2rem' }}>
            <Users className="text-primary" />
            רשימת עובדים ושיוך סניף
          </h3>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {employees.length === 0 ? (
              <div className="text-center text-secondary py-8">
                לא הוזנו עובדים במערכת. <br/> לחץ על "העלאת קובץ עובדים" כדי לייבא מאקסל.
              </div>
            ) : (
              <div className="space-y-3">
                {employees.map(employee => (
                  <div key={employee.id} className="flex items-center justify-between p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                        <User size={16} className="text-primary" />
                      </div>
                      <div style={{ fontWeight: '500' }}>{employee.name}</div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <select 
                        value={employee.branch_id || ''} 
                        onChange={(e) => updateEmployeeBranch(employee.id, e.target.value ? Number(e.target.value) : null)}
                        style={{ 
                          background: 'rgba(0,0,0,0.2)', 
                          border: '1px solid var(--border-glass)',
                          color: employee.branch_id ? 'var(--text-primary)' : 'var(--accent-warning)',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          outline: 'none',
                          minWidth: '140px'
                        }}
                      >
                        <option value="" style={{ color: 'black' }}>-- ללא שיוך סניף --</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id} style={{ color: 'black' }}>{b.name}</option>
                        ))}
                      </select>
                      
                      <button 
                        onClick={() => {
                          if (window.confirm('האם אתה בטוח שברצונך למחוק עובד זה?')) {
                            deleteEmployee(employee.id);
                          }
                        }}
                        style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        title="מחק עובד"
                      >
                        <Trash2 size={16} className="hover-danger" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Salary Records (Original Payroll view) */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: '1.2rem' }}>
            <Building2 className="text-success" />
            הוצאות שכר (מתוך הוצאות כלליות)
          </h3>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} className="text-primary" style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.85rem' }}>
              כאן מופיעות הוצאות השכר הכוללות שהוזנו במערכת למטה/סניף. כדי להוסיף רשומת שכר חודשית לסניף, עבור למסך "הוצאות והלוואות" והוסף הוצאה תחת קטגוריה "משכורות".
            </span>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem', fontWeight: 500 }}>תאריך</th>
                  <th style={{ padding: '0.75rem', fontWeight: 500 }}>סניף</th>
                  <th style={{ padding: '0.75rem', fontWeight: 500 }}>תיאור</th>
                  <th style={{ padding: '0.75rem', fontWeight: 500 }}>סכום</th>
                </tr>
              </thead>
              <tbody>
                {salaryTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '0.75rem' }}>{new Date(tx.date).toLocaleDateString('he-IL')}</td>
                    <td style={{ padding: '0.75rem' }}>{branches.find(b => b.id === Number(tx.branch_id))?.name || 'כללי'}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{tx.description}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--accent-danger)' }}>
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
                {salaryTransactions.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      לא נמצאו הוצאות שכר.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
