import { useState } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useCitizenAuth } from "@/lib/citizenAuth";
import { useCreateTeamApplication } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, MapPin, Briefcase, MessageSquare, Phone, User } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const PALIKAS = ["Godawari", "Gauriganga", "Chure", "Mohanyal"] as const;
const WARD_MAP: Record<string, number[]> = {
  Godawari: Array.from({ length: 12 }, (_, i) => i + 1),
  Gauriganga: Array.from({ length: 11 }, (_, i) => i + 1),
  Chure: Array.from({ length: 6 }, (_, i) => i + 1),
  Mohanyal: [5],
};

const SKILLS_LIST = [
  "Community Outreach", "Data Entry", "Event Management", "Social Media",
  "Field Work", "Counseling", "Teaching", "Healthcare", "Agriculture",
  "Technology", "Legal Aid", "Transportation", "Fundraising"
] as const;

export default function TeamApply() {
  const { language } = useI18n();
  const { citizen } = useCitizenAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    name:    citizen?.name ?? "",
    phone:   citizen?.phone ?? "",
    palika:  citizen?.palika ?? "Godawari",
    ward:    citizen?.ward ?? 1,
    skills:  "",
    message: "",
  });

  const submit = useCreateTeamApplication({
    mutation: {
      onSuccess: () => {
        toast({
          title: language === "NP" ? "आवेदन सफलतापूर्वक पेश भयो!" : "Application submitted successfully!",
          description: language === "NP"
            ? "प्रशासकले समीक्षा गरेपछि तपाईंलाई सूचित गरिनेछ।"
            : "You will be notified once the admin reviews your application.",
        });
        navigate("/citizen");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to submit application. Please try again.", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.skills) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    submit.mutate({ data: form });
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Back link */}
      <Link href="/citizen" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft size={14} />
        {language === "NP" ? "फिर्ता" : "Back"}
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            {language === "NP" ? "स्वयंसेवक टोलीमा सामेल हुनुस्" : "Join Volunteer Team"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {language === "NP"
            ? "कैलाली-४ को विकासमा हातेमालो गर्न आवेदन दिनुस्।"
            : "Apply to contribute to the development of Kailali Constituency 4."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
            {language === "NP" ? "पूरा नाम *" : "Full Name *"}
          </label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={language === "NP" ? "आफ्नो नाम" : "Your full name"}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
            {language === "NP" ? "फोन नं. *" : "Phone No. *"}
          </label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="tel" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="98XXXXXXXX"
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {/* Palika + Ward */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
              {language === "NP" ? "पालिका" : "Palika"}
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select value={form.palika}
                onChange={e => setForm(f => ({ ...f, palika: e.target.value, ward: WARD_MAP[e.target.value]?.[0] ?? 1 }))}
                className="w-full pl-9 pr-2 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                {PALIKAS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
              {language === "NP" ? "वडा नं." : "Ward No."}
            </label>
            <select value={form.ward}
              onChange={e => setForm(f => ({ ...f, ward: Number(e.target.value) }))}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
              {(WARD_MAP[form.palika] ?? []).map(w => <option key={w} value={w}>Ward {w}</option>)}
            </select>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
            <span className="flex items-center gap-1.5"><Briefcase size={12} /> {language === "NP" ? "सीप *" : "Skills *"}</span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {SKILLS_LIST.map(skill => (
              <button type="button" key={skill}
                onClick={() => {
                  const current = form.skills.split(",").map(s => s.trim()).filter(Boolean);
                  const exists = current.includes(skill);
                  const updated = exists ? current.filter(s => s !== skill) : [...current, skill];
                  setForm(f => ({ ...f, skills: updated.join(", ") }));
                }}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs border transition-colors",
                  form.skills.includes(skill)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-foreground border-border hover:border-primary"
                )}>
                {skill}
              </button>
            ))}
          </div>
          <input type="text" value={form.skills}
            onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
            placeholder={language === "NP" ? "सीपहरू (उदा: Community Outreach, Teaching)" : "Skills (e.g. Community Outreach, Teaching)"}
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        {/* Message */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
            <span className="flex items-center gap-1.5"><MessageSquare size={12} /> {language === "NP" ? "सन्देश (वैकल्पिक)" : "Message (Optional)"}</span>
          </label>
          <textarea value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            rows={3}
            placeholder={language === "NP"
              ? "किन सामेल हुन चाहनुहुन्छ?"
              : "Why do you want to join the team?"}
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>

        {/* Submit */}
        <button type="submit" disabled={submit.isPending}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
          {submit.isPending
            ? (language === "NP" ? "पेश हुँदैछ..." : "Submitting...")
            : (language === "NP" ? "आवेदन पेश गर्नुस्" : "Submit Application")}
        </button>
      </form>
    </div>
  );
}
