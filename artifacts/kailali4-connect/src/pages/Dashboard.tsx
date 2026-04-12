import { useI18n } from "@/lib/i18n";
import {
  useGetDashboardStats,
  useGetWardBreakdown,
  useGetRecentActivity,
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
import { FileText, Lightbulb, Newspaper, Clock, CheckCircle2, AlertCircle, ArrowRight, User } from "lucide-react";
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

export default function Dashboard() {
  const { t } = useI18n();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: wardBreakdown, isLoading: wardLoading } = useGetWardBreakdown();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  const wardChartData = wardBreakdown?.map((w) => ({
    name: `${t("dashboard.ward")} ${w.ward}`,
    Total: w.total,
    Resolved: w.resolved,
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
        </div>
      </div>

      {/* MP Profile */}
      <div className="bg-primary text-primary-foreground rounded-xl p-6 flex items-center gap-5 shadow-md">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <User size={32} className="opacity-80" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{t("dashboard.mpProfile")}</p>
          <h2 className="text-xl font-bold mt-1">Member of Parliament — Kailali-4</h2>
          <p className="text-sm opacity-80 mt-1">Serving with transparency, accountability, and dedication to the people of Kailali Constituency 4</p>
        </div>
      </div>

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
                <Bar dataKey="Resolved" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
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
