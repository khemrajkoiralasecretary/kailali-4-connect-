import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import {
  useGetMpProfile, useUpdateMpProfile, useGetDashboardStats,
  useListTeamMembers, useDeleteAllTeamMembers, useDeleteAllComplaints,
  useListComplaints, useDeleteComplaint, useUpdateComplaintStatus,
  useDeleteTeamMember, useEditTeamMember, useJoinTeam, useUpdateTeamRank,
  useGetHomeContent, useUpdateHomeContent,
  useGetSocialLinks, useUpdateSocialLinks,
  useListTeamApplications, useUpdateTeamApplicationStatus, useDeleteTeamApplication,
  useListEvents, useCreateEvent, useUpdateEvent, useDeleteEvent,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, LogOut, User, Palette, Users, FileText, BarChart2,
  Save, Trash2, Eye, EyeOff, Check, Lock, Home, Edit2, X,
  Plus, Shield, UserCheck, Search, AlertTriangle, Upload,
  Facebook, Youtube, Globe, Link2,
  Bell, ShieldAlert, Clock, ArrowRight, CalendarDays,
  PartyPopper, Landmark, Construction, Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CREDS_KEY = "k4-admin-creds";

function getCredentials(): { admin: string; coord: string; leader: string } {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { admin: "1234", coord: "1111", leader: "2222" };
}

function saveCredentials(creds: { admin: string; coord: string; leader: string }) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
}

type AdminRole = "super_admin" | "coordinator" | "leader";
type TabKey = "analytics" | "alerts" | "complaints" | "team" | "applications" | "events" | "home" | "theme" | "profile";

const THEMES = [
  { key: "red",    label: "Red",    labelNp: "रातो",  color: "bg-red-600" },
  { key: "blue",   label: "Blue",   labelNp: "नीलो",  color: "bg-blue-600" },
  { key: "green",  label: "Green",  labelNp: "हरियो", color: "bg-green-600" },
  { key: "black",  label: "Black",  labelNp: "कालो",  color: "bg-gray-800" },
  { key: "purple", label: "Purple", labelNp: "बैजनी", color: "bg-purple-700" },
] as const;
type ThemeKey = typeof THEMES[number]["key"];

const PALIKAS = ["Godawari", "Gauriganga", "Chure", "Mohanyal"];
const WARD_MAP: Record<string, number[]> = {
  Godawari: Array.from({ length: 12 }, (_, i) => i + 1),
  Gauriganga: Array.from({ length: 11 }, (_, i) => i + 1),
  Chure: Array.from({ length: 6 }, (_, i) => i + 1),
  Mohanyal: [5],
};
const RANKS = ["volunteer", "coordinator", "leader"] as const;
const STATUS_OPTIONS = ["pending", "in_progress", "resolved"] as const;
type StatusType = typeof STATUS_OPTIONS[number];

const statusConfig: Record<StatusType, { label: string; labelNp: string; cls: string }> = {
  pending:     { label: "Pending",     labelNp: "विचाराधीन",   cls: "bg-orange-100 text-orange-700 border-orange-200" },
  in_progress: { label: "In Progress", labelNp: "प्रगतिमा",   cls: "bg-blue-100 text-blue-700 border-blue-200" },
  resolved:    { label: "Resolved",    labelNp: "समाधान",      cls: "bg-green-100 text-green-700 border-green-200" },
};
const rankConfig: Record<string, { label: string; cls: string }> = {
  volunteer:   { label: "Volunteer",   cls: "bg-gray-100 text-gray-600" },
  coordinator: { label: "Coordinator", cls: "bg-blue-100 text-blue-700" },
  leader:      { label: "Leader",      cls: "bg-yellow-100 text-yellow-700" },
};

function applyTheme(t: ThemeKey) {
  document.documentElement.classList.remove("theme-blue", "theme-green", "theme-black", "theme-purple");
  if (t !== "red") document.documentElement.classList.add(`theme-${t}`);
  localStorage.setItem("k4-theme", t);
}

// ── LOGIN GATE ───────────────────────────────────────────────────────────────
function LoginGate({ onUnlock }: { onUnlock: (role: AdminRole) => void }) {
  const { language } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(language === "NP" ? "गलत username वा password" : (data.error ?? "Incorrect username or password"));
        return;
      }
      sessionStorage.setItem("k4-admin-token", data.token);
      sessionStorage.setItem("admin_role", data.role);
      onUnlock(data.role as AdminRole);
    } catch {
      setError(language === "NP" ? "सर्भरसँग जडान भएन" : "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm space-y-6 shadow-xl"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck size={28} className="text-primary" />
          </div>
          <h2 className="font-bold text-lg text-foreground">
            {language === "NP" ? "एडमिन लगइन" : "Admin Login"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {language === "NP" ? "आफ्नो username र password प्रविष्ट गर्नुहोस्" : "Enter your username and password"}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {language === "NP" ? "प्रयोगकर्ता नाम" : "Username"}
            </label>
            <div className="relative">
              <UserCheck size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                placeholder={language === "NP" ? "admin, coord वा leader" : "admin, coord or leader"}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {language === "NP" ? "पासवर्ड" : "Password"}
            </label>
            <div className="relative">
              <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1.5">
              <X size={12} /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? (language === "NP" ? "जाँच गर्दै..." : "Checking...") : (language === "NP" ? "लगइन" : "Login")}
          </button>
        </form>

        <div className="border-t border-border pt-4 space-y-1.5">
          <p className="text-xs text-muted-foreground text-center font-medium">
            {language === "NP" ? "डिफल्ट खाताहरू" : "Default Accounts"}
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="bg-muted rounded-lg p-2 text-center">
              <p className="font-semibold text-foreground">admin</p>
              <p>{language === "NP" ? "सुपर एडमिन" : "Super Admin"}</p>
            </div>
            <div className="bg-muted rounded-lg p-2 text-center">
              <p className="font-semibold text-foreground">coord</p>
              <p>{language === "NP" ? "समन्वयकर्ता" : "Coordinator"}</p>
            </div>
            <div className="bg-muted rounded-lg p-2 text-center">
              <p className="font-semibold text-foreground">leader</p>
              <p>{language === "NP" ? "नेता" : "Leader"}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── SECTION WRAPPER ───────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Icon size={17} className="text-primary" />
        <h2 className="font-semibold text-foreground text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { language } = useI18n();
  const { data: stats } = useGetDashboardStats();
  const { data: teamMembers } = useListTeamMembers({});
  const { data: complaints } = useListComplaints({});

  const items = [
    { label: language === "NP" ? "कुल उजुरी" : "Total Complaints",  value: stats?.total ?? 0,       cls: "text-primary" },
    { label: language === "NP" ? "विचाराधीन" : "Pending",           value: stats?.pending ?? 0,     cls: "text-orange-600" },
    { label: language === "NP" ? "प्रगतिमा" : "In Progress",        value: stats?.inProgress ?? 0,  cls: "text-blue-600" },
    { label: language === "NP" ? "समाधान" : "Resolved",             value: stats?.resolved ?? 0,    cls: "text-green-600" },
    { label: language === "NP" ? "विचारहरू" : "Ideas",              value: stats?.totalIdeas ?? 0,  cls: "text-yellow-600" },
    { label: language === "NP" ? "समाचार" : "News",                 value: stats?.totalNews ?? 0,   cls: "text-purple-600" },
    { label: language === "NP" ? "टोली सदस्य" : "Team Members",    value: teamMembers?.length ?? 0, cls: "text-primary" },
    { label: language === "NP" ? "आजका उजुरी" : "Today's",
      value: complaints?.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length ?? 0,
      cls: "text-red-600" },
  ];

  return (
    <Section icon={BarChart2} title={language === "NP" ? "विश्लेषण (स्वत: अद्यावधिक)" : "Analytics (Auto-updating)"}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map(({ label, value, cls }) => (
          <div key={label} className="bg-muted rounded-xl p-4 text-center">
            <p className={cn("text-3xl font-bold", cls)}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── COMPLAINTS TAB ────────────────────────────────────────────────────────────
function ComplaintsTab({ role }: { role: AdminRole }) {
  const { language } = useI18n();
  const qc = useQueryClient();
  const isSuperAdmin = role === "super_admin";

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPalika, setFilterPalika] = useState<string>("");
  const [filterWard, setFilterWard]     = useState<string>("");
  const [search, setSearch] = useState("");
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: complaints = [], isLoading } = useListComplaints({
    ...(filterStatus ? { status: filterStatus as StatusType } : {}),
  });

  const updateStatus = useUpdateComplaintStatus({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["listComplaints"] }) },
  });
  const deleteOne = useDeleteComplaint({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["listComplaints"] }) },
  });
  const deleteAll = useDeleteAllComplaints({
    mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["listComplaints"] }); setConfirmDeleteAll(false); } },
  });

  const filtered = complaints.filter(c => {
    const matchPalika = !filterPalika || c.palika === filterPalika;
    const matchWard   = !filterWard   || String(c.ward) === filterWard;
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    return matchPalika && matchWard && matchSearch;
  });

  const cycleStatus = (id: number, current: string) => {
    const next: Record<string, StatusType> = { pending: "in_progress", in_progress: "resolved", resolved: "pending" };
    updateStatus.mutate({ id, data: { status: next[current] } });
  };

  return (
    <Section icon={FileText} title={language === "NP" ? "उजुरी व्यवस्थापन" : "Complaints Management"}>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[140px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === "NP" ? "खोज्नुहोस्..." : "Search..."}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-2 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none"
        >
          <option value="">{language === "NP" ? "सबै स्थिति" : "All Status"}</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
        <select
          value={filterPalika}
          onChange={(e) => { setFilterPalika(e.target.value); setFilterWard(""); }}
          className="px-2 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none"
        >
          <option value="">{language === "NP" ? "सबै पालिका" : "All Palika"}</option>
          {PALIKAS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={filterWard}
          onChange={(e) => setFilterWard(e.target.value)}
          disabled={!filterPalika}
          className="px-2 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none disabled:opacity-50"
        >
          <option value="">{language === "NP" ? "सबै वडा" : "All Wards"}</option>
          {(filterPalika ? WARD_MAP[filterPalika] ?? [] : []).map(w => (
            <option key={w} value={String(w)}>Ward {w}</option>
          ))}
        </select>
        {isSuperAdmin && (
          !confirmDeleteAll ? (
            <button onClick={() => setConfirmDeleteAll(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors ml-auto">
              <Trash2 size={13} /> {language === "NP" ? "सबै मेटाउनुस्" : "Delete All"}
            </button>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-red-600 font-medium">
                {language === "NP" ? "निश्चित?" : "Sure?"}
              </span>
              <button onClick={() => deleteAll.mutate({})}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg">{language === "NP" ? "हो" : "Yes"}</button>
              <button onClick={() => setConfirmDeleteAll(false)}
                className="px-2 py-1 text-xs border border-border rounded-lg hover:bg-muted">{language === "NP" ? "रद्द" : "No"}</button>
            </div>
          )
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 animate-pulse bg-muted rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">{language === "NP" ? "कुनै उजुरी छैन" : "No complaints found"}</p>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map(c => {
            const st = (c.status || "pending") as StatusType;
            const cfg = statusConfig[st] ?? statusConfig.pending;
            return (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">#{c.id}</span>
                    <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.palika} / Ward {c.ward}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => cycleStatus(c.id, st)}
                    title={language === "NP" ? "स्थिति परिवर्तन गर्न क्लिक गर्नुहोस्" : "Click to change status"}
                    className={cn("px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity", cfg.cls)}
                  >
                    {language === "NP" ? cfg.labelNp : cfg.label}
                  </button>
                  {isSuperAdmin && (
                    confirmDelete === c.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => { deleteOne.mutate({ id: c.id }); setConfirmDelete(null); }}
                          className="p-1 rounded bg-red-600 text-white hover:bg-red-700"><Check size={12} /></button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="p-1 rounded border border-border hover:bg-muted"><X size={12} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(c.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {language === "NP"
          ? `${filtered.length} उजुरीहरू देखाइँदैछ। स्थिति ब्याजमा क्लिक गरेर परिवर्तन गर्नुहोस्।`
          : `Showing ${filtered.length} complaints. Click status badge to cycle through states.`}
      </p>
    </Section>
  );
}

// ── TEAM TAB ──────────────────────────────────────────────────────────────────
function TeamTab() {
  const { language } = useI18n();
  const qc = useQueryClient();

  const [showAdd, setShowAdd]           = useState(false);
  const [editId, setEditId]             = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const emptyForm = { name: "", phone: "", palika: "Godawari", ward: 1, rank: "volunteer" };
  const [addForm, setAddForm]   = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({ name: "", phone: "", palika: "Godawari", ward: 1, rank: "volunteer" });

  const { data: members = [], isLoading } = useListTeamMembers({});

  const joinTeam     = useJoinTeam({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["listTeamMembers"] }); setShowAdd(false); setAddForm({ ...emptyForm }); } } });
  const editMember   = useEditTeamMember({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["listTeamMembers"] }); setEditId(null); } } });
  const deleteMember = useDeleteTeamMember({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["listTeamMembers"] }); setConfirmDelete(null); } } });
  const deleteAll    = useDeleteAllTeamMembers({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["listTeamMembers"] }); setConfirmDeleteAll(false); } } });

  const startEdit = (m: (typeof members)[number]) => {
    setEditId(m.id);
    setEditForm({ name: m.name, phone: m.phone ?? "", palika: m.palika ?? "Godawari", ward: m.ward, rank: m.rank ?? "volunteer" });
  };

  const MemberForm = ({ form, setForm, onSave, onCancel, saving }: {
    form: typeof addForm;
    setForm: (f: typeof addForm) => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted/40 rounded-xl border border-border">
      {(["name", "phone"] as const).map(field => (
        <input key={field} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
          placeholder={field === "name" ? (language === "NP" ? "नाम" : "Name") : (language === "NP" ? "फोन" : "Phone")}
          className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
      ))}
      <select value={form.palika} onChange={e => setForm({ ...form, palika: e.target.value, ward: WARD_MAP[e.target.value]?.[0] ?? 1 })}
        className="px-2 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none">
        {PALIKAS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <select value={form.ward} onChange={e => setForm({ ...form, ward: Number(e.target.value) })}
        className="px-2 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none">
        {(WARD_MAP[form.palika] ?? []).map(w => <option key={w} value={w}>Ward {w}</option>)}
      </select>
      <select value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })}
        className="px-2 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none col-span-full sm:col-span-1">
        {RANKS.map(r => <option key={r} value={r}>{rankConfig[r]?.label}</option>)}
      </select>
      <div className="flex gap-2 col-span-full">
        <button onClick={onSave} disabled={saving || !form.name.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50">
          <Check size={13} /> {language === "NP" ? "सेभ" : "Save"}
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted">
          {language === "NP" ? "रद्द" : "Cancel"}
        </button>
      </div>
    </div>
  );

  return (
    <Section icon={Users} title={language === "NP" ? "टोली व्यवस्थापन" : "Team Management"}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {members.length} {language === "NP" ? "सदस्यहरू" : "members"}
        </span>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90">
            <Plus size={13} /> {language === "NP" ? "सदस्य थप्नुस्" : "Add Member"}
          </button>
          {!confirmDeleteAll ? (
            <button onClick={() => setConfirmDeleteAll(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
              <Trash2 size={13} /> {language === "NP" ? "सबै" : "Delete All"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">{language === "NP" ? "निश्चित?" : "Sure?"}</span>
              <button onClick={() => deleteAll.mutate({})} className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg">
                {language === "NP" ? "हो" : "Yes"}
              </button>
              <button onClick={() => setConfirmDeleteAll(false)} className="px-2 py-1 text-xs border border-border rounded-lg hover:bg-muted">
                {language === "NP" ? "रद्द" : "No"}
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <MemberForm
              form={addForm}
              setForm={setAddForm}
              saving={joinTeam.isPending}
              onSave={() => joinTeam.mutate({ data: { name: addForm.name, phone: addForm.phone, palika: addForm.palika, ward: addForm.ward } })}
              onCancel={() => { setShowAdd(false); setAddForm({ ...emptyForm }); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 animate-pulse bg-muted rounded-lg" />)}</div>
      ) : members.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-4">{language === "NP" ? "कुनै सदस्य छैन" : "No members yet"}</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {members.map(m => {
            const rank = (m.rank ?? "volunteer") as keyof typeof rankConfig;
            return (
              <div key={m.id}>
                {editId === m.id ? (
                  <MemberForm
                    form={editForm}
                    setForm={setEditForm}
                    saving={editMember.isPending}
                    onSave={() => editMember.mutate({ id: m.id, data: editForm })}
                    onCancel={() => setEditId(null)}
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{m.name}</span>
                        <span className={cn("px-1.5 py-0.5 rounded-full text-xs font-medium", rankConfig[rank]?.cls)}>
                          {rankConfig[rank]?.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{m.palika} / Ward {m.ward} · {m.phone}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Rank selector */}
                      <select
                        value={m.rank ?? "volunteer"}
                        onChange={e => {
                          const r = e.target.value as "volunteer" | "coordinator" | "leader";
                          qc.invalidateQueries({ queryKey: ["listTeamMembers"] });
                          fetch(`/api/team/${m.id}/rank`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rank: r }) })
                            .then(() => qc.invalidateQueries({ queryKey: ["listTeamMembers"] }));
                        }}
                        className="px-1.5 py-0.5 text-xs border border-border rounded bg-background focus:outline-none"
                        title={language === "NP" ? "पद परिवर्तन" : "Change Rank"}
                      >
                        {RANKS.map(r => <option key={r} value={r}>{rankConfig[r]?.label}</option>)}
                      </select>
                      <button onClick={() => startEdit(m)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                        <Edit2 size={13} />
                      </button>
                      {confirmDelete === m.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => deleteMember.mutate({ id: m.id })}
                            className="p-1 rounded bg-red-600 text-white"><Check size={12} /></button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="p-1 rounded border border-border hover:bg-muted"><X size={12} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(m.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// ── HOME CONTENT TAB ──────────────────────────────────────────────────────────
function HomeContentTab() {
  const { language } = useI18n();
  const qc = useQueryClient();
  const { data: homeContent } = useGetHomeContent();
  const updateHome = useUpdateHomeContent({
    mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["getHomeContent"] }); setSaved(true); setTimeout(() => setSaved(false), 2000); } },
  });
  const [form, setForm]   = useState({ welcome: "", footer: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (homeContent) setForm({ welcome: homeContent.welcome, footer: homeContent.footer });
  }, [homeContent]);

  // Social links
  const { data: socialLinks } = useGetSocialLinks();
  const updateSocial = useUpdateSocialLinks({
    mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["getSocialLinks"] }); setSocialSaved(true); setTimeout(() => setSocialSaved(false), 2000); } },
  });
  const [socialForm, setSocialForm] = useState({ facebook: "", youtube: "", website: "" });
  const [socialSaved, setSocialSaved] = useState(false);

  useEffect(() => {
    if (socialLinks) setSocialForm({
      facebook: socialLinks.facebook ?? "",
      youtube:  socialLinks.youtube  ?? "",
      website:  socialLinks.website  ?? "",
    });
  }, [socialLinks]);

  const SECTIONS = ["complaints", "ideas", "news", "team", "directory"] as const;
  type SectionKey = typeof SECTIONS[number];
  const [visible, setVisible] = useState<Record<SectionKey, boolean>>(() => {
    const stored = localStorage.getItem("k4-sections");
    if (stored) return JSON.parse(stored);
    return { complaints: true, ideas: true, news: true, team: true, directory: true };
  });
  const toggleSection = (s: SectionKey) => {
    const next = { ...visible, [s]: !visible[s] };
    setVisible(next);
    localStorage.setItem("k4-sections", JSON.stringify(next));
  };

  const sectionLabels: Record<SectionKey, { en: string; np: string }> = {
    complaints: { en: "Complaints",  np: "उजुरी" },
    ideas:      { en: "Ideas",       np: "विचारहरू" },
    news:       { en: "News",        np: "समाचार" },
    team:       { en: "Team",        np: "टोली" },
    directory:  { en: "Directory",   np: "निर्देशिका" },
  };

  return (
    <div className="space-y-4">
      <Section icon={Home} title={language === "NP" ? "होम पेज सामग्री" : "Home Page Content"}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {language === "NP" ? "स्वागत सन्देश" : "Welcome Message"}
            </label>
            <textarea
              value={form.welcome}
              onChange={(e) => setForm({ ...form, welcome: e.target.value })}
              rows={2}
              className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {language === "NP" ? "फुटर पाठ" : "Footer Text"}
            </label>
            <input
              value={form.footer}
              onChange={(e) => setForm({ ...form, footer: e.target.value })}
              className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => updateHome.mutate({ data: form })}
            disabled={updateHome.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? (language === "NP" ? "सेभ भयो!" : "Saved!") : (language === "NP" ? "सेभ गर्नुहोस्" : "Save Content")}
          </button>
        </div>
      </Section>

      <Section icon={Link2} title={language === "NP" ? "सामाजिक सञ्जाल लिंकहरू" : "Social Media Links"}>
        <div className="space-y-3">
          {[
            { field: "facebook" as const, icon: Facebook, label: "Facebook", placeholder: "https://facebook.com/yourpage", color: "text-blue-600" },
            { field: "youtube"  as const, icon: Youtube,  label: "YouTube",  placeholder: "https://youtube.com/@yourchannel", color: "text-red-600" },
            { field: "website"  as const, icon: Globe,    label: "Website",  placeholder: "https://yourwebsite.gov.np", color: "text-green-600" },
          ].map(({ field, icon: Icon, label, placeholder, color }) => (
            <div key={field}>
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Icon size={12} className={color} /> {label}
              </label>
              <input
                value={socialForm[field]}
                onChange={(e) => setSocialForm({ ...socialForm, [field]: e.target.value })}
                placeholder={placeholder}
                className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
          <button
            onClick={() => updateSocial.mutate({ data: {
              facebook: socialForm.facebook || undefined,
              youtube:  socialForm.youtube  || undefined,
              website:  socialForm.website  || undefined,
            }})}
            disabled={updateSocial.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {socialSaved ? <Check size={14} /> : <Save size={14} />}
            {socialSaved
              ? (language === "NP" ? "सेभ भयो!" : "Saved!")
              : (language === "NP" ? "लिंकहरू सेभ गर्नुहोस्" : "Save Links")}
          </button>
          <p className="text-xs text-muted-foreground">
            {language === "NP"
              ? "सेभ गरेपछि फुटरमा स्वतः देखिन्छ।"
              : "Links appear in the site footer once saved. Leave blank to hide."}
          </p>
        </div>
      </Section>

      <Section icon={Eye} title={language === "NP" ? "खण्ड दृश्यता" : "Section Visibility"}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SECTIONS.map(s => (
            <button key={s} onClick={() => toggleSection(s)}
              className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                visible[s] ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground"
              )}>
              {visible[s] ? <Eye size={13} /> : <EyeOff size={13} />}
              {language === "NP" ? sectionLabels[s].np : sectionLabels[s].en}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {language === "NP" ? "यस उपकरणमा मात्र लागू हुन्छ।" : "Applies to this device only."}
        </p>
      </Section>
    </div>
  );
}

// ── CHANGE PASSWORD SECTION ──────────────────────────────────────────────────
function ChangePasswordSection() {
  const { language } = useI18n();

  const emptyPw = () => ({ current: "", next: "", confirm: "" });
  const [adminPw,  setAdminPw]  = useState(emptyPw);
  const [coordPw,  setCoordPw]  = useState(emptyPw);
  const [leaderPw, setLeaderPw] = useState(emptyPw);
  const [adminMsg,  setAdminMsg]  = useState<{ ok: boolean; text: string } | null>(null);
  const [coordMsg,  setCoordMsg]  = useState<{ ok: boolean; text: string } | null>(null);
  const [leaderMsg, setLeaderMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showAdminPw,  setShowAdminPw]  = useState(false);
  const [showCoordPw,  setShowCoordPw]  = useState(false);
  const [showLeaderPw, setShowLeaderPw] = useState(false);

  const handleChange = async (
    who: "admin" | "coord" | "leader",
    form: { current: string; next: string; confirm: string },
    setMsg: (m: { ok: boolean; text: string } | null) => void,
    setForm: (f: { current: string; next: string; confirm: string }) => void
  ) => {
    const t = (en: string, np: string) => language === "NP" ? np : en;

    if (!form.current || !form.next || !form.confirm) {
      setMsg({ ok: false, text: t("All fields are required.", "सबै फिल्ड आवश्यक छ।") }); return;
    }
    if (form.next.length < 4) {
      setMsg({ ok: false, text: t("New password must be at least 4 characters.", "नयाँ पासवर्ड कम्तिमा ४ अक्षर हुनुपर्छ।") }); return;
    }
    if (form.next !== form.confirm) {
      setMsg({ ok: false, text: t("Passwords do not match.", "पासवर्ड मेल खाएन।") }); return;
    }

    const adminToken = sessionStorage.getItem("k4-admin-token") ?? "";
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": adminToken },
        body: JSON.stringify({ account: who, currentPassword: form.current, newPassword: form.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? t("Failed to change password.", "पासवर्ड परिवर्तन भएन।") }); return;
      }
      const creds = getCredentials();
      saveCredentials({ ...creds, [who]: form.next });
      setForm(emptyPw());
      setMsg({ ok: true, text: t("Password changed successfully!", "पासवर्ड सफलतापूर्वक परिवर्तन भयो!") });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ ok: false, text: t("Could not connect to server.", "सर्भरसँग जडान भएन।") });
    }
  };

  const PwFields = ({
    form, setForm, show, setShow, onSubmit, label,
  }: {
    form: { current: string; next: string; confirm: string };
    setForm: (f: { current: string; next: string; confirm: string }) => void;
    show: boolean; setShow: (v: boolean) => void;
    onSubmit: () => void;
    label: string;
  }) => (
    <div className="space-y-2.5 p-4 bg-muted/50 rounded-xl border border-border">
      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Lock size={14} className="text-primary" /> {label}
      </p>
      {[
        { key: "current" as const, placeholder: language === "NP" ? "हालको पासवर्ड" : "Current password" },
        { key: "next"    as const, placeholder: language === "NP" ? "नयाँ पासवर्ड"  : "New password" },
        { key: "confirm" as const, placeholder: language === "NP" ? "पासवर्ड दोहोर्याउनुस्" : "Confirm new password" },
      ].map(({ key, placeholder }) => (
        <div key={key} className="relative">
          <input
            type={show ? "text" : "password"}
            value={form[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
            placeholder={placeholder}
            className="w-full pr-9 pl-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {key === "current" && (
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onSubmit}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
      >
        <Lock size={13} />
        {language === "NP" ? "पासवर्ड परिवर्तन गर्नुस्" : "Change Password"}
      </button>
    </div>
  );

  return (
    <Section icon={Lock} title={language === "NP" ? "पासवर्ड परिवर्तन" : "Change Passwords"}>
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          {language === "NP"
            ? "सुपर एडमिनले तीनवटै खाताको पासवर्ड यहाँबाट परिवर्तन गर्न सकिन्छ।"
            : "Super Admin can update passwords for all three accounts here."}
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <PwFields
              form={adminPw} setForm={setAdminPw}
              show={showAdminPw} setShow={setShowAdminPw}
              label={language === "NP" ? "Admin पासवर्ड" : "Admin Password"}
              onSubmit={() => handleChange("admin", adminPw, setAdminMsg, setAdminPw)}
            />
            {adminMsg && (
              <p className={cn("text-xs flex items-center gap-1.5", adminMsg.ok ? "text-green-600" : "text-red-500")}>
                {adminMsg.ok ? <Check size={11} /> : <X size={11} />} {adminMsg.text}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <PwFields
              form={coordPw} setForm={setCoordPw}
              show={showCoordPw} setShow={setShowCoordPw}
              label={language === "NP" ? "Coordinator पासवर्ड" : "Coordinator Password"}
              onSubmit={() => handleChange("coord", coordPw, setCoordMsg, setCoordPw)}
            />
            {coordMsg && (
              <p className={cn("text-xs flex items-center gap-1.5", coordMsg.ok ? "text-green-600" : "text-red-500")}>
                {coordMsg.ok ? <Check size={11} /> : <X size={11} />} {coordMsg.text}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <PwFields
              form={leaderPw} setForm={setLeaderPw}
              show={showLeaderPw} setShow={setShowLeaderPw}
              label={language === "NP" ? "Leader पासवर्ड" : "Leader Password"}
              onSubmit={() => handleChange("leader", leaderPw, setLeaderMsg, setLeaderPw)}
            />
            {leaderMsg && (
              <p className={cn("text-xs flex items-center gap-1.5", leaderMsg.ok ? "text-green-600" : "text-red-500")}>
                {leaderMsg.ok ? <Check size={11} /> : <X size={11} />} {leaderMsg.text}
              </p>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
            <AlertTriangle size={13} />
            {language === "NP"
              ? "नयाँ पासवर्ड याद राख्नुहोस् — यो यन्त्रमा सेभ हुन्छ।"
              : "Remember your new password — it is saved on this device."}
          </p>
        </div>
      </div>
    </Section>
  );
}

// ── TEAM APPLICATIONS TAB ─────────────────────────────────────────────────────
function ApplicationsTab() {
  const { language } = useI18n();
  const qc = useQueryClient();
  const { data: applications = [], isLoading } = useListTeamApplications({});

  const updateStatus = useUpdateTeamApplicationStatus({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["listTeamApplications"] }) },
  });
  const deleteApp = useDeleteTeamApplication({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["listTeamApplications"] }) },
  });

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const filtered = applications.filter(a => !filterStatus || a.status === filterStatus);

  const statusCls = (s: string) => ({
    pending:  "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  }[s] ?? "bg-muted text-foreground");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-2 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none">
          <option value="">{language === "NP" ? "सबै स्थिति" : "All Status"}</option>
          <option value="pending">{language === "NP" ? "विचाराधीन" : "Pending"}</option>
          <option value="approved">{language === "NP" ? "स्वीकृत" : "Approved"}</option>
          <option value="rejected">{language === "NP" ? "अस्वीकृत" : "Rejected"}</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} {language === "NP" ? "आवेदनहरू" : "applications"}
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {language === "NP" ? "लोड हुँदैछ..." : "Loading..."}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          {language === "NP" ? "कुनै आवेदन छैन" : "No applications found"}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(app => (
            <div key={app.id} className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground">{app.name}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", statusCls(app.status))}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {app.phone} · {app.palika} · Ward {app.ward}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {language === "NP" ? "सीप: " : "Skills: "}{app.skills}
                  </p>
                  {app.message && (
                    <p className="text-xs text-muted-foreground mt-0.5 italic">"{app.message}"</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {app.status !== "approved" && (
                    <button onClick={() => updateStatus.mutate({ id: app.id, data: { status: "approved" } })}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition-colors font-medium">
                      {language === "NP" ? "स्वीकार" : "Approve"}
                    </button>
                  )}
                  {app.status !== "rejected" && (
                    <button onClick={() => updateStatus.mutate({ id: app.id, data: { status: "rejected" } })}
                      className="px-2 py-1 text-xs bg-orange-100 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-200 transition-colors font-medium">
                      {language === "NP" ? "अस्वीकार" : "Reject"}
                    </button>
                  )}
                  {confirmDelete === app.id ? (
                    <>
                      <button onClick={() => { deleteApp.mutate({ id: app.id }); setConfirmDelete(null); }}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg font-medium">
                        {language === "NP" ? "पक्का?" : "Sure?"}
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="p-1 rounded-lg hover:bg-muted"><X size={12} /></button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(app.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(app.createdAt).toLocaleDateString()} {app.citizenId ? `· Citizen #${app.citizenId}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ALERTS TAB ────────────────────────────────────────────────────────────────
const PALIKA_LABELS: Record<string, string> = {
  godawari: "Godawari", gauriganga: "Gauriganga", chure: "Chure", mohanyal: "Mohanyal",
};
const COMPLAINT_CAT_LABELS: Record<string, string> = {
  pm_council: "PM & Council", finance: "Finance", infrastructure: "Infrastructure",
  health: "Health", education: "Education", agriculture: "Agriculture",
  foreign_affairs: "Foreign Affairs", law_justice: "Law & Justice", home_affairs: "Home Affairs",
  defence: "Defence", forests: "Forests", energy: "Energy", industry: "Industry",
  urban: "Urban Dev.", women_children: "Women & Children",
  culture_tourism: "Culture & Tourism", communication: "Communication",
  corruption: "Corruption / Misconduct",
};

function AlertsTab() {
  const { language } = useI18n();
  const { data: complaints = [], isLoading: cLoading } = useListComplaints({});
  const { data: applications = [], isLoading: aLoading } = useListTeamApplications({});

  const t = (en: string, np: string) => language === "NP" ? np : en;

  const corruptionAlerts = complaints.filter(c => c.category === "corruption" && c.status !== "resolved");
  const pendingComplaints = complaints.filter(c => c.status === "pending" && c.category !== "corruption");
  const pendingApps = applications.filter(a => a.status === "pending");
  const inProgressComplaints = complaints.filter(c => c.status === "in_progress" && c.category !== "corruption");

  const totalAlerts = corruptionAlerts.length + pendingComplaints.length + pendingApps.length;

  if (cLoading || aLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        <Clock size={16} className="mr-2 animate-spin" />
        {t("Loading alerts...", "अलर्ट लोड हुँदैछ...")}
      </div>
    );
  }

  const renderComplaintRow = (c: typeof complaints[number], urgent?: boolean) => (
    <div key={c.id} className={cn(
      "flex items-start gap-3 p-3 rounded-xl border transition-colors",
      urgent ? "bg-red-50 border-red-200" : "bg-card border-border hover:bg-muted/50"
    )}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        urgent ? "bg-red-100" : "bg-orange-100"
      )}>
        {urgent ? <ShieldAlert size={16} className="text-red-600" /> : <FileText size={16} className="text-orange-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0",
            urgent ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
          )}>
            {urgent ? t("Corruption", "भ्रष्टाचार") : t("Pending", "विचाराधीन")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {PALIKA_LABELS[c.palika] ?? c.palika} · {t("Ward", "वार्ड")} {c.ward} ·{" "}
          {COMPLAINT_CAT_LABELS[c.category] ?? c.category}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {c.description}
        </p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">#{c.id}</span>
    </div>
  );

  const renderAppRow = (a: typeof applications[number]) => (
    <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
        <UserCheck size={16} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex-shrink-0">
            {t("Application", "आवेदन")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {PALIKA_LABELS[a.palika?.toLowerCase()] ?? a.palika} · {t("Ward", "वार्ड")} {a.ward}
        </p>
        {a.skills && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.skills}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
          <ShieldAlert size={15} className="text-red-600" />
          <span className="text-sm font-semibold text-red-700">{corruptionAlerts.length}</span>
          <span className="text-xs text-red-600">{t("Corruption Reports", "भ्रष्टाचार रिपोर्ट")}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl">
          <FileText size={15} className="text-orange-600" />
          <span className="text-sm font-semibold text-orange-700">{pendingComplaints.length}</span>
          <span className="text-xs text-orange-600">{t("Pending Complaints", "विचाराधीन उजुरी")}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
          <Clock size={15} className="text-yellow-600" />
          <span className="text-sm font-semibold text-yellow-700">{inProgressComplaints.length}</span>
          <span className="text-xs text-yellow-600">{t("In Progress", "प्रक्रियामा")}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
          <UserCheck size={15} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">{pendingApps.length}</span>
          <span className="text-xs text-blue-600">{t("Team Applications", "टोली आवेदन")}</span>
        </div>
      </div>

      {totalAlerts === 0 && pendingApps.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t("No pending alerts — all caught up!", "कुनै अलर्ट छैन — सबै ठीक छ!")}</p>
        </div>
      ) : (
        <>
          {/* Corruption alerts — highest priority */}
          {corruptionAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={15} className="text-red-600" />
                <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                  {t("Corruption Reports", "भ्रष्टाचार रिपोर्टहरू")}
                  <span className="ml-2 text-xs bg-red-600 text-white rounded-full px-1.5 py-0.5 font-bold">{corruptionAlerts.length}</span>
                </h3>
              </div>
              {corruptionAlerts.map(c => renderComplaintRow(c, true))}
            </div>
          )}

          {/* Pending complaints */}
          {pendingComplaints.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-orange-600" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  {t("Pending Complaints", "विचाराधीन उजुरीहरू")}
                  <span className="ml-2 text-xs bg-orange-500 text-white rounded-full px-1.5 py-0.5 font-bold">{pendingComplaints.length}</span>
                </h3>
              </div>
              {pendingComplaints.map(c => renderComplaintRow(c, false))}
            </div>
          )}

          {/* Pending applications */}
          {pendingApps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck size={15} className="text-blue-600" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  {t("Pending Team Applications", "विचाराधीन टोली आवेदन")}
                  <span className="ml-2 text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5 font-bold">{pendingApps.length}</span>
                </h3>
              </div>
              {pendingApps.map(a => renderAppRow(a))}
            </div>
          )}

          {inProgressComplaints.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-yellow-600" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  {t("In Progress", "प्रक्रियामा")}
                  <span className="ml-2 text-xs bg-yellow-500 text-white rounded-full px-1.5 py-0.5 font-bold">{inProgressComplaints.length}</span>
                </h3>
              </div>
              {inProgressComplaints.map(c => (
                <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl border border-yellow-200 bg-yellow-50/50">
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {PALIKA_LABELS[c.palika] ?? c.palika} · {t("Ward", "वार्ड")} {c.ward} · {COMPLAINT_CAT_LABELS[c.category] ?? c.category}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">#{c.id}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── EVENTS TAB ────────────────────────────────────────────────────────────────
const EVENT_TYPE_OPTIONS = [
  { value: "festival",           labelEn: "Festival",           labelNp: "महोत्सव",              icon: PartyPopper },
  { value: "government_program", labelEn: "Government Program", labelNp: "सरकारी कार्यक्रम",    icon: Landmark },
  { value: "development_update", labelEn: "Development Update", labelNp: "विकास अद्यावधिक",     icon: Construction },
  { value: "cultural_program",   labelEn: "Cultural Program",   labelNp: "सांस्कृतिक कार्यक्रम", icon: null },
  { value: "public_notice",      labelEn: "Public Notice",      labelNp: "सार्वजनिक सूचना",     icon: Megaphone },
];

const EVENT_TYPE_BADGES: Record<string, string> = {
  festival:           "bg-yellow-100 text-yellow-800",
  government_program: "bg-blue-100 text-blue-800",
  development_update: "bg-orange-100 text-orange-800",
  cultural_program:   "bg-purple-100 text-purple-800",
  public_notice:      "bg-red-100 text-red-800",
};

function EventsTab() {
  const { language } = useI18n();
  const qc = useQueryClient();
  const { data: events = [], isLoading } = useListEvents();
  const createEv = useCreateEvent({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/events"] }); setForm({ title: "", description: "", eventType: "public_notice", eventDate: "", imageUrl: "" }); setShowForm(false); } } });
  const updateEv = useUpdateEvent({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/events"] }); setEditId(null); } } });
  const deleteEv = useDeleteEvent({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/events"] }) } });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", description: "", eventType: "public_notice", eventDate: "", imageUrl: "" });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, imageUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    const payload = { title: form.title.trim(), description: form.description.trim(), eventType: form.eventType, imageUrl: form.imageUrl || undefined, eventDate: form.eventDate || undefined };
    if (editId !== null) {
      await updateEv.mutateAsync({ id: editId, data: payload });
    } else {
      await createEv.mutateAsync({ data: payload });
    }
  };

  const startEdit = (ev: typeof events[0]) => {
    setForm({ title: ev.title, description: ev.description, eventType: ev.eventType, eventDate: ev.eventDate ?? "", imageUrl: ev.imageUrl ?? "" });
    setEditId(ev.id);
    setShowForm(true);
  };

  const sorted = [...events].reverse();

  return (
    <div className="space-y-5">
      <Section icon={CalendarDays} title={language === "NP" ? "कार्यक्रम व्यवस्थापन" : "Event Management"}>
        <div className="flex justify-end">
          <button
            onClick={() => { setShowForm(s => !s); setEditId(null); setForm({ title: "", description: "", eventType: "public_notice", eventDate: "", imageUrl: "" }); }}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            {language === "NP" ? "नयाँ कार्यक्रम" : "New Event"}
          </button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="border border-border rounded-xl p-4 space-y-4 bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground">
              {editId !== null
                ? (language === "NP" ? "कार्यक्रम सम्पादन" : "Edit Event")
                : (language === "NP" ? "नयाँ कार्यक्रम थप्नुहोस्" : "Add New Event")}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{language === "NP" ? "शीर्षक" : "Title"} *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={language === "NP" ? "कार्यक्रमको शीर्षक" : "Event title"} />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{language === "NP" ? "विवरण" : "Description"} *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder={language === "NP" ? "कार्यक्रमको विवरण" : "Event description"} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{language === "NP" ? "प्रकार" : "Event Type"}</label>
                  <select value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))}
                    className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    {EVENT_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {language === "NP" ? opt.labelNp : opt.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{language === "NP" ? "मिति (वैकल्पिक)" : "Date (Optional)"}</label>
                  <input type="text" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                    className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={language === "NP" ? "जस्तै: २०८२ बैशाख १५" : "e.g. April 28, 2025"} />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{language === "NP" ? "तस्बिर (वैकल्पिक)" : "Image (Optional)"}</label>
                <div className="mt-1 flex items-center gap-3">
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0" />
                  )}
                  <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                    <Upload size={13} />
                    {language === "NP" ? "तस्बिर छान्नुहोस्" : "Choose Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {form.imageUrl && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}
                      className="text-xs text-destructive hover:underline flex items-center gap-1">
                      <X size={11} /> {language === "NP" ? "हटाउनुहोस्" : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={handleSubmit} disabled={createEv.isPending || updateEv.isPending || !form.title.trim() || !form.description.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
                <Save size={13} />
                {editId !== null
                  ? (language === "NP" ? "अद्यावधिक गर्नुहोस्" : "Update Event")
                  : (language === "NP" ? "पोस्ट गर्नुहोस्" : "Post Event")}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                {language === "NP" ? "रद्द" : "Cancel"}
              </button>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-pulse bg-muted rounded-xl" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {language === "NP" ? "कुनै कार्यक्रम छैन" : "No events posted yet"}
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(ev => (
              <div key={ev.id} className="flex gap-3 p-3 rounded-xl border border-border bg-background hover:bg-muted/30 transition-colors">
                {ev.imageUrl && (
                  <img src={ev.imageUrl} alt={ev.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-border" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", EVENT_TYPE_BADGES[ev.eventType] ?? "bg-muted text-muted-foreground")}>
                        {EVENT_TYPE_OPTIONS.find(o => o.value === ev.eventType)?.[language === "NP" ? "labelNp" : "labelEn"] ?? ev.eventType}
                      </span>
                      <p className="font-semibold text-sm text-foreground mt-1 truncate">{ev.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ev.description}</p>
                      {ev.eventDate && <p className="text-xs text-muted-foreground/70 mt-1">{ev.eventDate}</p>}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => startEdit(ev)} title={language === "NP" ? "सम्पादन" : "Edit"}
                        className="w-7 h-7 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors">
                        <Edit2 size={12} />
                      </button>
                      {confirmDelete === ev.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => { deleteEv.mutate({ id: ev.id }); setConfirmDelete(null); }}
                            className="px-2 py-1 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium">
                            {language === "NP" ? "हो" : "Yes"}
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 rounded-lg border border-border text-xs">
                            {language === "NP" ? "नाइँ" : "No"}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(ev.id)} title={language === "NP" ? "मेटाउनुहोस्" : "Delete"}
                          className="w-7 h-7 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── MAIN ADMIN COMPONENT ──────────────────────────────────────────────────────
export default function Admin() {
  const { language } = useI18n();
  const qc = useQueryClient();

  const [unlocked, setUnlocked] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(() => {
    const stored = sessionStorage.getItem("admin_role") as AdminRole | null;
    const token = sessionStorage.getItem("k4-admin-token");
    if (stored && token) return stored;
    return null;
  });

  useEffect(() => {
    if (role) setUnlocked(true);
  }, []);

  const [activeTab, setActiveTab] = useState<TabKey>("analytics");

  // MP Profile
  const { data: mpProfile } = useGetMpProfile();
  const updateMp = useUpdateMpProfile({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["getMpProfile"] }) } });
  const [mpForm, setMpForm] = useState({ name: "", message: "", photoUrl: "" });
  const [mpSaved, setMpSaved] = useState(false);
  useEffect(() => {
    if (mpProfile) setMpForm({ name: mpProfile.name, message: mpProfile.message, photoUrl: mpProfile.photoUrl ?? "" });
  }, [mpProfile]);

  // Alert badge counts (fetched here for the tab badge — AlertsTab does its own fetch internally)
  const { data: _alertComplaints = [] } = useListComplaints({});
  const { data: _alertApps = [] } = useListTeamApplications({});
  const alertBadgeCount =
    _alertComplaints.filter(c => c.category === "corruption" && c.status !== "resolved").length +
    _alertComplaints.filter(c => c.status === "pending" && c.category !== "corruption").length +
    _alertApps.filter(a => a.status === "pending").length;

  // Theme
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(() => (localStorage.getItem("k4-theme") as ThemeKey) ?? "red");
  const handleTheme = (t: ThemeKey) => { applyTheme(t); setActiveTheme(t); };

  const logout = () => {
    sessionStorage.removeItem("admin_role");
    sessionStorage.removeItem("k4-admin-token");
    setUnlocked(false);
    setRole(null);
  };

  const handleUnlock = (r: AdminRole) => { setRole(r); setUnlocked(true); };

  if (!unlocked || !role) return <LoginGate onUnlock={handleUnlock} />;

  const isSuperAdmin  = role === "super_admin";
  const isCoordinator = role === "coordinator";
  const isLeader      = role === "leader";

  const TABS: { key: TabKey; label: string; labelNp: string; icon: React.ComponentType<{ size?: number }>; badge?: number }[] = [
    { key: "analytics",  label: "Analytics",  labelNp: "विश्लेषण",    icon: BarChart2 },
    { key: "alerts",     label: "Alerts",     labelNp: "अलर्ट",       icon: Bell,     badge: alertBadgeCount > 0 ? alertBadgeCount : undefined },
    { key: "complaints", label: "Complaints", labelNp: "उजुरीहरू",    icon: FileText },
    ...(!isLeader ? [
      { key: "team" as TabKey,         label: "Team",         labelNp: "टोली",         icon: Users },
      { key: "applications" as TabKey, label: "Applications", labelNp: "आवेदनहरू",    icon: UserCheck },
    ] : []),
    ...(isSuperAdmin ? [
      { key: "events" as TabKey,       label: "Events",       labelNp: "कार्यक्रम",    icon: CalendarDays },
      { key: "home" as TabKey,         label: "Home",         labelNp: "होम",          icon: Home },
      { key: "theme" as TabKey,        label: "Theme",        labelNp: "थिम",          icon: Palette },
      { key: "profile" as TabKey,      label: "MP Profile",   labelNp: "सांसद",        icon: User },
    ] : []),
  ];

  // Ensure active tab is available for this role
  const availableTabs = TABS.map(t => t.key);
  const safeTab = availableTabs.includes(activeTab) ? activeTab : "analytics";

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={22} className="text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {language === "NP" ? "एडमिन नियन्त्रण प्रणाली" : "Admin Control Panel"}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isSuperAdmin
                ? <><Shield size={11} className="text-primary" /><span className="text-xs text-primary font-medium">{language === "NP" ? "सुपर एडमिन" : "Super Admin"}</span></>
                : isCoordinator
                ? <><UserCheck size={11} className="text-blue-500" /><span className="text-xs text-blue-500 font-medium">{language === "NP" ? "समन्वयकर्ता" : "Coordinator"}</span></>
                : <><Users size={11} className="text-orange-500" /><span className="text-xs text-orange-500 font-medium">{language === "NP" ? "नेता" : "Leader"}</span></>
              }
            </div>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LogOut size={15} /> {language === "NP" ? "बाहिर" : "Logout"}
        </button>
      </div>

      {/* Role notice */}
      {isCoordinator && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
          <AlertTriangle size={15} />
          {language === "NP"
            ? "समन्वयकर्ता पहुँच: उजुरी, टोली र आवेदन व्यवस्थापन गर्न सक्नुहुन्छ। मेटाउने र सेटिङका लागि सुपर एडमिन चाहिन्छ।"
            : "Coordinator access: Manage complaints, team and applications. Deletes and settings require Super Admin."}
        </div>
      )}
      {isLeader && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
          <AlertTriangle size={15} />
          {language === "NP"
            ? "नेता पहुँच: उजुरी हेर्न र स्थिति परिवर्तन गर्न सक्नुहुन्छ। अरू कार्यका लागि उच्च पहुँच चाहिन्छ।"
            : "Leader access: View and update complaint statuses. Higher access required for other actions."}
        </div>
      )}

      {/* Tab nav */}
      <div className="flex gap-1 flex-wrap border-b border-border pb-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all -mb-px",
                safeTab === tab.key
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon size={14} />
              {language === "NP" ? tab.labelNp : tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={safeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {safeTab === "analytics"    && <AnalyticsTab />}
          {safeTab === "alerts"       && <AlertsTab />}
          {safeTab === "complaints"   && <ComplaintsTab role={role} />}
          {safeTab === "team"         && !isLeader && <TeamTab />}
          {safeTab === "applications" && !isLeader && <ApplicationsTab />}
          {safeTab === "events"       && isSuperAdmin && <EventsTab />}
          {safeTab === "home"         && isSuperAdmin && <HomeContentTab />}

          {safeTab === "theme" && isSuperAdmin && (
            <Section icon={Palette} title={language === "NP" ? "थिम रङ" : "Theme Color"}>
              <div className="flex flex-wrap gap-3">
                {THEMES.map(t => (
                  <button key={t.key} onClick={() => handleTheme(t.key)}
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all",
                      activeTheme === t.key ? "border-foreground shadow-md scale-105" : "border-transparent hover:border-border"
                    )}>
                    <span className={cn("w-4 h-4 rounded-full", t.color)} />
                    {language === "NP" ? t.labelNp : t.label}
                    {activeTheme === t.key && <Check size={12} />}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {safeTab === "profile" && isSuperAdmin && (
            <div className="space-y-6">
              <Section icon={User} title={language === "NP" ? "सांसद प्रोफाइल" : "MP Profile"}>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {language === "NP" ? "नाम" : "Name"}
                    </label>
                    <input
                      value={mpForm.name}
                      onChange={e => setMpForm({ ...mpForm, name: e.target.value })}
                      className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {language === "NP" ? "सन्देश" : "Message"}
                    </label>
                    <textarea
                      value={mpForm.message}
                      onChange={e => setMpForm({ ...mpForm, message: e.target.value })}
                      rows={3}
                      className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  {/* Photo upload */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {language === "NP" ? "फोटो" : "Photo"}
                    </label>
                    <div className="mt-2 flex items-center gap-4">
                      {/* Preview */}
                      <div className="w-20 h-20 rounded-full border-2 border-border bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {mpForm.photoUrl
                          ? <img src={mpForm.photoUrl} alt="MP" className="w-full h-full object-cover" />
                          : <User size={32} className="text-muted-foreground" />
                        }
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                          <Upload size={14} />
                          {language === "NP" ? "फोटो छान्नुहोस्" : "Choose Photo"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = ev => {
                                setMpForm(f => ({ ...f, photoUrl: ev.target?.result as string }));
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                        {mpForm.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setMpForm(f => ({ ...f, photoUrl: "" }))}
                            className="flex items-center gap-1 text-xs text-destructive hover:underline"
                          >
                            <X size={12} />
                            {language === "NP" ? "हटाउनुहोस्" : "Remove"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await updateMp.mutateAsync({ data: { name: mpForm.name, message: mpForm.message, photoUrl: mpForm.photoUrl || undefined } });
                      setMpSaved(true); setTimeout(() => setMpSaved(false), 2000);
                    }}
                    disabled={updateMp.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {mpSaved ? <Check size={14} /> : <Save size={14} />}
                    {mpSaved ? (language === "NP" ? "सेभ भयो!" : "Saved!") : (language === "NP" ? "सेभ गर्नुहोस्" : "Save Profile")}
                  </button>
                </div>
              </Section>

              <ChangePasswordSection />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
