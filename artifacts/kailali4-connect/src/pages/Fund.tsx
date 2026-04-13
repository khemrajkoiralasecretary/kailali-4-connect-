import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, Scale, Trophy, QrCode, CalendarSearch, X } from "lucide-react";

type Donation = { id: number; name: string; amount: number; date: string; created_at: string };
type Expense  = { id: number; title: string; amount: number; date: string; created_at: string };
type Summary  = { totalDonations: number; totalExpenses: number; balance: number; donorCount: number };

const BASE = "/api/fund";

function fmt(n: number) {
  return `Rs ${Number(n).toLocaleString()}`;
}

export default function Fund() {
  const { language } = useI18n();
  const NP = language === "NP";

  const [filterDate, setFilterDate] = useState("");
  const [applied, setApplied]       = useState("");

  const { data: summary } = useQuery<Summary>({
    queryKey: ["fundSummary"],
    queryFn: () => fetch(`${BASE}/summary`).then(r => r.json()),
  });

  const { data: donations = [] } = useQuery<Donation[]>({
    queryKey: ["fundDonations"],
    queryFn: () => fetch(`${BASE}/donations`).then(r => r.json()),
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["fundExpenses"],
    queryFn: () => fetch(`${BASE}/expenses`).then(r => r.json()),
  });

  const { data: qrData } = useQuery<{ qrUrl: string | null }>({
    queryKey: ["fundQr"],
    queryFn: () => fetch(`${BASE}/qr`).then(r => r.json()),
  });

  const visibleDonations = applied
    ? donations.filter(d => String(d.date).slice(0, 10) === applied)
    : donations;

  const visibleExpenses = applied
    ? expenses.filter(e => String(e.date).slice(0, 10) === applied)
    : expenses;

  const filteredDonationTotal = visibleDonations.reduce((a, d) => a + Number(d.amount), 0);
  const filteredExpenseTotal  = visibleExpenses.reduce((a, e) => a + Number(e.amount), 0);

  const summaryCards = applied
    ? [
        { icon: TrendingUp,   label: NP ? "दान (फिल्टर)" : "Donations (filtered)", value: fmt(filteredDonationTotal), cls: "bg-green-50 text-green-700 border-green-200",  iconCls: "text-green-600" },
        { icon: TrendingDown, label: NP ? "खर्च (फिल्टर)" : "Expenses (filtered)",  value: fmt(filteredExpenseTotal),  cls: "bg-red-50 text-red-700 border-red-200",        iconCls: "text-red-600" },
        { icon: Scale,        label: NP ? "ब्यालेन्स"     : "Balance",              value: fmt(filteredDonationTotal - filteredExpenseTotal),
          cls: filteredDonationTotal >= filteredExpenseTotal ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-orange-50 text-orange-700 border-orange-200",
          iconCls: filteredDonationTotal >= filteredExpenseTotal ? "text-blue-600" : "text-orange-600" },
      ]
    : [
        { icon: TrendingUp,   label: NP ? "कुल दान"   : "Total Donations", value: fmt(summary?.totalDonations ?? 0), cls: "bg-green-50 text-green-700 border-green-200",  iconCls: "text-green-600" },
        { icon: TrendingDown, label: NP ? "कुल खर्च"  : "Total Expenses",  value: fmt(summary?.totalExpenses ?? 0),  cls: "bg-red-50 text-red-700 border-red-200",        iconCls: "text-red-600" },
        { icon: Scale,        label: NP ? "ब्यालेन्स" : "Balance",         value: fmt(summary?.balance ?? 0),
          cls: (summary?.balance ?? 0) >= 0 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-orange-50 text-orange-700 border-orange-200",
          iconCls: (summary?.balance ?? 0) >= 0 ? "text-blue-600" : "text-orange-600" },
      ];

  const inputCls = "px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Wallet size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {NP ? "कोष पारदर्शिता" : "Fund Transparency"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {NP ? "कैलाली-४ निर्वाचन क्षेत्र — आय/व्यय विवरण" : "Kailali Constituency 4 — Public Financial Record"}
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <CalendarSearch size={16} className="text-muted-foreground" />
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className={inputCls}
        />
        <button
          onClick={() => setApplied(filterDate)}
          disabled={!filterDate}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-40 font-medium"
        >
          {NP ? "फिल्टर" : "Filter"}
        </button>
        {applied && (
          <button
            onClick={() => { setApplied(""); setFilterDate(""); }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X size={13} />
            {NP ? "हटाउनुस्" : "Clear"}
          </button>
        )}
        {applied && (
          <span className="text-xs text-muted-foreground">
            {NP ? `मिति: ${applied}` : `Showing: ${applied}`}
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`border rounded-xl p-4 flex items-center gap-3 ${c.cls}`}
          >
            <c.icon size={20} className={c.iconCls} />
            <div>
              <p className="text-xs font-medium opacity-75">{c.label}</p>
              <p className="text-lg font-bold">{c.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Donors */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-yellow-500" />
            {NP ? "शीर्ष दाताहरू" : "Top Donors"}
          </h2>
          {visibleDonations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {applied ? (NP ? "यस मितिमा कुनै दान छैन" : "No donations on this date") : (NP ? "कुनै दान छैन" : "No donations yet")}
            </p>
          ) : (
            <div className="space-y-2">
              {visibleDonations.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold w-5 text-center ${
                      i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"
                    }`}>
                      #{i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                      {d.date && <p className="text-xs text-muted-foreground">{String(d.date).slice(0, 10)}</p>}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-700">{fmt(d.amount)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <TrendingDown size={16} className="text-red-500" />
            {NP ? "खर्च विवरण" : "Expenses"}
          </h2>
          {visibleExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {applied ? (NP ? "यस मितिमा कुनै खर्च छैन" : "No expenses on this date") : (NP ? "कुनै खर्च छैन" : "No expenses yet")}
            </p>
          ) : (
            <div className="space-y-2">
              {visibleExpenses.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm text-foreground">{e.title}</p>
                    {e.date && <p className="text-xs text-muted-foreground">{String(e.date).slice(0, 10)}</p>}
                  </div>
                  <span className="text-sm font-semibold text-red-700">{fmt(e.amount)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Donate */}
      {qrData?.qrUrl && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <QrCode size={18} className="text-primary" />
            {NP ? "दान गर्न स्क्यान गर्नुस्" : "Scan to Donate"}
          </div>
          <img
            src={qrData.qrUrl}
            alt="Donation QR"
            style={{ width: 200, height: 200, objectFit: "contain", borderRadius: 8 }}
          />
        </div>
      )}
    </div>
  );
}
