import { useState, useEffect, useCallback } from 'react';
import { parseTransactionInput, resolveCategory, resolveAccount } from '../services/aiParser';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

export default function QuickInput({ onParsed, categories = [], accounts = [] }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  const debounceRef = { current: null };

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setText(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setPreview(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const result = parseTransactionInput(value);
      if (result && result.amount) {
        setIsResolving(true);
        // Resolve category
        if (result.categoryHint) {
          const cat = categories.find((c) =>
            c.name.toLowerCase() === result.categoryHint.toLowerCase()
          );
          if (cat) result.resolvedCategoryId = cat.id;
        }
        // Resolve account
        if (result.accountHint) {
          const acc = accounts.find((a) =>
            a.name.toLowerCase().includes(result.accountHint.toLowerCase()) ||
            a.type.toLowerCase() === result.accountHint.toLowerCase()
          );
          if (acc) result.resolvedAccountId = acc.id;
        }
        setPreview(result);
        setIsResolving(false);
      } else {
        setPreview(result);
      }
    }, 300);
  }, [categories, accounts]);

  const handleSubmit = () => {
    if (preview && preview.amount) {
      onParsed(preview);
      setText('');
      setPreview(null);
    }
  };

  const typeColors = {
    expense: 'text-[var(--color-danger)]',
    income: 'text-[var(--color-success)]',
    transfer: 'text-[var(--color-primary)]',
    debt: 'text-amber-400',
  };

  return (
    <div className="mb-3">
      <div className="relative flex items-center gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
            <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <input
            type="text"
            value={text}
            onChange={handleChange}
            placeholder='Try "20 coffee" or "salary 5000"'
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--color-card)] text-[14px] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all ios-card"
          />
        </div>
        {preview && preview.amount && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleSubmit}
            className="w-12 h-12 rounded-2xl gradient-primary text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform"
          >
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {preview && preview.amount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--color-surface)] rounded-2xl mt-2 p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[14px] font-bold ${typeColors[preview.type] || ''}`}>
                    {preview.type === 'income' ? '+' : '-'}{preview.amount}
                  </span>
                  <span className="text-[12px] text-[var(--color-muted)] capitalize px-1.5 py-0.5 rounded-md bg-[var(--color-card)]">{preview.type}</span>
                </div>
                <p className="text-[13px] text-[var(--color-text)] truncate">{preview.name}</p>
                {preview.categoryHint && (
                  <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Category: {preview.categoryHint}</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
                <div className="w-1.5 h-1.5 rounded-full" style={{
                  backgroundColor: preview.confidence > 0.8 ? '#22c55e' : preview.confidence > 0.5 ? '#f59e0b' : '#ef4444'
                }} />
                {Math.round(preview.confidence * 100)}%
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
