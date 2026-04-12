import { useI18n } from "@/lib/i18n";
import { useListNews } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Plus, Newspaper, Calendar } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  infrastructure: "bg-orange-100 text-orange-700",
  health: "bg-green-100 text-green-700",
  education: "bg-blue-100 text-blue-700",
  development: "bg-purple-100 text-purple-700",
  announcement: "bg-yellow-100 text-yellow-700",
};

export default function News() {
  const { t } = useI18n();
  const { data: news, isLoading } = useListNews();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("nav.news")}</h1>
          <p className="text-sm text-muted-foreground mt-1">Official updates from the MP's office</p>
        </div>
        <Link href="/news/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} />
            {t("news.new")}
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse bg-card border border-border rounded-xl" />
          ))}
        </div>
      ) : news && news.length > 0 ? (
        <div className="space-y-4">
          {[...news].reverse().map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
                  <Newspaper size={22} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[item.category] ?? "bg-muted text-muted-foreground"}`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(item.publishedAt).toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground leading-snug">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">{item.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">{t("common.empty")}</p>
          <p className="text-sm mt-1">No news updates yet</p>
        </div>
      )}
    </div>
  );
}
