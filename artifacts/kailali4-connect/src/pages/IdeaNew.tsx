import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCreateIdea, getListIdeasQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function IdeaNew() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useCreateIdea();

  const [form, setForm] = useState({
    title: "",
    description: "",
    submittedBy: "",
    ward: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateAsync({ data: form });
    queryClient.invalidateQueries({ queryKey: getListIdeasQueryKey() });
    navigate("/ideas");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/ideas">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("ideas.new")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Share your idea with the community</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("ideas.title")} *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Briefly describe your idea"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t("ideas.description")} *</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Explain the idea in detail — what problem it solves and how it can be implemented..."
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("ideas.submittedBy")} *</label>
            <input
              required
              value={form.submittedBy}
              onChange={(e) => setForm({ ...form, submittedBy: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("dashboard.ward")} *</label>
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
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/ideas">
            <button type="button" className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">
              {t("common.cancel")}
            </button>
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Send size={15} />
            {isPending ? t("common.loading") : t("common.submit")}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
