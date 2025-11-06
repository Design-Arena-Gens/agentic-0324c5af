import { SummaryCards } from "@/components/finance/summary-cards";
import { QuickActions } from "@/components/finance/quick-actions";
import { TransactionsTable } from "@/components/finance/transactions-table";
import { CategoryOverview } from "@/components/finance/category-overview";
import { AccountsOverview } from "@/components/finance/accounts-overview";

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_60%)] pb-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pt-10 md:px-10 lg:px-16">
        <header className="flex flex-col gap-4 text-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold md:text-4xl">
              Nexa Ledger <span className="text-brand">Money Manager</span>
            </h1>
            <span className="rounded-full border border-brand/40 bg-brand/10 px-4 py-1 text-sm text-brand">
              Smart control on your cashflow
            </span>
          </div>
          <p className="text-sm text-slate-400 md:max-w-3xl">
            Track income, expenses, and transfers with granular category mapping. Automate balance
            calculations across wallets, banks, or any custom accounts with Nexa Ledger.
          </p>
        </header>

        <SummaryCards />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <QuickActions />
          <div className="flex flex-col gap-6">
            <TransactionsTable />
            <div className="grid gap-6 xl:grid-cols-2">
              <AccountsOverview />
              <CategoryOverview />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
