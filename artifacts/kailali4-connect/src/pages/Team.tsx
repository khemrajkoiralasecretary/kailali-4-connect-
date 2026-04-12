import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  useListTeamMembers,
  useJoinTeam,
  useUpdateTeamRank,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, BadgeCheck, BarChart2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PALIKA_WARDS: Record<string, { label: string; labelNp: string; wards: number[] }> = {
  godawari:   { label: "Godawari Municipality",       labelNp: "गोदावरी नगरपालिका",   wards: Array.from({ length: 12 }, (_, i) => i + 1) },
  gauriganga: { label: "Gauriganga Municipality",     labelNp: "गौरीगंगा नगरपालिका", wards: Array.from({ length: 11 }, (_, i) => i + 1) },
  chure:      { label: "Chure Rural Municipality",    labelNp: "चुरे गाउँपालिका",      wards: Array.from({ length: 6  }, (_, i) => i + 1) },
  mohanyal:   { label: "Mohanyal Rural Municipality", labelNp: "मोहन्याल गाउँपालिका", wards: [5] },
};

const RANKS = ["volunteer", "coordinator", "leader"] as const;
type Rank = typeof RANKS[number];

const RANK_LABELS: Record<string, Record<Rank, string>> = {
  EN: { volunteer: "Volunteer", coordinator: "Coordinator", leader: "Leader" },
  NP: { volunteer: "स्वयंसेवक", coordinator: "संयोजक", leader: "नेता" },
};

const RANK_COLORS: Record<Rank, string> = {
  volunteer:   "bg-blue-100 text-blue-700 border-blue-200",
  coordinator: "bg-amber-100 text-amber-700 border-amber-200",
  leader:      "bg-red-100 text-red-700 border-red-200",
};

type Tab = "members" | "join" | "analytics";

export default function Team() {
  const { language } = useI18n();
  const qc = useQueryClient();

  const [tab, setTab]           = useState<Tab>("members");
  const [palikaFilter, setPalikaFilter] = useState("");
  const [rankFilter, setRankFilter]     = useState<Rank | "">("");
  const [joinSuccess, setJoinSuccess]   = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "", palika: "", ward: 0,
  });

  const { data: members = [], isLoading } = useListTeamMembers({
    palika: palikaFilter || undefined,
    rank: (rankFilter as Rank) || undefined,
  });

  const joinMutation = useJoinTeam({
    mutation: {
      onSuccess: (data) => {
        setJoinSuccess(data.cid);
        setForm({ name: "", phone: "", palika: "", ward: 0 });
        qc.invalidateQueries({ queryKey: ["listTeamMembers"] });
        setTab("members");
      },
    },
  });

  const rankMutation = useUpdateTeamRank({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["listTeamMembers"] });
      },
    },
  });

  // Analytics
  const palikaCount: Record<string, number> = {};
  const rankCount:   Record<string, number> = {};
  const wardCount:   Record<string, number> = {};
  (members as typeof members).forEach((m) => {
    palikaCount[m.palika] = (palikaCount[m.palika] ?? 0) + 1;
    rankCount[m.rank]     = (rankCount[m.rank]     ?? 0) + 1;
    wardCount[m.ward]     = (wardCount[m.ward]      ?? 0) + 1;
  });

  const selectedPalika = form.palika ? PALIKA_WARDS[form.palika] : null;
  const wardOptions    = selectedPalika?.wards ?? [];

  const handleJoin = () => {
    if (!form.name || !form.palika || !form.ward) return;
    joinMutation.mutate({ data: { name: form.name, phone: form.phone || undefined, palika: form.palika, ward: form.ward } });
  };

  const tabs: { key: Tab; label: string; labelNp: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: "members",   label: "Members",   labelNp: "सदस्यहरू",  icon: Users },
    { key: "join",      label: "Join Team", labelNp: "टोलीमा जोड्नुस्", icon: UserPlus },
    { key: "analytics", label: "Analytics", labelNp: "विश्लेषण", icon: BarChart2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users size={22} className="text-primary" />
          {language === "NP" ? "टोली व्यवस्थापन" : "Team Registry"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {language === "NP" ? "कैलाली-४ स्वयंसेवक तथा समन्वयकर्ताहरू" : "Kailali-4 volunteers, coordinators and leaders"}
        </p>
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {joinSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-2 text-green-700">
              <BadgeCheck size={18} />
              <span className="text-sm font-medium">
                {language === "NP"
                  ? `सफलतापूर्वक दर्ता भयो! आईडी: ${joinSuccess}`
                  : `Registered successfully! ID: ${joinSuccess}`}
              </span>
            </div>
            <button onClick={() => setJoinSuccess(null)} className="text-green-600 hover:text-green-800">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {tabs.map(({ key, label, labelNp, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={15} />
            {language === "NP" ? labelNp : label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── MEMBERS TAB ── */}
        {tab === "members" && (
          <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-card border border-border rounded-xl p-4 items-center">
              <select
                value={palikaFilter}
                onChange={(e) => setPalikaFilter(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{language === "NP" ? "सबै पालिका" : "All Municipalities"}</option>
                {Object.entries(PALIKA_WARDS).map(([key, p]) => (
                  <option key={key} value={key}>{language === "NP" ? p.labelNp : p.label}</option>
                ))}
              </select>
              <select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value as Rank | "")}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{language === "NP" ? "सबै पद" : "All Ranks"}</option>
                {RANKS.map((r) => (
                  <option key={r} value={r}>{RANK_LABELS[language][r]}</option>
                ))}
              </select>
              {(palikaFilter || rankFilter) && (
                <button
                  onClick={() => { setPalikaFilter(""); setRankFilter(""); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <X size={13} /> {language === "NP" ? "हटाउनुहोस्" : "Clear"}
                </button>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {members.length} {language === "NP" ? "सदस्यहरू" : "members"}
              </span>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 animate-pulse bg-card border border-border rounded-xl" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                <Users size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">{language === "NP" ? "कुनै सदस्य भेटिएन" : "No members found"}</p>
                <button
                  onClick={() => setTab("join")}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  {language === "NP" ? "पहिलो सदस्य बन्नुहोस्" : "Be the first to join"}
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-card border border-border rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {m.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", RANK_COLORS[m.rank as Rank])}>
                        {RANK_LABELS[language][m.rank as Rank]}
                      </span>
                    </div>

                    <div>
                      <p className="font-semibold text-sm text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{m.cid}</p>
                      {m.phone && <p className="text-xs text-muted-foreground">{m.phone}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === "NP"
                          ? `${PALIKA_WARDS[m.palika]?.labelNp ?? m.palika} — वार्ड ${m.ward}`
                          : `${PALIKA_WARDS[m.palika]?.label ?? m.palika} — Ward ${m.ward}`}
                      </p>
                    </div>

                    {/* Rank selector */}
                    <select
                      value={m.rank}
                      onChange={(e) => rankMutation.mutate({ id: m.id, data: { rank: e.target.value as Rank } })}
                      className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {RANKS.map((r) => (
                        <option key={r} value={r}>{RANK_LABELS[language][r]}</option>
                      ))}
                    </select>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── JOIN TAB ── */}
        {tab === "join" && (
          <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-lg bg-card border border-border rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold text-foreground">
                {language === "NP" ? "टोलीमा दर्ता गर्नुहोस्" : "Register as a Team Member"}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {language === "NP" ? "पूरा नाम *" : "Full Name *"}
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={language === "NP" ? "तपाईंको नाम" : "Your full name"}
                    className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {language === "NP" ? "फोन (वैकल्पिक)" : "Phone (Optional)"}
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {language === "NP" ? "पालिका *" : "Municipality *"}
                  </label>
                  <select
                    value={form.palika}
                    onChange={(e) => setForm({ ...form, palika: e.target.value, ward: 0 })}
                    className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{language === "NP" ? "छान्नुहोस्" : "Select"}</option>
                    {Object.entries(PALIKA_WARDS).map(([key, p]) => (
                      <option key={key} value={key}>{language === "NP" ? p.labelNp : p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {language === "NP" ? "वार्ड *" : "Ward *"}
                  </label>
                  <select
                    value={form.ward || ""}
                    onChange={(e) => setForm({ ...form, ward: parseInt(e.target.value) })}
                    disabled={!form.palika}
                    className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="">{language === "NP" ? "वार्ड" : "Ward"}</option>
                    {wardOptions.map((w) => (
                      <option key={w} value={w}>{language === "NP" ? `वार्ड ${w}` : `Ward ${w}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleJoin}
                disabled={!form.name || !form.palika || !form.ward || joinMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <UserPlus size={16} />
                {joinMutation.isPending
                  ? (language === "NP" ? "दर्ता हुँदैछ..." : "Registering...")
                  : (language === "NP" ? "टोलीमा जोड्नुस्" : "Join Team")}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === "analytics" && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-primary">{members.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{language === "NP" ? "कुल सदस्य" : "Total Members"}</p>
              </div>
              {RANKS.map((r) => (
                <div key={r} className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-foreground">{rankCount[r] ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">{RANK_LABELS[language][r]}</p>
                </div>
              ))}
            </div>

            {/* By Municipality */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {language === "NP" ? "पालिका अनुसार" : "By Municipality"}
              </h3>
              {Object.entries(PALIKA_WARDS).map(([key, p]) => {
                const count = palikaCount[key] ?? 0;
                const max   = Math.max(...Object.values(palikaCount), 1);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{language === "NP" ? p.labelNp : p.label}</span>
                      <span className="font-medium text-foreground">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / max) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* By Rank */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {language === "NP" ? "पद अनुसार" : "By Rank"}
              </h3>
              {RANKS.map((r) => {
                const count = rankCount[r] ?? 0;
                const total = members.length || 1;
                return (
                  <div key={r} className="flex items-center gap-3">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border w-28 text-center", RANK_COLORS[r])}>
                      {RANK_LABELS[language][r]}
                    </span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / total) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
