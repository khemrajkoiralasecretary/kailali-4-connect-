import { useState } from "react";
import { useCitizenAuth } from "@/lib/citizenAuth";
import { useI18n } from "@/lib/i18n";
import { useCitizenSignup, useCitizenLogin } from "@workspace/api-client-react";
import { X, UserCircle, Mail, Lock, Phone, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

const PALIKAS = ["Godawari", "Gauriganga", "Chure", "Mohanyal"] as const;
const WARD_MAP: Record<string, number[]> = {
  Godawari: Array.from({ length: 12 }, (_, i) => i + 1),
  Gauriganga: Array.from({ length: 11 }, (_, i) => i + 1),
  Chure: Array.from({ length: 6 }, (_, i) => i + 1),
  Mohanyal: [5],
};

interface Props {
  onClose: () => void;
}

export default function CitizenAuthModal({ onClose }: Props) {
  const { language } = useI18n();
  const { setCitizenSession } = useCitizenAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "", phone: "", email: "", password: "", confirmPassword: "",
    ward: 1, palika: "Godawari" as string,
  });

  const signup = useCitizenSignup({
    mutation: {
      onSuccess: (data) => {
        setCitizenSession(data.token, data.citizen);
        onClose();
      },
      onError: (err: any) => setError(err?.data?.error ?? "Signup failed"),
    },
  });

  const login = useCitizenLogin({
    mutation: {
      onSuccess: (data) => {
        setCitizenSession(data.token, data.citizen);
        onClose();
      },
      onError: (err: any) => setError(err?.data?.error ?? "Login failed"),
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginForm.email || !loginForm.password) {
      setError("Please fill in all fields");
      return;
    }
    login.mutate({ data: loginForm });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { name, phone, email, password, confirmPassword, ward, palika } = signupForm;
    if (!name || !phone || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    signup.mutate({ data: { name, phone, email, password, ward, palika } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle size={22} />
            <div>
              <p className="font-semibold text-sm">
                {language === "NP" ? "नागरिक खाता" : "Citizen Account"}
              </p>
              <p className="text-xs opacity-75">
                {language === "NP" ? "आफ्नो उजुरी ट्र्याक गर्नुस्" : "Track your complaints"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["login", "signup"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              className={cn("flex-1 py-3 text-sm font-medium transition-colors",
                tab === t
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              )}>
              {t === "login"
                ? (language === "NP" ? "लगइन" : "Login")
                : (language === "NP" ? "दर्ता" : "Sign Up")
              }
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  {language === "NP" ? "इमेल" : "Email"}
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="email" value={loginForm.email}
                    onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="citizen@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                  {language === "NP" ? "पासवर्ड" : "Password"}
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="password" value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <button type="submit" disabled={login.isPending}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
                {login.isPending
                  ? (language === "NP" ? "लगइन हुँदैछ..." : "Logging in...")
                  : (language === "NP" ? "लगइन गर्नुस्" : "Login")}
              </button>
              <p className="text-xs text-center text-muted-foreground">
                {language === "NP" ? "खाता छैन? " : "No account? "}
                <button type="button" onClick={() => setTab("signup")} className="text-primary font-medium hover:underline">
                  {language === "NP" ? "दर्ता गर्नुस्" : "Sign up"}
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    {language === "NP" ? "पूरा नाम" : "Full Name"}
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" value={signupForm.name}
                      onChange={e => setSignupForm(f => ({ ...f, name: e.target.value }))}
                      placeholder={language === "NP" ? "आफ्नो नाम" : "Your name"}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    {language === "NP" ? "फोन" : "Phone"}
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="tel" value={signupForm.phone}
                      onChange={e => setSignupForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="98XXXXXXXX"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    {language === "NP" ? "पालिका" : "Palika"}
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select value={signupForm.palika}
                      onChange={e => setSignupForm(f => ({ ...f, palika: e.target.value, ward: WARD_MAP[e.target.value]?.[0] ?? 1 }))}
                      className="w-full pl-9 pr-2 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                      {PALIKAS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    {language === "NP" ? "वडा नं." : "Ward No."}
                  </label>
                  <select value={signupForm.ward}
                    onChange={e => setSignupForm(f => ({ ...f, ward: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {(WARD_MAP[signupForm.palika] ?? []).map(w => <option key={w} value={w}>Ward {w}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    {language === "NP" ? "इमेल" : "Email"}
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" value={signupForm.email}
                      onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="citizen@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    {language === "NP" ? "पासवर्ड" : "Password"}
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="password" value={signupForm.password}
                      onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    {language === "NP" ? "पुष्टि गर्नुस्" : "Confirm"}
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="password" value={signupForm.confirmPassword}
                      onChange={e => setSignupForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={signup.isPending}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-1">
                {signup.isPending
                  ? (language === "NP" ? "दर्ता हुँदैछ..." : "Creating account...")
                  : (language === "NP" ? "खाता बनाउनुस्" : "Create Account")}
              </button>
              <p className="text-xs text-center text-muted-foreground">
                {language === "NP" ? "खाता छ? " : "Already have an account? "}
                <button type="button" onClick={() => setTab("login")} className="text-primary font-medium hover:underline">
                  {language === "NP" ? "लगइन गर्नुस्" : "Login"}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
