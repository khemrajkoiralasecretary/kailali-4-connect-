import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import {
  useGetMpProfile, useUpdateMpProfile, useGetDashboardStats,
  useListTeamMembers, useDeleteAllTeamMembers, useDeleteAllComplaints,
  useListComplaints, useDeleteComplaint, useUpdateComplaintStatus,
  useDeleteTeamMember, useEditTeamMember, useJoinTeam, useUpdateTeamRank,
  useGetHomeContent, useUpdateHomeContent,
  useGetSocialLinks, useUpdateSocialLinks,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, LogOut, User, Palette, Users, FileText, BarChart2,
  Save, Trash2, Eye, EyeOff, Check, Lock, Home, Edit2, X,
  Plus, Shield, UserCheck, Search, AlertTriangle,
  Facebook, Youtube, Globe, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUPER_PIN = "1234";
const STAFF_PIN  = "5678";

type AdminRole = "super_admin" | "staff";
type TabKey = "analytics" | "complaints" | "team" | "home" | "theme" | "profile";

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

// ── PIN GATE ─────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: (role: AdminRole) => void }) {
  const { language } = useI18n();
  const [selected, setSelected] = useState<AdminRole | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      const correct =
        (selected === "super_admin" && next === SUPER_PIN) ||
        (selected === "staff" && next === STAFF_PIN);
      if (correct) {
        sessionStorage.setItem("admin_role", selected!);
        onUnlock(selected!);
      } else {
        setTimeout(() => { setPin(""); setError(true); }, 300);
      }
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-8 w-80 space-y-6 shadow-xl text-center"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck size={28} className="text-primary" />
          </div>
          <h2 className="font-bold text-lg text-foreground">
            {language === "NP" ? "एडमिन प्रणाली" : "Admin System"}
          </h2>
        </div>

        {!selected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {language === "NP" ? "आफ्नो भूमिका छान्नुहोस्" : "Select your role"}
            </p>
            <button
              onClick={() => setSelected("super_admin")}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <Shield size={18} className="text-primary" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  {language === "NP" ? "सुपर एडमिन" : "Super Admin"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === "NP" ? "पूर्ण नियन्त्रण" : "Full control"}
                </p>
              </div>
            </button>
            <button
              onClick={() => setSelected("staff")}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-border hover:border-primary/30 hover:bg-muted transition-colors"
            >
              <UserCheck size={18} className="text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  {language === "NP" ? "स्टाफ" : "Staff"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === "NP" ? "सीमित पहुँच" : "Limited access"}
                </p>
              </div>
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selected === "super_admin" ? <Shield size={15} className="text-primary" /> : <UserCheck size={15} className="text-muted-foreground" />}
                <span className="text-sm font-medium text-foreground">
                  {selected === "super_admin" ? (language === "NP" ? "सुपर एडमिन" : "Super Admin") : (language === "NP" ? "स्टाफ" : "Staff")}
                </span>
              </div>
              <button onClick={() => { setSelected(null); setPin(""); setError(false); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X size={12} /> {language === "NP" ? "बदल्नुस्" : "Change"}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              {language === "NP" ? "PIN प्रविष्ट गर्नुहोस्" : "Enter PIN"}
            </p>

            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={cn("w-4 h-4 rounded-full border-2 transition-all",
                  pin.length > i
                    ? error ? "bg-red-500 border-red-500" : "bg-primary border-primary"
                    : "border-border bg-background"
                )} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    if (d === "⌫") { setPin((p) => p.slice(0, -1)); setError(false); }
                    else if (d !== "") handleDigit(d);
                  }}
                  disabled={d === ""}
                  className={cn("h-12 rounded-xl text-lg font-semibold transition-all",
                    d === "" ? "pointer-events-none" : "bg-muted hover:bg-muted/70 active:scale-95 text-foreground"
                  )}
                >{d}</button>
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 flex items-center justify-center gap-1">
                <X size={11} /> {language === "NP" ? "गलत PIN" : "Wrong PIN — try again"}
              </p>
            )}
          </>
        )}
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

// ── MAIN ADMIN COMPONENT ──────────────────────────────────────────────────────
export default function Admin() {
  const { language } = useI18n();
  const qc = useQueryClient();

  const [unlocked, setUnlocked] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(() => {
    const stored = sessionStorage.getItem("admin_role") as AdminRole | null;
    if (stored) return stored;
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

  // Theme
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(() => (localStorage.getItem("k4-theme") as ThemeKey) ?? "red");
  const handleTheme = (t: ThemeKey) => { applyTheme(t); setActiveTheme(t); };

  const logout = () => {
    sessionStorage.removeItem("admin_role");
    setUnlocked(false);
    setRole(null);
  };

  const handleUnlock = (r: AdminRole) => { setRole(r); setUnlocked(true); };

  if (!unlocked || !role) return <PinGate onUnlock={handleUnlock} />;

  const isSuperAdmin = role === "super_admin";

  const TABS: { key: TabKey; label: string; labelNp: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: "analytics",  label: "Analytics",  labelNp: "विश्लेषण",    icon: BarChart2 },
    { key: "complaints", label: "Complaints", labelNp: "उजुरीहरू",    icon: FileText },
    ...(isSuperAdmin ? [
      { key: "team" as TabKey,    label: "Team",         labelNp: "टोली",         icon: Users },
      { key: "home" as TabKey,    label: "Home",         labelNp: "होम",          icon: Home },
      { key: "theme" as TabKey,   label: "Theme",        labelNp: "थिम",          icon: Palette },
      { key: "profile" as TabKey, label: "MP Profile",   labelNp: "सांसद",        icon: User },
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
                : <><UserCheck size={11} className="text-muted-foreground" /><span className="text-xs text-muted-foreground font-medium">{language === "NP" ? "स्टाफ" : "Staff"}</span></>
              }
            </div>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LogOut size={15} /> {language === "NP" ? "बाहिर" : "Logout"}
        </button>
      </div>

      {/* Staff notice */}
      {!isSuperAdmin && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
          <AlertTriangle size={15} />
          {language === "NP"
            ? "स्टाफ पहुँच: उजुरी स्थिति परिवर्तन गर्न सक्नुहुन्छ। पूर्ण नियन्त्रणको लागि सुपर एडमिनको रूपमा लग इन गर्नुहोस्।"
            : "Staff access: You can update complaint statuses. Log in as Super Admin for full control."}
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
          {safeTab === "analytics"  && <AnalyticsTab />}
          {safeTab === "complaints" && <ComplaintsTab role={role} />}
          {safeTab === "team"       && isSuperAdmin && <TeamTab />}
          {safeTab === "home"       && isSuperAdmin && <HomeContentTab />}

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
            <Section icon={User} title={language === "NP" ? "सांसद प्रोफाइल" : "MP Profile"}>
              <div className="space-y-3">
                {[
                  { field: "name", label: language === "NP" ? "नाम" : "Name", multi: false, placeholder: "" },
                  { field: "message", label: language === "NP" ? "सन्देश" : "Message", multi: true, placeholder: "" },
                  { field: "photoUrl", label: language === "NP" ? "फोटो URL" : "Photo URL", multi: false, placeholder: "https://..." },
                ].map(({ field, label, multi, placeholder }) => (
                  <div key={field}>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
                    {multi ? (
                      <textarea
                        value={mpForm[field as keyof typeof mpForm]}
                        onChange={e => setMpForm({ ...mpForm, [field]: e.target.value })}
                        rows={2}
                        className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    ) : (
                      <input
                        value={mpForm[field as keyof typeof mpForm]}
                        onChange={e => setMpForm({ ...mpForm, [field]: e.target.value })}
                        placeholder={placeholder}
                        className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    )}
                  </div>
                ))}
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
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
