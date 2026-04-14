import { useI18n } from "@/lib/i18n";
import { useListEvents } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

const EVENT_TYPE_LABELS: Record<string, { en: string; np: string; color: string }> = {
  festival:           { en: "Festival",           np: "महोत्सव",               color: "#b45309" },
  government_program: { en: "Government Program", np: "सरकारी कार्यक्रम",     color: "#1d4ed8" },
  development_update: { en: "Development Update", np: "विकास अद्यावधिक",      color: "#c2410c" },
  cultural_program:   { en: "Cultural Program",   np: "सांस्कृतिक कार्यक्रम", color: "#7c3aed" },
  public_notice:      { en: "Public Notice",      np: "सार्वजनिक सूचना",      color: "#b91c1c" },
};

export default function Events() {
  const { language } = useI18n();
  const { data: events = [], isLoading } = useListEvents();

  const sorted = [...events].reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays size={24} className="text-primary" />
          {language === "NP" ? "कार्यक्रमहरू" : "Events"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {language === "NP"
            ? "काइलाली-४ का आधिकारिक कार्यक्रम र सूचनाहरू"
            : "Official events and notices from Kailali Constituency 4"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-wrap justify-center gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-card rounded-xl shadow"
              style={{ width: "100%", maxWidth: 300, aspectRatio: "4/5" }}
            />
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-5">
          {sorted.map((event, idx) => {
            const type = EVENT_TYPE_LABELS[event.eventType] ?? EVENT_TYPE_LABELS.public_notice;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                style={{
                  width: "100%",
                  maxWidth: 300,
                  aspectRatio: "4/5",
                  background: "white",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Image — 65% of card height */}
                <div style={{ height: "65%", width: "100%", flexShrink: 0, overflow: "hidden", background: "#f3f4f6" }}>
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CalendarDays size={40} color="#d1d5db" />
                    </div>
                  )}
                </div>

                {/* Content — remaining 35% */}
                <div style={{ padding: 10, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 3 }}>
                  <b style={{ fontSize: 14, lineHeight: 1.3, display: "block" }}>{event.title}</b>
                  <small style={{ color: type.color, fontWeight: 600, fontSize: 11 }}>
                    {language === "NP" ? type.np : type.en}
                    {event.eventDate ? ` · ${event.eventDate}` : ""}
                  </small>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                    {event.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-14 text-center text-muted-foreground">
          <CalendarDays size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{language === "NP" ? "कुनै कार्यक्रम छैन" : "No events yet"}</p>
          <p className="text-sm mt-1">
            {language === "NP"
              ? "नयाँ कार्यक्रम र सूचनाहरू यहाँ देखिनेछन्"
              : "New events and notices will appear here"}
          </p>
        </div>
      )}
    </div>
  );
}
