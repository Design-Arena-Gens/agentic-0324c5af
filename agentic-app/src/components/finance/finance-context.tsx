"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { nanoid } from "nanoid";

type TransactionType = "income" | "expense" | "transfer";

export interface Account {
  id: string;
  name: string;
  currency: string;
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  type: Extract<TransactionType, "income" | "expense">;
  color: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  subcategoryId?: string;
  notes?: string;
  date: string;
}

interface FinanceState {
  accounts: Account[];
  categories: Category[];
  subcategories: Subcategory[];
  transactions: Transaction[];
  currency: string;
}

type CreateTransactionInput = Omit<Transaction, "id">;

type FinanceAction =
  | { type: "INIT"; payload: FinanceState }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "ADD_SUBCATEGORY"; payload: Subcategory }
  | { type: "ADD_ACCOUNT"; payload: Account };

const STORAGE_KEY = "nexa-ledger-state-v1";

const defaultState: FinanceState = {
  currency: "INR",
  accounts: [
    { id: "wallet", name: "Wallet", currency: "INR", balance: 8500 },
    { id: "savings", name: "Savings", currency: "INR", balance: 42000 }
  ],
  categories: [
    { id: "salary", name: "Salary", type: "income", color: "#22c55e" },
    { id: "freelance", name: "Freelance", type: "income", color: "#0ea5e9" },
    { id: "food", name: "Food & Dining", type: "expense", color: "#f97316" },
    { id: "bills", name: "Bills & Utilities", type: "expense", color: "#a855f7" }
  ],
  subcategories: [
    { id: "food-groceries", categoryId: "food", name: "Groceries" },
    { id: "food-restaurants", categoryId: "food", name: "Restaurants" },
    { id: "bills-electricity", categoryId: "bills", name: "Electricity" },
    { id: "bills-emi", categoryId: "bills", name: "EMI" }
  ],
  transactions: []
};

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case "INIT":
      return action.payload;
    case "ADD_ACCOUNT":
      return { ...state, accounts: [...state.accounts, action.payload] };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    case "ADD_SUBCATEGORY":
      return { ...state, subcategories: [...state.subcategories, action.payload] };
    case "ADD_TRANSACTION":
      return produceWithTransaction(state, action.payload);
    default:
      return state;
  }
}

function produceWithTransaction(state: FinanceState, transaction: Transaction): FinanceState {
  const updatedAccounts = state.accounts.map((account) => ({ ...account }));

  const sourceAccount = updatedAccounts.find((account) => account.id === transaction.accountId);
  const targetAccount = transaction.toAccountId
    ? updatedAccounts.find((account) => account.id === transaction.toAccountId)
    : null;

  if (transaction.type === "income" && sourceAccount) {
    sourceAccount.balance += transaction.amount;
  }

  if (transaction.type === "expense" && sourceAccount) {
    sourceAccount.balance -= transaction.amount;
  }

  if (transaction.type === "transfer" && sourceAccount && targetAccount) {
    sourceAccount.balance -= transaction.amount;
    targetAccount.balance += transaction.amount;
  }

  return {
    ...state,
    transactions: [transaction, ...state.transactions],
    accounts: updatedAccounts
  };
}

interface FinanceContextValue extends FinanceState {
  addTransaction: (input: CreateTransactionInput) => void;
  addCategory: (name: string, type: Category["type"]) => void;
  addSubcategory: (categoryId: string, name: string) => void;
  addAccount: (name: string) => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

function rehydrate(): FinanceState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }
    const parsed = JSON.parse(raw) as FinanceState;
    return {
      ...defaultState,
      ...parsed,
      accounts: parsed.accounts ?? defaultState.accounts,
      categories: parsed.categories ?? defaultState.categories,
      subcategories: parsed.subcategories ?? defaultState.subcategories,
      transactions: parsed.transactions ?? defaultState.transactions
    };
  } catch (error) {
    console.error("Failed to rehydrate finance state", error);
    return defaultState;
  }
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, defaultState);

  useEffect(() => {
    dispatch({ type: "INIT", payload: rehydrate() });
  }, []);

  useEffect(() => {
    if (state) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const addTransaction = useCallback(
    (input: CreateTransactionInput) => {
      const transaction: Transaction = {
        ...input,
        id: nanoid()
      };
      dispatch({ type: "ADD_TRANSACTION", payload: transaction });
    },
    [dispatch]
  );

  const addCategory = useCallback(
    (name: string, type: Category["type"]) => {
      const category: Category = {
        id: nanoid(),
        name,
        type,
        color: type === "income" ? "#22c55e" : "#f97316"
      };
      dispatch({ type: "ADD_CATEGORY", payload: category });
    },
    [dispatch]
  );

  const addSubcategory = useCallback(
    (categoryId: string, name: string) => {
      const subcategory: Subcategory = {
        id: nanoid(),
        categoryId,
        name
      };
      dispatch({ type: "ADD_SUBCATEGORY", payload: subcategory });
    },
    [dispatch]
  );

  const addAccount = useCallback(
    (name: string) => {
      const account: Account = {
        id: nanoid(),
        name,
        balance: 0,
        currency: defaultState.currency
      };
      dispatch({ type: "ADD_ACCOUNT", payload: account });
    },
    [dispatch]
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
      ...state,
      addTransaction,
      addCategory,
      addSubcategory,
      addAccount
    }),
    [state, addTransaction, addCategory, addSubcategory, addAccount]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
