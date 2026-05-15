import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Building2, Plus, Store, Trash2 } from 'lucide-react';

export default function Settings() {
  const { branches, addBranch } = useData();
  const [newBranch, setNewBranch] = useState({ name: '', type: 'retail' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newBranch.name) return;
    
    setIsSubmitting(true);
    await addBranch(newBranch);
    setNewBranch({ name: '', type: 'retail' });
    setIsSubmitting(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>הגדרות מערכת</h2>
        <p style={{ color: 'var(--text-secondary)' }}>ניהול תשתית המערכת, סניפים והגדרות כלליות.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: '1.2rem' }}>
            <Building2 className="text-primary" />
            הוספת סניף חדש למערכת
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label>שם הסניף</label>
              <input 
                type="text" 
                required
                placeholder="לדוגמה: סניף תל אביב"
                value={newBranch.name}
                onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
              />
            </div>
            
            <div className="form-control">
              <label>סוג הסניף</label>
              <select 
                value={newBranch.type}
                onChange={(e) => setNewBranch({...newBranch, type: e.target.value})}
              >
                <option style={{color: 'black'}} value="retail">סניף מכירות (Retail)</option>
                <option style={{color: 'black'}} value="hq">מטה הנהלה / כללי (HQ)</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full flex justify-center items-center gap-2"
              disabled={isSubmitting}
            >
              <Plus size={18} />
              {isSubmitting ? 'מוסיף...' : 'הוסף סניף'}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4" style={{ fontSize: '1.2rem' }}>סניפים קיימים</h3>
          <div className="space-y-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {branches.length === 0 ? (
              <div className="text-center text-secondary py-4">אין סניפים עדיין</div>
            ) : (
              branches.map(branch => (
                <div key={branch.id} className="flex items-center justify-between p-3" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <div className="flex items-center gap-3">
                    {branch.type === 'hq' ? <Building2 size={18} className="text-primary" /> : <Store size={18} className="text-success" />}
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{branch.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {branch.type === 'hq' ? 'מטה הנהלה' : 'סניף מכירות'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
