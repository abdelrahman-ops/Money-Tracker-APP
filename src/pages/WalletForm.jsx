import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';
import { ACCOUNT_COLORS } from '../utils/helpers';
import { ArrowLeft, Trash2, Check } from 'lucide-react';
import LucideIcon, { ICON_NAMES } from '../components/LucideIcon';
import { refreshAllData } from '../utils/refreshData';

const ACCOUNT_TYPES = ['cash', 'bank', 'credit', 'savings', 'investment', 'e-wallet', 'crypto', 'meal card', 'loan', 'business'];

export default function WalletForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const wallets = useWalletStore((s) => s.wallets);
  const createWallet = useWalletStore((s) => s.createWallet);
  const updateWallet = useWalletStore((s) => s.updateWallet);
  const deleteWallet = useWalletStore((s) => s.deleteWallet);


  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [icon, setIcon] = useState('wallet');
  const [balance, setBalance] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const acc = wallets.find((w) => w._id === id);
      if (acc) {
        setName(acc.name);
        setType(acc.type);
        setColor(acc.color);
        setIcon(acc.icon || 'wallet');
        setBalance(String(acc.balance || 0));
      }
    }
  }, [id, wallets]);

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);

    const data = {
      name: name.trim(),
      type,
      color,
      icon,
      balance: parseFloat(balance) || 0,
    };

    // console.log('[WalletForm] Saving wallet:', data);

    let result;
    if (isEditing) {
      result = await updateWallet(id, data);
    } else {
      result = await createWallet(data);
    }

    setSaving(false);

    if (result.success) {
      // Refresh full app state to ensure Dashboard and Insights are updated
      refreshAllData();
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/wallets', { replace: true });
      }
    } else {
      alert(result.error || 'Failed to save wallet');
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    if (window.confirm('Delete this account and all its transactions?')) {
      const result = await deleteWallet(id);
      if (result.success) {
        navigate('/wallets', { replace: true });
      } else {
        alert(result.error || 'Failed to delete wallet');
      }
    }
  };

  const accountIcons = ['wallet', 'landmark', 'credit-card', 'briefcase', 'coins', 'banknote', 'badge-dollar-sign', 'building-2', 'vault', 'gem', 'smartphone', 'coffee', 'receipt', 'arrow-right-left'];

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-2xl min-w-touch min-h-touch haptic">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-semibold">{isEditing ? 'Edit' : 'New'} Account</h1>
        {isEditing ? (
          <button onClick={handleDelete} className="p-2 rounded-2xl text-[var(--color-danger)] min-w-touch min-h-touch haptic">
            <Trash2 className="w-5 h-5" />
          </button>
        ) : <div className="w-11" />}
      </div>

      <div className="px-4 space-y-5">
        {/* Preview Card */}
        <div className="ios-card flex items-center gap-4 p-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
            <LucideIcon name={icon} className="w-7 h-7" style={{ color }} />
          </div>
          <div>
            <p className="text-[17px] font-bold">{name || 'Account Name'}</p>
            <p className="text-[13px] text-[var(--color-muted)] capitalize">{type}</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <p className="ios-section-header">Name</p>
          <div className="ios-card">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Account name"
              className="w-full px-4 py-3.5 bg-transparent text-[15px] focus:outline-none placeholder:text-[var(--color-muted)]/50"
            />
          </div>
        </div>

        {/* Type */}
        <div>
          <p className="ios-section-header">Type</p>
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={'px-4 py-2.5 rounded-2xl text-[13px] font-semibold capitalize transition-all haptic ' +
                  (type === t ? 'gradient-primary text-white shadow-lg shadow-blue-500/20' : 'ios-card text-[var(--color-muted)]')
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Balance */}
        <div>
          <p className="ios-section-header">Balance</p>
          <div className="ios-card">
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full px-4 py-3.5 bg-transparent text-[15px] focus:outline-none"
            />
          </div>
        </div>

        {/* Icon */}
        <div>
          <p className="ios-section-header">Icon</p>
          <div className="flex flex-wrap gap-2">
            {accountIcons.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={'w-12 h-12 rounded-2xl flex items-center justify-center transition-all haptic ' +
                  (icon === ic ? 'gradient-primary text-white shadow-lg shadow-blue-500/20' : 'ios-card')
                }
              >
                <LucideIcon name={ic} className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <p className="ios-section-header">Color</p>
          <div className="flex flex-wrap gap-2.5">
            {ACCOUNT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={'w-10 h-10 rounded-2xl transition-all haptic relative ' +
                  (color === c ? 'ring-2 ring-offset-2 ring-[var(--color-primary)] ring-offset-[var(--color-bg)] scale-110' : '')
                }
                style={{ backgroundColor: c }}
              >
                {color === c && (
                  <Check className="w-4 h-4 text-white absolute inset-0 m-auto" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full py-4 rounded-2xl gradient-primary text-white font-bold text-[17px] haptic disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Account' : 'Create Account'}
        </button>

        <div className="h-4" />
      </div>
    </div>
  );
}
