import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';
import { ACCOUNT_COLORS } from '../utils/helpers';
import { ArrowLeft, Trash2, Check, AlertTriangle, X } from 'lucide-react';
import LucideIcon from '../components/LucideIcon';
import CreditCardUI from '../components/CreditCardUI';
import { refreshAllData } from '../utils/refreshData';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
  }, [id, wallets, isEditing]);

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

    let result;
    if (isEditing) {
      result = await updateWallet(id, data);
    } else {
      result = await createWallet(data);
    }

    setSaving(false);

    if (result.success) {
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

  const handleDeleteConfirm = async () => {
    if (!isEditing) return;
    const result = await deleteWallet(id);
    if (result.success) {
      setShowDeleteModal(false);
      navigate('/wallets', { replace: true });
    } else {
      alert(result.error || 'Failed to delete wallet');
    }
  };

  const accountIcons = [
    'wallet', 'landmark', 'credit-card', 'briefcase', 'coins',
    'banknote', 'badge-dollar-sign', 'building-2', 'vault',
    'gem', 'smartphone', 'coffee', 'receipt', 'arrow-right-left'
  ];

  // Construct mock wallet object for live CreditCardUI preview
  const mockWallet = {
    _id: id || '0000',
    name: name.trim() || 'Account Name',
    type,
    color,
    icon,
    balance: parseFloat(balance) || 0,
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] pb-24 safe-top safe-bottom w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]/20 bg-[var(--color-card)]/50 backdrop-blur-md sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-2xl min-w-touch min-h-touch haptic hover:bg-[var(--color-border)]/20 text-[var(--color-text)] flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[16px] font-black tracking-tight text-[var(--color-text)]">
          {isEditing ? 'Edit' : 'New'} Account
        </h1>
        {isEditing ? (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-2xl text-[var(--color-danger)] min-w-touch min-h-touch haptic hover:bg-red-500/10 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-11" />
        )}
      </div>

      <div className="px-4 mt-5 space-y-6">
        {/* Credit Card Live Preview */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">
            Live Preview
          </span>
          <div className="w-full">
            <CreditCardUI
              account={mockWallet}
              balanceVisible={true}
              isActive={true}
            />
          </div>
        </div>

        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">
            Account Name
          </label>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-2xl p-0.5 shadow-sm">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chase Bank, Pocket Cash"
              className="w-full px-4 py-3.5 bg-transparent text-base font-semibold focus:outline-none placeholder:text-[var(--color-muted)]/50 text-[var(--color-text)]"
            />
          </div>
        </div>

        {/* Type Selector Grid */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">
            Account Type
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3.5 py-2.5 rounded-2xl text-[12.5px] font-bold capitalize transition-all haptic ${
                  type === t
                    ? 'gradient-primary text-white shadow-md shadow-blue-500/25'
                    : 'bg-[var(--color-card)] border border-[var(--color-border)]/50 text-[var(--color-muted)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Initial/Current Balance */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">
            Balance
          </label>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/55 rounded-2xl p-0.5 shadow-sm relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-extrabold text-[var(--color-muted)] pointer-events-none">
              Amt
            </span>
            <input
              type="number"
              step="any"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-transparent text-base font-bold focus:outline-none text-[var(--color-text)]"
            />
          </div>
        </div>

        {/* Icon Grid */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">
            Card Icon
          </label>
          <div className="grid grid-cols-7 gap-2 bg-[var(--color-card)] border border-[var(--color-border)]/55 p-3 rounded-2xl shadow-sm">
            {accountIcons.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all haptic ${
                  icon === ic
                    ? 'gradient-primary text-white shadow-md shadow-blue-500/25'
                    : 'hover:bg-[var(--color-surface)] text-[var(--color-muted)]'
                }`}
              >
                <LucideIcon name={ic} className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette Grid */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] px-1">
            Theme Color
          </label>
          <div className="grid grid-cols-5 gap-3 bg-[var(--color-card)] border border-[var(--color-border)]/55 p-4 rounded-2xl shadow-sm">
            {ACCOUNT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`aspect-square rounded-xl transition-all haptic relative border border-black/10 ${
                  color === c
                    ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-[var(--color-primary)] ring-offset-[var(--color-bg)]'
                    : ''
                }`}
                style={{ backgroundColor: c }}
              >
                {color === c && (
                  <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" strokeWidth={3.5} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full py-4 rounded-2xl gradient-primary text-white font-extrabold text-[15.5px] haptic disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isEditing ? (
            'Save Changes'
          ) : (
            'Create Account'
          )}
        </button>
      </div>

      {/* Safety Delete Modal Dialog (Slide-up bottom sheet style) */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center px-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-card)] rounded-t-[32px] border-t border-[var(--color-border)]/40 w-full max-w-md p-6 pb-8 flex flex-col text-center shadow-2xl z-110"
            >
              <div className="w-12 h-1 bg-[var(--color-border)]/70 rounded-full mx-auto mb-5" />
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/15 rounded-full flex items-center justify-center mx-auto text-[var(--color-danger)] mb-4 shadow-sm">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-[18px] font-black tracking-tight text-[var(--color-text)]">
                Delete Account?
              </h3>
              <p className="text-[13px] text-[var(--color-muted)] mt-2 mb-6 leading-relaxed px-2">
                This action is permanent. Deleting <span className="font-bold text-[var(--color-text)]">"{name}"</span> will also erase all transactions associated with it from history.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/50 text-[var(--color-text)] text-[14px] font-bold active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[14px] font-extrabold active:scale-95 transition-transform shadow-md shadow-red-500/20"
                >
                  Delete Wallet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
