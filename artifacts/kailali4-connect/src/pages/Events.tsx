import { useI18n } from "@/lib/i18n";
import { useListEvents } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { CalendarDays, PartyPopper, Landmark, Construction, Palette, Megaphone, Clock } from "lucide-react";

const EVENT_TYPES: Record<string, {
  label: string;
  labelNp: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  cls: string;
  badge: string;
}> = {
  festival:           { label: "Festival",           labelNp: "महोत्सव",          icon: PartyPopper,  cls: "bg-yellow-50 border-yellow-200 text-yellow-700", badge: "bg-yellow-100 text-yellow-800" },
  government_program: { label: "Government Program", labelNp: "सरकारी कार्यक्रम", icon: Landmark,     cls: "bg-blue-50 border-blue-200 text-blue-700",       badge: "bg-blue-100 text-blue-800" },
  development_update: { label: "Development Update", labelNp: "विकास अद्यावधिक",  icon: Construction, cls: "bg-orange-50 border-orange-200 text-orange-700", badge: "bg-orange-100 text-orange-800" },
  cultural_program:   { label: "Cultural Program",   labelNp: "सांस्कृतिक कार्यक्रम", icon: Palette,  cls: "bg-purple-50 border-purple-200 text-purple-700", badge: "bg-purple-100 text-purple-800" },
  public_notice:      { label: "Public Notice",      labelNp: "सार्वजनिक सूचना",  icon: Megaphone,   cls: "bg-red-50 border-red-200 text-red-700",           badge: "bg-red-100 text-red-800" },
};

export default function Events() {
  const { language } = useI18n();
  const { data: events = [], isLoading } = useListEvents();

  const sorted = [...events].reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-52 animate-pulse bg-card border border-border rounded-2xl" />
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {sorted.map((event, idx) => {
            const cfg = EVENT_TYPES[event.eventType] ?? EVENT_TYPES.public_notice;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={`rounded-2xl border-2 overflow-hidden bg-card ${cfg.cls}`}
              >
                {event.imageUrl && (
                  <div className="w-full h-44 overflow-hidden bg-muted">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                      <Icon size={12} />
                      {language === "NP" ? cfg.labelNp : cfg.label}
                    </span>
                    {event.eventDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={11} />
                        {event.eventDate}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-foreground text-base leading-snug">{event.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>

                  <p className="text-xs text-muted-foreground/70 flex items-center gap-1 pt-1 border-t border-current/10">
                    <CalendarDays size={10} />
                    {new Date(event.createdAt).toLocaleDateString(
                      language === "NP" ? "ne-NP" : "en-NP",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
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
