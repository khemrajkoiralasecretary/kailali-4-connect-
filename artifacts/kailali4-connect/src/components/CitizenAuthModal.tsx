import { useState } from "react";
import { useCitizenAuth } from "@/lib/citizenAuth";
import { useI18n } from "@/lib/i18n";
import { X, UserCircle, Lock, Phone, MapPin, User, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const PALIKAS = ["Godawari", "Gauriganga", "Chure", "Mohanyal"] as const;
const WARD_MAP: Record<string, number[]> = {
  Godawari:  Array.from({ length: 12 }, (_, i) => i + 1),
  Gauriganga: Array.from({ length: 11 }, (_, i) => i + 1),
  Chure:     Array.from({ length: 6 },  (_, i) => i + 1),
  Mohanyal:  [5],
};

const BASE = import.meta.env.BASE_URL;

interface Props { onClose: () => void; }

export default function CitizenAuthModal({ onClose }: Props) {
  const { language } = useI18n();
  const { setCitizenSession } = useCitizenAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const t = (en: string, np: string) => language === "NP" ? np : en;

  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "", phone: "", password: "", confirmPassword: "",
    ward: 1, palika: "Godawari" as string,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { phone, password } = loginForm;
    if (!phone || !password) { setError(t("Please fill in all fields", "सबै फिल्ड भर्नुहोस्")); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}api/citizens/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("Login failed", "लगइन भएन")); return; }
      setCitizenSession(data.token, data.citizen);
      onClose();
    } catch {
      setError(t("Could not connect to server", "सर्भरसँग जडान भएन"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { name, phone, password, confirmPassword, ward, palika } = signupForm;
    if (!name || !phone || !password) { setError(t("Please fill in all fields", "सबै फिल्ड भर्नुहोस्")); return; }
    if (password !== confirmPassword) { setError(t("Passwords do not match", "पासवर्ड मेल खाएन")); return; }
    if (password.length < 4) { setError(t("Password must be at least 4 characters", "पासवर्ड कम्तिमा ४ अक्षर हुनुपर्छ")); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}api/citizens/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password, ward, palika }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("Signup failed", "दर्ता भएन")); return; }
      setCitizenSession(data.token, data.citizen);
      onClose();
    } catch {
      setError(t("Could not connect to server", "सर्भरसँग जडान भएन"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-primary text-primary-foreground px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle size={22} />
            <div>
              <p className="font-semibold text-sm">{t("Citizen Account", "नागरिक खाता")}</p>
              <p className="text-xs opacity-75">{t("Track your complaints", "आफ्नो उजुरी ट्र्याक गर्नुस्")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["login", "signup"] as const).map(tab2 => (
            <button key={tab2} onClick={() => { setTab(tab2); setError(""); }}
              className={cn("flex-1 py-3 text-sm font-medium transition-colors",
                tab === tab2
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              )}>
              {tab2 === "login" ? t("Login", "लगइन") : t("Sign Up", "दर्ता")}
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ── LOGIN ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelCls}>{t("Phone No.", "फोन नं.")}</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="tel" value={loginForm.phone}
                    onChange={e => setLoginForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="98XXXXXXXX"
                    className={inputCls} autoComplete="tel" required />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t("Password", "पासवर्ड")}</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type={showPw ? "text" : "password"} value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoComplete="current-password" required />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
                {loading ? t("Logging in...", "लगइन हुँदैछ...") : t("Login", "लगइन गर्नुस्")}
              </button>
              <p className="text-xs text-center text-muted-foreground">
                {t("No account? ", "खाता छैन? ")}
                <button type="button" onClick={() => setTab("signup")} className="text-primary font-medium hover:underline">
                  {t("Sign up", "दर्ता गर्नुस्")}
                </button>
              </p>
            </form>
          )}

          {/* ── SIGN UP ── */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-3">
              {/* Name */}
              <div>
                <label className={labelCls}>{t("Full Name", "पूरा नाम")}</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={signupForm.name}
                    onChange={e => setSignupForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={t("Your full name", "आफ्नो नाम")}
                    className={inputCls} autoComplete="name" required />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls}>{t("Phone No.", "फोन नं.")}</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="tel" value={signupForm.phone}
                    onChange={e => setSignupForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="98XXXXXXXX"
                    className={inputCls} autoComplete="tel" required />
                </div>
              </div>

              {/* Palika + Ward */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t("Palika", "पालिका")}</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select value={signupForm.palika}
                      onChange={e => setSignupForm(f => ({
                        ...f, palika: e.target.value,
                        ward: WARD_MAP[e.target.value]?.[0] ?? 1,
                      }))}
                      className="w-full pl-9 pr-2 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                      {PALIKAS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t("Ward No.", "वडा नं.")}</label>
                  <select value={signupForm.ward}
                    onChange={e => setSignupForm(f => ({ ...f, ward: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {(WARD_MAP[signupForm.palika] ?? []).map(w => (
                      <option key={w} value={w}>{t("Ward", "वडा")} {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t("Password", "पासवर्ड")}</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type={showPw ? "text" : "password"} value={signupForm.password}
                      onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className={inputCls} autoComplete="new-password" required />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t("Confirm", "पुष्टि")}</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type={showPw ? "text" : "password"} value={signupForm.confirmPassword}
                      onChange={e => setSignupForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      className={inputCls} autoComplete="new-password" required />
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setShowPw(p => !p)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPw ? t("Hide password", "पासवर्ड लुकाउनुस्") : t("Show password", "पासवर्ड देखाउनुस्")}
              </button>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
                {loading ? t("Creating account...", "खाता बनाउँदैछ...") : t("Create Account", "खाता बनाउनुस्")}
              </button>
              <p className="text-xs text-center text-muted-foreground">
                {t("Already have an account? ", "खाता छ? ")}
                <button type="button" onClick={() => setTab("login")} className="text-primary font-medium hover:underline">
                  {t("Login", "लगइन गर्नुस्")}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
