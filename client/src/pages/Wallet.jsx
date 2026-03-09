import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import Header from '../components/Header';
import { Plus, ArrowDown, CreditCard, Smartphone } from 'lucide-react';

export default function Wallet() {
  const { user, refreshUser, showToast } = useAuth();
  const navigate = useNavigate();
  const [addAmount, setAddAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const amounts = [100, 250, 500, 1000, 2000, 5000];

  const handleAdd = async () => {
    const amount = addAmount || parseInt(customAmount);
    if (!amount || amount < 10) return showToast('Minimum &#8377;10', 'error');
    setLoading(true);
    try {
      await api.addMoney(amount);
      await refreshUser();
      showToast(`&#8377;${amount} added successfully!`);
      setShowAdd(false);
      setAddAmount(null);
      setCustomAmount('');
    } catch { showToast('Failed to add money', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page page-with-header">
      <Header title="Wallet" back="/profile" />

      <div className="wallet-section">
        <div className="wallet-card">
          <div className="wallet-balance-label">Total Balance</div>
          <div className="wallet-balance-amount">&#8377;{user?.balance?.toLocaleString()}</div>
          <div className="wallet-actions">
            <button className="btn btn-green" style={{ flex: 1 }} onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add Cash
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }}>
              <ArrowDown size={16} /> Withdraw
            </button>
          </div>
        </div>

        <div className="section-title" style={{ padding: '16px 0 8px' }}>Quick Add</div>
        <div className="add-money-options">
          {amounts.map(a => (
            <button
              key={a}
              className={`money-option ${addAmount === a ? 'selected' : ''}`}
              onClick={() => { setAddAmount(a); setCustomAmount(''); }}
            >
              &#8377;{a}
            </button>
          ))}
        </div>

        <div className="input-group">
          <label>Or Enter Amount</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={customAmount}
            onChange={e => { setCustomAmount(e.target.value); setAddAmount(null); }}
          />
        </div>

        <button
          className="btn btn-green btn-full"
          onClick={handleAdd}
          disabled={loading || (!addAmount && !customAmount)}
          style={{ marginTop: 8 }}
        >
          {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : (
            <>Add &#8377;{addAmount || customAmount || 0}</>
          )}
        </button>

        <div className="section-title" style={{ padding: '24px 0 8px' }}>Payment Methods</div>

        <div className="contest-card" style={{ margin: 0, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(46,196,182,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={20} color="#2ec4b6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>UPI</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Google Pay, PhonePe, Paytm</div>
            </div>
          </div>
        </div>

        <div className="contest-card" style={{ margin: 0, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(244,162,97,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} color="#f4a261" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Card Payment</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Debit & Credit Cards</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 11, color: 'var(--text3)' }}>
          All transactions are 100% secure & encrypted<br />
          Money is added instantly to your account
        </div>
      </div>
    </div>
  );
}
