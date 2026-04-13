import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import {
  useGetMpProfile,
  useUpdateMpProfile,
  useGetDashboardStats,
  useListTeamMembers,
  useDeleteAllTeamMembers,
  useDeleteAllComplaints,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ShieldCheck, LogOut, User, Palette, Users, FileText,
  BarChart2, Save, Trash2, Eye, EyeOff, Check, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_PIN = "1234";

const THEMES = [
  { key: "red",    label: "Red",    labelNp: "रातो",    color: "bg-red-600" },
  { key: "blue",   label: "Blue",   labelNp: "नीलो",    color: "bg-blue-600" },
  { key: "green",  label: "Green",  labelNp: "हरियो",   color: "bg-green-600" },
  { key: "black",  label: "Black",  labelNp: "कालो",    color: "bg-gray-800" },
  { key: "purple", label: "Purple", labelNp: "बैजनी",   color: "bg-purple-700" },
] as const;
type ThemeKey = typeof THEMES[number]["key"];

function applyTheme(theme: ThemeKey) {
  const el = document.documentElement;
  el.classList.remove("theme-blue", "theme-green", "theme-black", "theme-purple");
  if (theme !== "red") el.classList.add(`theme-${theme}`);
  localStorage.setItem("k4-theme", theme);
}

// ── PIN GATE ─────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const { language } = useI18n();
  const [pin, setPin]       = useState("");
  const [error, setError]   = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === ADMIN_PIN) {
        sessionStorage.setItem("admin_unlocked", "1");
        onUnlock();
      } else {
        setTimeout(() => { setPin(""); setError(true); }, 300);
      }
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-8 w-72 space-y-6 shadow-lg text-center"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock size={22} className="text-primary" />
          </div>
          <h2 className="font-bold text-foreground">
            {language === "NP" ? "एडमिन पहुँच" : "Admin Access"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {language === "NP" ? "४ अंकको PIN प्रविष्ट गर्नुहोस्" : "Enter 4-digit PIN"}
          </p>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all",
                pin.length > i
                  ? error ? "bg-red-500 border-red-500" : "bg-primary border-primary"
                  : "border-border bg-background"
              )}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2">
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d) => (
            <button
              key={d}
              onClick={() => {
                if (d === "⌫") { setPin((p) => p.slice(0, -1)); setError(false); }
                else if (d !== "") handleDigit(d);
              }}
              disabled={d === ""}
              className={cn(
                "h-12 rounded-xl text-lg font-semibold transition-all",
                d === "" ? "pointer-events-none" : "bg-muted hover:bg-muted/70 active:scale-95 text-foreground"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-500">
            {language === "NP" ? "गलत PIN! फेरि प्रयास गर्नुहोस्" : "Wrong PIN — try again"}
          </p>
        )}
        <p className="text-xs text-muted-foreground/60">
          {language === "NP" ? "संकेत: 1234" : "Hint: 1234"}
        </p>
      </motion.div>
    </div>
  );
}

// ── MAIN PANEL ────────────────────────────────────────────────────────────────
export default function Admin() {
  const { language } = useI18n();
  const qc = useQueryClient();

  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("admin_unlocked") === "1"
  );

  // MP profile form
  const { data: mpProfile } = useGetMpProfile();
  const updateMp = useUpdateMpProfile({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["getMpProfile"] }) } });
  const [mpForm, setMpForm] = useState({ name: "", message: "", photoUrl: "" });
  const [mpSaved, setMpSaved] = useState(false);
  useEffect(() => {
    if (mpProfile) setMpForm({ name: mpProfile.name, message: mpProfile.message, photoUrl: mpProfile.photoUrl ?? "" });
  }, [mpProfile]);

  // Stats
  const { data: stats } = useGetDashboardStats();
  const { data: teamMembers } = useListTeamMembers();

  // Delete all mutations
  const deleteTeam = useDeleteAllTeamMembers({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["listTeamMembers"] }) } });
  const deleteComplaints = useDeleteAllComplaints({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["listComplaints"] }) } });

  const [confirmTeam, setConfirmTeam]           = useState(false);
  const [confirmComplaints, setConfirmComplaints] = useState(false);

  // Theme
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(
    () => (localStorage.getItem("k4-theme") as ThemeKey) ?? "red"
  );
  const handleTheme = (t: ThemeKey) => { applyTheme(t); setActiveTheme(t); };

  // Section visibility (localStorage)
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

  const handleSaveMp = async () => {
    await updateMp.mutateAsync({ data: { name: mpForm.name, message: mpForm.message, photoUrl: mpForm.photoUrl || undefined } });
    setMpSaved(true);
    setTimeout(() => setMpSaved(false), 2000);
  };

  const logout = () => {
    sessionStorage.removeItem("admin_unlocked");
    setUnlocked(false);
  };

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            {language === "NP" ? "एडमिन सुपर प्यानल" : "Admin Control Panel"}
          </h1>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={15} />
          {language === "NP" ? "बाहिर निस्कनुस्" : "Logout"}
        </button>
      </div>

      {/* ── MP PROFILE ──────────────────────────────────────── */}
      <Section icon={User} title={language === "NP" ? "सांसद प्रोफाइल" : "MP Profile"}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {language === "NP" ? "नाम" : "Name"}
            </label>
            <input
              value={mpForm.name}
              onChange={(e) => setMpForm({ ...mpForm, name: e.target.value })}
              className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {language === "NP" ? "सन्देश" : "Message"}
            </label>
            <textarea
              value={mpForm.message}
              onChange={(e) => setMpForm({ ...mpForm, message: e.target.value })}
              rows={2}
              className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {language === "NP" ? "फोटो URL (वैकल्पिक)" : "Photo URL (Optional)"}
            </label>
            <input
              value={mpForm.photoUrl}
              onChange={(e) => setMpForm({ ...mpForm, photoUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleSaveMp}
            disabled={updateMp.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {mpSaved ? <Check size={15} /> : <Save size={15} />}
            {mpSaved ? (language === "NP" ? "सेभ भयो!" : "Saved!") : (language === "NP" ? "सेभ गर्नुहोस्" : "Save Profile")}
          </button>
        </div>
      </Section>

      {/* ── THEME ───────────────────────────────────────────── */}
      <Section icon={Palette} title={language === "NP" ? "थिम" : "Theme"}>
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTheme(t.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                activeTheme === t.key ? "border-foreground shadow-md scale-105" : "border-transparent hover:border-border"
              )}
            >
              <span className={cn("w-4 h-4 rounded-full", t.color)} />
              {language === "NP" ? t.labelNp : t.label}
              {activeTheme === t.key && <Check size={13} />}
            </button>
          ))}
        </div>
      </Section>

      {/* ── SECTION VISIBILITY ─────────────────────────────── */}
      <Section icon={Eye} title={language === "NP" ? "खण्ड दृश्यता" : "Section Visibility"}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => toggleSection(s)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all capitalize",
                visible[s]
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted border-border text-muted-foreground"
              )}
            >
              {visible[s] ? <Eye size={14} /> : <EyeOff size={14} />}
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {language === "NP"
            ? "यो सेटिङ यस उपकरणमा मात्र लागू हुन्छ।"
            : "Visibility settings apply to this device only."}
        </p>
      </Section>

      {/* ── TEAM CONTROL ───────────────────────────────────── */}
      <Section icon={Users} title={language === "NP" ? "टोली नियन्त्रण" : "Team Control"}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {language === "NP" ? `${teamMembers?.length ?? 0} सदस्यहरू` : `${teamMembers?.length ?? 0} members registered`}
          </p>
          {!confirmTeam ? (
            <button
              onClick={() => setConfirmTeam(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              {language === "NP" ? "सबै मेटाउनुहोस्" : "Delete All"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">
                {language === "NP" ? "निश्चित हुनुहुन्छ?" : "Are you sure?"}
              </span>
              <button
                onClick={() => { deleteTeam.mutate({}); setConfirmTeam(false); }}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {language === "NP" ? "हो, मेटाउनुस्" : "Yes, Delete"}
              </button>
              <button
                onClick={() => setConfirmTeam(false)}
                className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-muted"
              >
                {language === "NP" ? "रद्द" : "Cancel"}
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* ── COMPLAINT CONTROL ──────────────────────────────── */}
      <Section icon={FileText} title={language === "NP" ? "उजुरी नियन्त्रण" : "Complaint Control"}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {language === "NP" ? `${stats?.total ?? 0} उजुरीहरू` : `${stats?.total ?? 0} complaints on record`}
          </p>
          {!confirmComplaints ? (
            <button
              onClick={() => setConfirmComplaints(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              {language === "NP" ? "सबै मेटाउनुहोस्" : "Delete All"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">
                {language === "NP" ? "निश्चित हुनुहुन्छ?" : "Are you sure?"}
              </span>
              <button
                onClick={() => { deleteComplaints.mutate({}); setConfirmComplaints(false); }}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {language === "NP" ? "हो, मेटाउनुस्" : "Yes, Delete"}
              </button>
              <button
                onClick={() => setConfirmComplaints(false)}
                className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-muted"
              >
                {language === "NP" ? "रद्द" : "Cancel"}
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* ── ANALYTICS ──────────────────────────────────────── */}
      <Section icon={BarChart2} title={language === "NP" ? "विश्लेषण" : "Analytics"}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: language === "NP" ? "कुल उजुरी" : "Total Complaints", value: stats?.total ?? 0 },
            { label: language === "NP" ? "विचाराधीन" : "Pending",          value: stats?.pending ?? 0 },
            { label: language === "NP" ? "प्रगतिमा" : "In Progress",       value: stats?.inProgress ?? 0 },
            { label: language === "NP" ? "समाधान" : "Resolved",            value: stats?.resolved ?? 0 },
            { label: language === "NP" ? "विचारहरू" : "Ideas",             value: stats?.totalIdeas ?? 0 },
            { label: language === "NP" ? "समाचार" : "News",                value: stats?.totalNews ?? 0 },
            { label: language === "NP" ? "टोली सदस्य" : "Team Members",   value: teamMembers?.length ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Icon size={18} className="text-primary" />
        <h2 className="font-semibold text-foreground text-sm">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}
