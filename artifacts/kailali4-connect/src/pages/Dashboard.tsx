import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import {
  useGetDashboardStats,
  useGetWardBreakdown,
  useGetRecentActivity,
  useGetMpProfile,
  useListEvents,
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FileText, Lightbulb, Newspaper, Clock, CheckCircle2, AlertCircle, ArrowRight, User, Search, MapPin, Calendar, ShieldAlert, CalendarDays, Wallet, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  complaint: "bg-red-100 text-red-700",
  idea: "bg-yellow-100 text-yellow-700",
  news: "bg-blue-100 text-blue-700",
};

const statusIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  complaint: FileText,
  idea: Lightbulb,
  news: Newspaper,
};

const trackStatusConfig = {
  pending:     { label: "Pending",    labelNp: "विचाराधीन",   cls: "bg-orange-100 text-orange-700 border-orange-200" },
  in_progress: { label: "Processing", labelNp: "प्रक्रियामा", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  resolved:    { label: "Solved",     labelNp: "समाधान",      cls: "bg-green-100 text-green-700 border-green-200" },
};

type TrackedComplaint = {
  id: number; name: string; description: string; status: string;
  palika: string; ward: number; category: string; trackId?: string | null;
  createdAt: string;
};

function ComplaintTracker() {
  const { language } = useI18n();
  const [inputVal, setInputVal] = useState("");
  const [data, setData]         = useState<TrackedComplaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError]   = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async () => {
    const val = inputVal.trim();
    if (!val) return;
    setIsLoading(true);
    setIsError(false);
    setData(null);
    setSearched(true);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/complaints/${encodeURIComponent(val)}`);
      if (!res.ok) throw new Error("Not found");
      setData(await res.json());
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const status = (data?.status ?? "pending") as keyof typeof trackStatusConfig;
  const cfg    = trackStatusConfig[status] ?? trackStatusConfig.pending;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Search size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            {language === "NP" ? "उजुरी ट्र्याक गर्नुहोस्" : "Track Your Complaint"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {language === "NP" ? "आफ्नो उजुरी नम्बर प्रविष्ट गर्नुहोस्" : "Enter your complaint ID to see its current status"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => { setInputVal(e.target.value); setData(null); setIsError(false); setSearched(false); }}
          onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          placeholder={language === "NP" ? "K4-... वा नम्बर ID" : "K4-... or numeric ID"}
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
        />
        <button
          onClick={handleTrack}
          disabled={!inputVal.trim() || isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
        >
          <Search size={14} />
          {language === "NP" ? "खोज्नुस्" : "Track"}
        </button>
      </div>

      {isLoading && (
        <div className="mt-3 h-20 animate-pulse bg-muted rounded-xl" />
      )}

      {isError && searched && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2"
        >
          <AlertCircle size={15} />
          {language === "NP"
            ? `"${inputVal}" ID भएको उजुरी फेला परेन। K4-... ट्र्याकिङ ID वा नम्बर प्रयोग गर्नुहोस्।`
            : `No complaint found for "${inputVal}". Use your K4-... tracking ID or numeric ID.`}
        </motion.div>
      )}

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-4 rounded-xl border border-border bg-muted/30 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {data.trackId
                  ? <span className="font-mono text-primary">{data.trackId}</span>
                  : <>{language === "NP" ? "उजुरी" : "Complaint"} #{data.id}</>}
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5 leading-snug">{data.name}</p>
            </div>
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 mt-1", cfg.cls)}>
              {language === "NP" ? cfg.labelNp : cfg.label}
            </span>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed">{data.description}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border">
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {data.palika} — Ward {data.ward}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(data.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Status timeline */}
          <div className="flex items-center gap-2 pt-1">
            {(["pending", "in_progress", "resolved"] as const).map((s, i, arr) => {
              const stOrder = ["pending", "in_progress", "resolved"];
              const curIdx  = stOrder.indexOf(data.status ?? "pending");
              const sIdx    = stOrder.indexOf(s);
              const done    = sIdx <= curIdx;
              const labels  = {
                pending:     language === "NP" ? "दर्ता" : "Filed",
                in_progress: language === "NP" ? "प्रक्रियामा" : "Processing",
                resolved:    language === "NP" ? "समाधान" : "Solved",
              };
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn("w-3 h-3 rounded-full border-2 transition-all",
                      done ? "bg-primary border-primary" : "border-border bg-background"
                    )} />
                    <span className={cn("text-xs leading-none", done ? "text-primary font-medium" : "text-muted-foreground")}>
                      {labels[s]}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={cn("h-0.5 flex-1 -mt-4 rounded", done && sIdx < curIdx ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, colorClass }: { label: string; value: number; icon: React.ComponentType<{ size?: number, className?: string }>; colorClass: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={cn("p-3 rounded-lg", colorClass)}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>
    </motion.div>
  );
}

const EVENT_TYPE_LABELS: Record<string, { en: string; np: string; color: string }> = {
  festival:           { en: "Festival",           np: "महोत्सव",               color: "#b45309" },
  government_program: { en: "Government Program", np: "सरकारी कार्यक्रम",     color: "#1d4ed8" },
  development_update: { en: "Development Update", np: "विकास अद्यावधिक",      color: "#c2410c" },
  cultural_program:   { en: "Cultural Program",   np: "सांस्कृतिक कार्यक्रम", color: "#7c3aed" },
  public_notice:      { en: "Public Notice",      np: "सार्वजनिक सूचना",      color: "#b91c1c" },
};

export default function Dashboard() {
  const { t, language } = useI18n();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: wardBreakdown, isLoading: wardLoading } = useGetWardBreakdown();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: mpProfile } = useGetMpProfile();
  const { data: allEvents = [], isLoading: eventsLoading } = useListEvents();
  const { data: fundSummary } = useQuery<{ totalDonations: number; totalExpenses: number; balance: number }>({
    queryKey: ["fundSummary"],
    queryFn: () => fetch("/api/fund/summary").then(r => r.json()),
  });
  const [mpPhotoErr, setMpPhotoErr] = useState(false);

  const latestEvents = [...allEvents].reverse().slice(0, 3);

  const wardChartData = wardBreakdown?.map((w) => ({
    name: `${t("dashboard.ward")} ${w.ward}`,
    Total: w.total,
    Solved: w.resolved,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("nav.dashboard")}</h1>
          <p className="text-muted-foreground text-sm mt-1">Kailali Constituency 4 — Overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/complaints/new">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              <FileText size={15} />
              {t("btn.submitComplaint")}
            </button>
          </Link>
          <Link href="/ideas/new">
            <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              <Lightbulb size={15} />
              {t("btn.submitIdea")}
            </button>
          </Link>
          <Link href="/report-corruption">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
              <ShieldAlert size={15} />
              {language === "NP" ? "भ्रष्टाचार रिपोर्ट" : "Report Corruption"}
            </button>
          </Link>
        </div>
      </div>

      {/* MP Profile */}
      <div className="bg-primary text-primary-foreground rounded-xl p-6 flex items-center gap-5 shadow-md">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {mpProfile?.photoUrl && !mpPhotoErr
            ? <img src={mpProfile.photoUrl} alt="MP" className="w-full h-full object-cover" onError={() => setMpPhotoErr(true)} />
            : <User size={32} className="opacity-80" />}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{t("dashboard.mpProfile")}</p>
          <h2 className="text-xl font-bold mt-1">{mpProfile?.name ?? "Member of Parliament — Kailali-4"}</h2>
          <p className="text-sm opacity-80 mt-1">{mpProfile?.message ?? "Serving with transparency, accountability, and dedication to the people of Kailali Constituency 4"}</p>
        </div>
      </div>

      {/* Complaint Tracker */}
      <ComplaintTracker />

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label={t("dashboard.total")} value={stats.total} icon={FileText} colorClass="bg-primary/10 text-primary" />
          <StatCard label={t("dashboard.pending")} value={stats.pending} icon={Clock} colorClass="bg-orange-100 text-orange-600" />
          <StatCard label={t("dashboard.inProgress")} value={stats.inProgress} icon={AlertCircle} colorClass="bg-blue-100 text-blue-600" />
          <StatCard label={t("dashboard.resolved")} value={stats.resolved} icon={CheckCircle2} colorClass="bg-green-100 text-green-700" />
        </div>
      ) : null}

      {/* Fund Summary */}
      {fundSummary && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Wallet size={16} className="text-primary" />
              {language === "NP" ? "कोष सारांश" : "Fund Summary"}
            </h3>
            <Link href="/fund">
              <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                {language === "NP" ? "विवरण हेर्नुस्" : "View details"}
                <ArrowRight size={12} />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: TrendingUp,   label: language === "NP" ? "कुल दान"   : "Donations", value: fundSummary.totalDonations, cls: "text-green-700", bg: "bg-green-50 border-green-200" },
              { icon: TrendingDown, label: language === "NP" ? "कुल खर्च"  : "Expenses",  value: fundSummary.totalExpenses,  cls: "text-red-700",   bg: "bg-red-50 border-red-200" },
              { icon: Scale,        label: language === "NP" ? "ब्यालेन्स" : "Balance",   value: fundSummary.balance,        cls: fundSummary.balance >= 0 ? "text-blue-700" : "text-orange-700", bg: fundSummary.balance >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200" },
            ].map(c => (
              <div key={c.label} className={`flex items-center gap-2.5 p-3 rounded-xl border ${c.bg}`}>
                <c.icon size={16} className={c.cls} />
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className={`text-sm font-bold ${c.cls}`}>Rs {Number(c.value).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ward Breakdown Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Complaints by Ward</h3>
          {wardLoading ? (
            <div className="h-48 animate-pulse bg-muted rounded-lg" />
          ) : wardChartData && wardChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={wardChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Solved" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Quick Access</h3>
          <div className="space-y-2">
            {[
              { href: "/complaints", label: t("nav.complaints"), sub: `${stats?.total ?? 0} total`, icon: FileText },
              { href: "/ideas", label: t("nav.ideas"), sub: `${stats?.totalIdeas ?? 0} ideas`, icon: Lightbulb },
              { href: "/news", label: t("nav.news"), sub: `${stats?.totalNews ?? 0} updates`, icon: Newspaper },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Latest Events */}
      {(eventsLoading || latestEvents.length > 0) && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CalendarDays size={17} className="text-primary" />
              {language === "NP" ? "ताजा कार्यक्रमहरू" : "Latest Events"}
            </h3>
            <Link href="/events">
              <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                {language === "NP" ? "सबै हेर्नुस्" : "View all"}
                <ArrowRight size={12} />
              </button>
            </Link>
          </div>

          {eventsLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-xl flex-shrink-0"
                  style={{ width: 220, aspectRatio: "4/5" }} />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {latestEvents.map((event, idx) => {
                const type = EVENT_TYPE_LABELS[event.eventType] ?? EVENT_TYPE_LABELS.public_notice;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    style={{
                      width: "100%",
                      maxWidth: 250,
                      aspectRatio: "4/5",
                      background: "white",
                      borderRadius: 10,
                      overflow: "hidden",
                      margin: "10px auto",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ height: "65%", width: "100%", flexShrink: 0, overflow: "hidden", background: "#f3f4f6" }}>
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CalendarDays size={32} color="#d1d5db" />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 8, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 2 }}>
                      <b style={{ fontSize: 13, lineHeight: 1.3, display: "block" }}>{event.title}</b>
                      <small style={{ color: type.color, fontWeight: 600, fontSize: 10 }}>
                        {language === "NP" ? type.np : type.en}
                        {event.eventDate ? ` · ${event.eventDate}` : ""}
                      </small>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                        {event.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
        {activityLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-muted rounded-lg" />
            ))}
          </div>
        ) : activity && activity.length > 0 ? (
          <div className="space-y-2">
            {activity.map((item, idx) => {
              const Icon = statusIcons[item.type] ?? FileText;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className={cn("p-2 rounded-md flex-shrink-0", statusColors[item.type])}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <p className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-6 text-center">{t("common.empty")}</p>
        )}
      </div>
    </div>
  );
}
