import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCreateComplaint, getListComplaintsQueryKey } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, ShieldAlert, AlertTriangle, CheckCircle2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PALIKA_WARDS: Record<string, { label: string; labelNp: string; wards: number[] }> = {
  godawari:   { label: "Godawari Municipality",       labelNp: "गोदावरी नगरपालिका",   wards: Array.from({ length: 12 }, (_, i) => i + 1) },
  gauriganga: { label: "Gauriganga Municipality",     labelNp: "गौरीगंगा नगरपालिका", wards: Array.from({ length: 11 }, (_, i) => i + 1) },
  chure:      { label: "Chure Rural Municipality",    labelNp: "चुरे गाउँपालिका",      wards: Array.from({ length: 6  }, (_, i) => i + 1) },
  mohanyal:   { label: "Mohanyal Rural Municipality", labelNp: "मोहन्याल गाउँपालिका", wards: [5] },
};

export default function CorruptionReport() {
  const { language } = useI18n();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useCreateComplaint();
  const [submittedTrackId, setSubmittedTrackId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    palika: "",
    ward: 0,
    description: "",
  });

  const selectedPalika = form.palika ? PALIKA_WARDS[form.palika] : null;
  const wardOptions = selectedPalika ? selectedPalika.wards : [];

  const handlePalikaChange = (value: string) => {
    setForm({ ...form, palika: value, ward: 0 });
  };

  const handleCopy = () => {
    if (submittedTrackId) {
      navigator.clipboard.writeText(submittedTrackId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.palika || !form.ward) return;
    const result = await mutateAsync({
      data: {
        name: form.name,
        phone: form.phone || undefined,
        palika: form.palika,
        ward: form.ward,
        category: "corruption",
        description: form.description,
      },
    });
    queryClient.invalidateQueries({ queryKey: getListComplaintsQueryKey() });
    setSubmittedTrackId((result as { trackId?: string }).trackId ?? null);
  };

  const t = (en: string, np: string) => language === "NP" ? np : en;

  if (submittedTrackId) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto"
        >
          <CheckCircle2 size={40} className="text-green-600" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground">
          {t("Report Submitted", "रिपोर्ट पेश भयो")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            "Your corruption report has been received and will be reviewed confidentially by the MP's office.",
            "तपाईंको भ्रष्टाचार रिपोर्ट प्राप्त भएको छ र सांसद कार्यालयद्वारा गोप्य रूपमा समीक्षा गरिनेछ।"
          )}
        </p>
        <div className="bg-muted border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t("Tracking ID", "ट्र्याकिङ ID")}
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-mono font-bold text-red-600">{submittedTrackId}</span>
            <button onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-border transition-colors text-muted-foreground">
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("Use this ID on the Dashboard to track your report status", "ड्यासबोर्डमा यो ID प्रयोग गरेर रिपोर्टको स्थिति हेर्नुहोस्")}
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("Back to Dashboard", "ड्यासबोर्डमा फर्कनुहोस्")}
          </button>
          <button
            onClick={() => navigate("/complaints")}
            className="px-5 py-2.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
          >
            {t("View Complaints", "उजुरीहरू हेर्नुहोस्")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={20} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("Report Corruption", "भ्रष्टाचार रिपोर्ट")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t(
                "Report corruption, bribery or misconduct to the MP's office",
                "सांसद कार्यालयमा भ्रष्टाचार, घूस वा दुर्व्यवहार रिपोर्ट गर्नुहोस्"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-red-800">
            {t("Important Notice", "महत्वपूर्ण सूचना")}
          </p>
          <p className="text-xs text-red-700 leading-relaxed">
            {t(
              "All reports are treated with strict confidentiality. Filing a false or malicious report is a punishable offence. Provide accurate, factual information.",
              "सबै रिपोर्टहरू कडा गोपनीयतासाथ हेरिन्छन्। झूटो वा दुर्भावनापूर्ण रिपोर्ट दिनु दण्डनीय अपराध हो। सही र तथ्यपरक जानकारी दिनुहोस्।"
            )}
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-5"
      >
        {/* Name + Phone */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("Your Name", "तपाईंको नाम")} *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("Full name", "पूरा नाम")}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("Phone (Optional)", "फोन (ऐच्छिक)")}
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="98XXXXXXXX"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>

        {/* Palika */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("Palika", "पालिका")} *
          </label>
          <select
            required
            value={form.palika}
            onChange={(e) => handlePalikaChange(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">{t("Select Palika", "पालिका छान्नुहोस्")}</option>
            {Object.entries(PALIKA_WARDS).map(([key, p]) => (
              <option key={key} value={key}>
                {language === "NP" ? p.labelNp : p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ward */}
        <AnimatePresence>
          {selectedPalika && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("Ward No.", "वार्ड नं.")} *
              </label>
              <select
                required
                value={form.ward || ""}
                onChange={(e) => setForm({ ...form, ward: parseInt(e.target.value) })}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="">{t("Select Ward", "वार्ड छान्नुहोस्")}</option>
                {wardOptions.map((w) => (
                  <option key={w} value={w}>
                    {language === "NP" ? `वार्ड ${w}` : `Ward ${w}`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {language === "NP"
                  ? `${selectedPalika.labelNp} — ${selectedPalika.wards.length === 1 ? `वार्ड ${selectedPalika.wards[0]} मात्र` : `${selectedPalika.wards.length} वार्डहरू`}`
                  : `${selectedPalika.label} — ${selectedPalika.wards.length === 1 ? `Ward ${selectedPalika.wards[0]} only` : `${selectedPalika.wards.length} wards`}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Locked category badge */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("Category", "वर्ग")}
          </label>
          <div className="flex items-center gap-2 px-3 py-2.5 border border-red-200 bg-red-50 rounded-lg">
            <ShieldAlert size={15} className="text-red-600" />
            <span className="text-sm font-medium text-red-700">
              {t("Corruption / Misconduct", "भ्रष्टाचार / दुर्व्यवहार")}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("Describe the Incident", "घटनाको विवरण")} *
          </label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            placeholder={t(
              "Describe: who was involved, what happened, when and where it occurred, any evidence or witnesses...",
              "विवरण दिनुहोस्: को संलग्न थियो, के भयो, कहिले र कहाँ भयो, कुनै प्रमाण वा साक्षी..."
            )}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/">
            <button type="button" className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">
              {t("Cancel", "रद्द गर्नुहोस्")}
            </button>
          </Link>
          <button
            type="submit"
            disabled={isPending || !form.palika || !form.ward}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            <Send size={15} />
            {isPending
              ? t("Submitting...", "पेश हुँदैछ...")
              : t("Submit Report", "रिपोर्ट पेश गर्नुहोस्")}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
