import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCreateNews, getListNewsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["infrastructure", "health", "education", "development", "announcement"];

export default function NewsNew() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useCreateNews();

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "announcement",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateAsync({ data: form });
    queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() });
    navigate("/news");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/news">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("news.new")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Publish a news update from the MP's office</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("news.title")} *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Headline of the news update"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("news.category")} *</label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="capitalize">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("news.content")} *</label>
          <textarea
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={6}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Write the full news update here..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/news">
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
