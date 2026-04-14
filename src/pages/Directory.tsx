import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, ChevronRight, ArrowLeft, X,
  School, HeartPulse, Droplets, Truck,
  Zap, Trees, Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PALIKAS = [
  {
    key: "godawari",
    label: "Godawari Municipality",
    labelNp: "गोदावरी नगरपालिका",
    type: "Municipality",
    typeNp: "नगरपालिका",
    wards: Array.from({ length: 12 }, (_, i) => i + 1),
    color: "from-red-50 to-red-100 border-red-200",
    dot: "bg-red-500",
  },
  {
    key: "gauriganga",
    label: "Gauriganga Municipality",
    labelNp: "गौरीगंगा नगरपालिका",
    type: "Municipality",
    typeNp: "नगरपालिका",
    wards: Array.from({ length: 11 }, (_, i) => i + 1),
    color: "from-amber-50 to-amber-100 border-amber-200",
    dot: "bg-amber-500",
  },
  {
    key: "chure",
    label: "Chure Rural Municipality",
    labelNp: "चुरे गाउँपालिका",
    type: "Rural Municipality",
    typeNp: "गाउँपालिका",
    wards: Array.from({ length: 6 }, (_, i) => i + 1),
    color: "from-green-50 to-green-100 border-green-200",
    dot: "bg-green-600",
  },
  {
    key: "mohanyal",
    label: "Mohanyal Rural Municipality",
    labelNp: "मोहन्याल गाउँपालिका",
    type: "Rural Municipality",
    typeNp: "गाउँपालिका",
    wards: [5],
    color: "from-blue-50 to-blue-100 border-blue-200",
    dot: "bg-blue-500",
  },
] as const;

type PalikaKey = typeof PALIKAS[number]["key"];

const DETAIL_SECTIONS = [
  { icon: School,    keyEn: "Schools",           keyNp: "विद्यालयहरू" },
  { icon: HeartPulse,keyEn: "Health Posts",       keyNp: "स्वास्थ्य चौकीहरू" },
  { icon: Droplets,  keyEn: "Water Projects",     keyNp: "खानेपानी आयोजनाहरू" },
  { icon: Truck,     keyEn: "Roads Status",        keyNp: "सडक अवस्था" },
  { icon: Zap,       keyEn: "Electricity Issues",  keyNp: "बिजुली समस्याहरू" },
  { icon: Trees,     keyEn: "Public Places",       keyNp: "सार्वजनिक स्थलहरू" },
  { icon: Landmark,  keyEn: "Tourism / Temples",   keyNp: "पर्यटन / मन्दिरहरू" },
];

export default function Directory() {
  const { language } = useI18n();
  const [selectedPalika, setSelectedPalika] = useState<PalikaKey | null>(null);
  const [selectedWard, setSelectedWard]     = useState<number | null>(null);

  const palika = PALIKAS.find((p) => p.key === selectedPalika) ?? null;

  const back = () => {
    if (selectedWard !== null) { setSelectedWard(null); return; }
    setSelectedPalika(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {selectedPalika && (
          <button
            onClick={back}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin size={22} className="text-primary" />
            {language === "NP" ? "पालिका तथा वार्ड निर्देशिका" : "Palika & Ward Directory"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {!selectedPalika
              ? (language === "NP" ? "पालिका छान्नुहोस्" : "Select a municipality to explore its wards")
              : !palika ? ""
              : selectedWard !== null
                ? (language === "NP"
                    ? `${palika.labelNp} — वार्ड ${selectedWard}`
                    : `${palika.label} — Ward ${selectedWard}`)
                : (language === "NP"
                    ? `${palika.labelNp} — ${palika.wards.length} ${palika.wards.length === 1 ? "वार्ड" : "वार्डहरू"}`
                    : `${palika.label} — ${palika.wards.length} ward${palika.wards.length !== 1 ? "s" : ""}`)}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── PALIKA GRID ── */}
        {!selectedPalika && (
          <motion.div
            key="palikas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {PALIKAS.map((p) => (
              <motion.button
                key={p.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPalika(p.key)}
                className={cn(
                  "text-left bg-gradient-to-br border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group",
                  p.color
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("w-2.5 h-2.5 rounded-full", p.dot)} />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {language === "NP" ? p.typeNp : p.type}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-foreground leading-snug">
                      {language === "NP" ? p.labelNp : p.label}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {p.wards.length === 1
                        ? (language === "NP" ? `वार्ड ${p.wards[0]} मात्र` : `Ward ${p.wards[0]} only`)
                        : (language === "NP" ? `${p.wards.length} वार्डहरू` : `${p.wards.length} wards`)}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground group-hover:text-foreground transition-colors mt-1" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* ── WARD GRID ── */}
        {selectedPalika && palika && selectedWard === null && (
          <motion.div
            key="wards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {palika.wards.map((w) => (
                <motion.button
                  key={w}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedWard(w)}
                  className="aspect-square flex flex-col items-center justify-center bg-card border border-border rounded-xl shadow-sm hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <span className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">{w}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {language === "NP" ? "वार्ड" : "Ward"}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── WARD DETAIL ── */}
        {selectedPalika && palika && selectedWard !== null && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {DETAIL_SECTIONS.map(({ icon: Icon, keyEn, keyNp }, idx) => (
              <motion.div
                key={keyEn}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {language === "NP" ? keyNp : keyEn}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {language === "NP" ? "डाटा उपलब्ध छैन" : "Data coming soon"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                  {language === "NP" ? "छिट्टै" : "Soon"}
                </span>
              </motion.div>
            ))}

            <p className="text-center text-xs text-muted-foreground pt-2">
              {language === "NP"
                ? "वार्डको विस्तृत जानकारी चाँडै थपिनेछ।"
                : "Detailed ward information will be populated soon by the MP office."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
