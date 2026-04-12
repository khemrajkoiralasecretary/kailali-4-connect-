import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useListComplaints } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Plus, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PALIKA_WARDS: Record<string, { label: string; labelNp: string; wards: number[] }> = {
  godawari:   { label: "Godawari Municipality",       labelNp: "गोदावरी नगरपालिका",   wards: Array.from({ length: 12 }, (_, i) => i + 1) },
  gauriganga: { label: "Gauriganga Municipality",     labelNp: "गौरीगंगा नगरपालिका", wards: Array.from({ length: 11 }, (_, i) => i + 1) },
  chure:      { label: "Chure Rural Municipality",    labelNp: "चुरे गाउँपालिका",      wards: Array.from({ length: 6  }, (_, i) => i + 1) },
  mohanyal:   { label: "Mohanyal Rural Municipality", labelNp: "मोहन्याल गाउँपालिका", wards: [5] },
};

const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-orange-100 text-orange-700 border-orange-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  resolved:    "bg-green-100 text-green-700 border-green-200",
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
  EN: { pending: "Pending", in_progress: "In Progress", resolved: "Resolved" },
  NP: { pending: "विचाराधीन", in_progress: "प्रगतिमा", resolved: "समाधान" },
};

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  EN: { road: "Road", water: "Water", electricity: "Electricity", health: "Health", education: "Education", other: "Other" },
  NP: { road: "सडक", water: "पानी", electricity: "बिजुली", health: "स्वास्थ्य", education: "शिक्षा", other: "अन्य" },
};

export default function Complaints() {
  const { t, language } = useI18n();
  const [statusFilter, setStatusFilter] = useState("");
  const [palikaFilter, setPalikaFilter] = useState("");
  const [wardFilter, setWardFilter]     = useState("");

  const apiParams: { status?: "pending" | "in_progress" | "resolved" } = {};
  if (statusFilter) apiParams.status = statusFilter as "pending" | "in_progress" | "resolved";

  const { data: raw, isLoading } = useListComplaints(apiParams);

  // client-side palika + ward filter
  const complaints = raw?.filter((c) => {
    if (palikaFilter && c.palika !== palikaFilter) return false;
    if (wardFilter   && c.ward  !== parseInt(wardFilter)) return false;
    return true;
  });

  const wardOptions = palikaFilter
    ? PALIKA_WARDS[palikaFilter]?.wards ?? []
    : Array.from({ length: 13 }, (_, i) => i + 1); // show all possible wards when no palika chosen

  const handlePalikaChange = (value: string) => {
    setPalikaFilter(value);
    setWardFilter(""); // reset ward when palika changes
  };

  const hasFilters = statusFilter || palikaFilter || wardFilter;

  const clearAll = () => {
    setStatusFilter("");
    setPalikaFilter("");
    setWardFilter("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("nav.complaints")}</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage citizen complaints</p>
        </div>
        <Link href="/complaints/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} />
            {t("complaints.new")}
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter size={14} />
          <span>{language === "NP" ? "फिल्टर:" : "Filter:"}</span>
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t("complaints.filterStatus")}</option>
          <option value="pending">{STATUS_LABELS[language]?.pending}</option>
          <option value="in_progress">{STATUS_LABELS[language]?.in_progress}</option>
          <option value="resolved">{STATUS_LABELS[language]?.resolved}</option>
        </select>

        {/* Municipality / Palika */}
        <select
          value={palikaFilter}
          onChange={(e) => handlePalikaChange(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{language === "NP" ? "पालिका छान्नुहोस्" : "Municipality"}</option>
          {Object.entries(PALIKA_WARDS).map(([key, p]) => (
            <option key={key} value={key}>
              {language === "NP" ? p.labelNp : p.label}
            </option>
          ))}
        </select>

        {/* Ward — narrows to the chosen palika's wards */}
        <select
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t("complaints.filterWard")}</option>
          {wardOptions.map((w) => (
            <option key={w} value={w}>{t("dashboard.ward")} {w}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={13} />
            {language === "NP" ? "हटाउनुहोस्" : "Clear"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-card border border-border rounded-xl" />
          ))}
        </div>
      ) : complaints && complaints.length > 0 ? (
        <div className="space-y-3">
          {complaints.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Link href={`/complaints/${c.id}`}>
                <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/30 group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{c.name}</span>
                        {c.palika && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {language === "NP"
                              ? PALIKA_WARDS[c.palika]?.labelNp
                              : PALIKA_WARDS[c.palika]?.label ?? c.palika}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{t("dashboard.ward")} {c.ward}</span>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">
                          {CATEGORY_LABELS[language]?.[c.category] ?? c.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">{c.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", STATUS_COLORS[c.status])}>
                        {STATUS_LABELS[language]?.[c.status] ?? c.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">{t("common.empty")}</p>
          <p className="text-sm mt-1">
            {hasFilters
              ? (language === "NP" ? "फिल्टर मिल्ने उजुरी भेटिएन" : "No complaints match your filters")
              : (language === "NP" ? "अहिलेसम्म कुनै उजुरी छैन" : "No complaints yet")}
          </p>
        </div>
      )}
    </div>
  );
}
