import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCreateComplaint, getListComplaintsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const CATEGORIES_EN = ["road", "water", "electricity", "health", "education", "other"];
const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  EN: { road: "Road", water: "Water", electricity: "Electricity", health: "Health", education: "Education", other: "Other" },
  NP: { road: "सडक", water: "पानी", electricity: "बिजुली", health: "स्वास्थ्य", education: "शिक्षा", other: "अन्य" },
};

export default function ComplaintNew() {
  const { t, language } = useI18n();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useCreateComplaint();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    ward: 1,
    category: "road",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateAsync({ data: { ...form, phone: form.phone || undefined } });
    queryClient.invalidateQueries({ queryKey: getListComplaintsQueryKey() });
    navigate("/complaints");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/complaints">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("complaints.new")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Submit your complaint to the MP's office</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-5"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("complaints.name")} *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("complaints.phone")}</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="98XXXXXXXX"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("complaints.ward")} *</label>
            <select
              required
              value={form.ward}
              onChange={(e) => setForm({ ...form, ward: parseInt(e.target.value) })}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
                <option key={w} value={w}>{t("dashboard.ward")} {w}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("complaints.category")} *</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES_EN.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[language]?.[cat] ?? cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("complaints.description")} *</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Describe your complaint in detail..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/complaints">
            <button type="button" className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">
              {t("common.cancel")}
            </button>
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Send size={15} />
            {isPending ? t("common.loading") : t("common.submit")}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
