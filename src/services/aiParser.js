import { useCategoryStore } from '../store/categoryStore';
import { useWalletStore } from '../store/walletStore';

/**
 * AI Natural Language Parser — converts text like "20 coffee" into
 * structured transaction data. Fully offline, no external API.
 */

const EXPENSE_KEYWORDS = [
  'spent', 'paid', 'bought', 'cost', 'expense', 'pay', 'buy',
  'purchase', 'charge', 'fee', 'bill',
];

const INCOME_KEYWORDS = [
  'earned', 'received', 'salary', 'income', 'got', 'freelance',
  'payment', 'wage', 'bonus', 'refund', 'cashback',
];

const TRANSFER_KEYWORDS = [
  'transfer', 'moved', 'sent', 'to bank', 'to cash', 'from bank', 'from cash',
];

const DEBT_KEYWORDS = [
  'debt', 'owe', 'owes', 'borrowed', 'lent', 'loan',
];

const CATEGORY_HINTS = {
  // Food
  food: 'Food', coffee: 'Food', lunch: 'Food', dinner: 'Food', breakfast: 'Food',
  restaurant: 'Food', meal: 'Food', snack: 'Food', eat: 'Food', pizza: 'Food',
  burger: 'Food', sandwich: 'Food', sushi: 'Food', starbucks: 'Food',
  mcdonalds: 'Food', kfc: 'Food', tea: 'Food',
  // Transport
  uber: 'Transport', taxi: 'Transport', bus: 'Transport', metro: 'Transport',
  gas: 'Transport', fuel: 'Transport', petrol: 'Transport', parking: 'Transport',
  train: 'Transport', flight: 'Transport', careem: 'Transport', lyft: 'Transport',
  // Shopping
  clothes: 'Shopping', shoes: 'Shopping', amazon: 'Shopping', shopping: 'Shopping',
  mall: 'Shopping', store: 'Shopping', buy: 'Shopping', zara: 'Shopping',
  // Bills
  electricity: 'Bills', water: 'Bills', internet: 'Bills', phone: 'Bills',
  rent: 'Rent', wifi: 'Bills', bill: 'Bills', subscription: 'Bills',
  netflix: 'Bills', spotify: 'Bills',
  // Entertainment
  movie: 'Entertainment', cinema: 'Entertainment', game: 'Entertainment',
  concert: 'Entertainment', party: 'Entertainment', fun: 'Entertainment',
  // Health
  medicine: 'Health', doctor: 'Health', pharmacy: 'Health', hospital: 'Health',
  gym: 'Health', fitness: 'Health',
  // Education
  book: 'Education', course: 'Education', school: 'Education', tuition: 'Education',
  tutorial: 'Education', udemy: 'Education',
  // Groceries
  grocery: 'Groceries', groceries: 'Groceries', supermarket: 'Groceries',
  market: 'Groceries', vegetables: 'Groceries', fruits: 'Groceries',
  // Income
  salary: 'Salary', freelance: 'Freelance', investment: 'Investment',
  gift: 'Gift', bonus: 'Salary',
};

export function parseTransactionInput(text) {
  if (!text || text.trim().length === 0) return null;

  const input = text.trim().toLowerCase();
  const tokens = input.split(/\s+/);

  let amount = null;
  let name = '';
  let type = 'expense';
  let categoryHint = null;
  let accountHint = null;
  const nameTokens = [];

  // Extract amount (first number found)
  for (const token of tokens) {
    const num = parseFloat(token.replace(/[,$]/g, ''));
    if (!isNaN(num) && num > 0 && amount === null) {
      amount = num;
    } else {
      nameTokens.push(token);
    }
  }

  // If no amount found, try to find amount at the end
  if (amount === null) {
    for (let i = tokens.length - 1; i >= 0; i--) {
      const num = parseFloat(tokens[i].replace(/[,$]/g, ''));
      if (!isNaN(num) && num > 0) {
        amount = num;
        nameTokens.splice(nameTokens.indexOf(tokens[i]), 1);
        break;
      }
    }
  }

  // Determine type
  const fullText = nameTokens.join(' ');
  if (INCOME_KEYWORDS.some((k) => fullText.includes(k))) {
    type = 'income';
  } else if (TRANSFER_KEYWORDS.some((k) => fullText.includes(k))) {
    type = 'transfer';
  } else if (DEBT_KEYWORDS.some((k) => fullText.includes(k))) {
    type = 'debt';
  }

  // Find category hint
  for (const token of nameTokens) {
    const clean = token.replace(/[^a-z]/g, '');
    if (CATEGORY_HINTS[clean]) {
      categoryHint = CATEGORY_HINTS[clean];
      break;
    }
  }

  // Find account hint
  const accountWords = ['cash', 'bank', 'card', 'wallet', 'savings'];
  for (const token of nameTokens) {
    if (accountWords.includes(token)) {
      accountHint = token;
    }
  }

  // Build name — capitalize first letter of each word
  name = nameTokens
    .filter((t) => !accountWords.includes(t))
    .filter((t) => !EXPENSE_KEYWORDS.includes(t) && !INCOME_KEYWORDS.includes(t) && !TRANSFER_KEYWORDS.includes(t) && !DEBT_KEYWORDS.includes(t))
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' ');

  return {
    amount,
    name: name || (categoryHint || 'Transaction'),
    type,
    categoryHint,
    accountHint,
    confidence: amount !== null ? (categoryHint ? 0.9 : 0.7) : 0.3,
    raw: text,
  };
}

export async function resolveCategory(hint) {
  if (!hint) return null;
  const categories = useCategoryStore.getState().categories || [];
  return categories.find((c) =>
    c.name.toLowerCase() === hint.toLowerCase()
  ) || null;
}

export async function resolveAccount(hint) {
  if (!hint) return null;
  const accounts = useWalletStore.getState().wallets || [];
  return accounts.find((a) =>
    a.name.toLowerCase().includes(hint.toLowerCase()) ||
    a.type.toLowerCase() === hint.toLowerCase()
  ) || null;
}
