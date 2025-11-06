"use client";

import { type FormEvent, useState } from "react";
import { type Category, useFinance } from "./finance-context";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type TransactionFormState = {
  type: "income" | "expense" | "transfer";
  amount: string;
  date: string;
  accountId: string;
  toAccountId: string;
  categoryId: string;
  subcategoryId: string;
  notes: string;
};

const initialTransactionState = (defaultAccountId: string): TransactionFormState => ({
  type: "income",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  accountId: defaultAccountId,
  toAccountId: "",
  categoryId: "",
  subcategoryId: "",
  notes: ""
});

export function QuickActions() {
  const {
    accounts,
    categories,
    subcategories,
    addTransaction,
    addCategory,
    addSubcategory,
    addAccount,
    currency
  } = useFinance();

  const [transaction, setTransaction] = useState<TransactionFormState>(() =>
    initialTransactionState(accounts[0]?.id ?? "")
  );
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<Category["type"]>("expense");
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [accountName, setAccountName] = useState("");

  const availableSubcategories = subcategories.filter(
    (subcategory) => subcategory.categoryId === transaction.categoryId
  );

  const handleTransactionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!transaction.amount || !transaction.date || !transaction.accountId) {
      return;
    }

    const payload = {
      type: transaction.type,
      amount: Number(transaction.amount),
      date: transaction.date,
      accountId: transaction.accountId,
      toAccountId: transaction.type === "transfer" ? transaction.toAccountId || undefined : undefined,
      categoryId: transaction.type !== "transfer" ? transaction.categoryId || undefined : undefined,
      subcategoryId:
        transaction.type !== "transfer" && transaction.subcategoryId
          ? transaction.subcategoryId
          : undefined,
      notes: transaction.notes || undefined
    } as const;

    addTransaction(payload);
    setTransaction(initialTransactionState(transaction.accountId));
  };

  const handleCategorySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    addCategory(categoryName.trim(), categoryType);
    setCategoryName("");
  };

  const handleSubcategorySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subcategoryCategoryId || !subcategoryName.trim()) return;
    addSubcategory(subcategoryCategoryId, subcategoryName.trim());
    setSubcategoryName("");
  };

  const handleAccountSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accountName.trim()) return;
    addAccount(accountName.trim());
    setAccountName("");
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-slate-800/60 bg-gradient-to-br from-slate-900/90 to-slate-950/90">
        <CardHeader className="flex-col items-start gap-3">
          <Badge variant="success">Quick Entry</Badge>
          <CardTitle className="text-xl">Record Transaction</CardTitle>
          <CardDescription>Capture income, expenses, or transfers in seconds.</CardDescription>
        </CardHeader>
        <form className="flex flex-col gap-4" onSubmit={handleTransactionSubmit}>
          <div className="grid grid-cols-3 gap-2">
            {(["income", "expense", "transfer"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setTransaction((prev) => ({
                    ...prev,
                    type,
                    categoryId: "",
                    subcategoryId: "",
                    toAccountId: ""
                  }))
                }
                className={`rounded-2xl px-4 py-3 text-sm font-semibold capitalize transition ${
                  transaction.type === type
                    ? "bg-brand text-slate-900 shadow-card"
                    : "bg-slate-900/60 text-slate-300 hover:bg-slate-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">Amount</label>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={transaction.amount}
                onChange={(event) =>
                  setTransaction((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder={`Amount in ${currency}`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">Date</label>
              <Input
                required
                type="date"
                value={transaction.date}
                onChange={(event) =>
                  setTransaction((prev) => ({ ...prev, date: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">From Account</label>
              <Select
                required
                value={transaction.accountId}
                onChange={(event) =>
                  setTransaction((prev) => ({ ...prev, accountId: event.target.value }))
                }
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </div>
            {transaction.type === "transfer" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  To Account
                </label>
                <Select
                  required
                  value={transaction.toAccountId}
                  onChange={(event) =>
                    setTransaction((prev) => ({ ...prev, toAccountId: event.target.value }))
                  }
                >
                  <option value="">Select account</option>
                  {accounts
                    .filter((account) => account.id !== transaction.accountId)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                </Select>
              </div>
            )}
          </div>

          {transaction.type !== "transfer" && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Category
                </label>
                <Select
                  required
                  value={transaction.categoryId}
                  onChange={(event) =>
                    setTransaction((prev) => ({
                      ...prev,
                      categoryId: event.target.value,
                      subcategoryId: ""
                    }))
                  }
                >
                  <option value="">Select category</option>
                  {categories
                    .filter((category) => category.type === transaction.type)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Subcategory
                </label>
                <Select
                  value={transaction.subcategoryId}
                  onChange={(event) =>
                    setTransaction((prev) => ({ ...prev, subcategoryId: event.target.value }))
                  }
                >
                  <option value="">Optional</option>
                  {availableSubcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">Notes</label>
            <textarea
              rows={3}
              className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              value={transaction.notes}
              onChange={(event) =>
                setTransaction((prev) => ({ ...prev, notes: event.target.value }))
              }
              placeholder="Add context..."
            />
          </div>

          <Button type="submit" className="w-full rounded-2xl py-3 text-base font-semibold">
            Save Transaction
          </Button>
        </form>
      </Card>

      <Card className="border-slate-800/60 bg-slate-950/80">
        <CardHeader className="flex-col items-start gap-3">
          <Badge variant="muted">Categories</Badge>
          <CardTitle className="text-xl">Manage Categories</CardTitle>
          <CardDescription>Create categories and subcategories for better tracking.</CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-6">
          <form className="flex flex-col gap-3" onSubmit={handleCategorySubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Category Name
                </label>
                <Input
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="e.g. Travel"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Category Type
                </label>
                <Select
                  value={categoryType}
                  onChange={(event) => setCategoryType(event.target.value as Category["type"])}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Select>
              </div>
            </div>
            <Button type="submit" variant="secondary" className="rounded-2xl py-2 font-semibold">
              Add Category
            </Button>
          </form>

          <form className="flex flex-col gap-3" onSubmit={handleSubcategorySubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Parent Category
                </label>
                <Select
                  value={subcategoryCategoryId}
                  onChange={(event) => setSubcategoryCategoryId(event.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Subcategory Name
                </label>
                <Input
                  value={subcategoryName}
                  onChange={(event) => setSubcategoryName(event.target.value)}
                  placeholder="e.g. Mobile Recharge"
                />
              </div>
            </div>
            <Button type="submit" variant="secondary" className="rounded-2xl py-2 font-semibold">
              Add Subcategory
            </Button>
          </form>
        </div>
      </Card>

      <Card className="border-slate-800/60 bg-slate-950/80">
        <CardHeader className="flex-col items-start gap-3">
          <Badge variant="muted">Accounts</Badge>
          <CardTitle className="text-xl">Add Account</CardTitle>
          <CardDescription>Create new wallets, banks, or credit card accounts.</CardDescription>
        </CardHeader>
        <form className="flex flex-col gap-3" onSubmit={handleAccountSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">Account Name</label>
            <Input
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              placeholder="e.g. HDFC Credit Card"
            />
          </div>
          <Button type="submit" variant="secondary" className="rounded-2xl py-2 font-semibold">
            Create Account
          </Button>
        </form>
      </Card>
    </div>
  );
}
