import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCreateComplaint, getListComplaintsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const PALIKA_WARDS: Record<string, { label: string; labelNp: string; wards: number }> = {
  godawari:   { label: "Godawari Municipality",        labelNp: "गोदावरी नगरपालिका",       wards: 13 },
  gauriganga: { label: "Gauriganga Municipality",      labelNp: "गौरीगंगा नगरपालिका",     wards: 9  },
  chure:      { label: "Chure Rural Municipality",     labelNp: "चुरे गाउँपालिका",          wards: 7  },
  mohanyal:   { label: "Mohanyal Rural Municipality",  labelNp: "मोहन्याल गाउँपालिका",     wards: 9  },
};

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
    palika: "",
    ward: 0,
    category: "road",
    description: "",
  });

  const selectedPalika = form.palika ? PALIKA_WARDS[form.palika] : null;
  const wardOptions = selectedPalika
    ? Array.from({ length: selectedPalika.wards }, (_, i) => i + 1)
    : [];

  const handlePalikaChange = (value: string) => {
    setForm({ ...form, palika: value, ward: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.palika || !form.ward) return;
    await mutateAsync({
      data: {
        name: form.name,
        phone: form.phone || undefined,
        palika: form.palika,
        ward: form.ward,
        category: form.category,
        description: form.description,
      },
    });
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
        {/* Name + Phone */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("complaints.name")} *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("complaints.phone")}
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="98XXXXXXXX"
            />
          </div>
        </div>

        {/* Palika */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {language === "NP" ? "पालिका" : "Palika"} *
          </label>
          <select
            required
            value={form.palika}
            onChange={(e) => handlePalikaChange(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{language === "NP" ? "पालिका छान्नुहोस्" : "Select Palika"}</option>
            {Object.entries(PALIKA_WARDS).map(([key, p]) => (
              <option key={key} value={key}>
                {language === "NP" ? p.labelNp : p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ward — only shown after palika is selected */}
        {selectedPalika && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.2 }}
          >
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("complaints.ward")} *
            </label>
            <select
              required
              value={form.ward || ""}
              onChange={(e) => setForm({ ...form, ward: parseInt(e.target.value) })}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">
                {language === "NP" ? "वार्ड छान्नुहोस्" : "Select Ward"}
              </option>
              {wardOptions.map((w) => (
                <option key={w} value={w}>
                  {language === "NP" ? `वार्ड ${w}` : `Ward ${w}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {language === "NP"
                ? `${selectedPalika.labelNp} — ${selectedPalika.wards} वार्डहरू`
                : `${selectedPalika.label} — ${selectedPalika.wards} wards`}
            </p>
          </motion.div>
        )}

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("complaints.category")} *
          </label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CATEGORIES_EN.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[language]?.[cat] ?? cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("complaints.description")} *
          </label>
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
            disabled={isPending || !form.palika || !form.ward}
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
