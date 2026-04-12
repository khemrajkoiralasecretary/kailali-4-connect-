import { useI18n } from "@/lib/i18n";
import { useListIdeas, useUpvoteIdea, getListIdeasQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Plus, ThumbsUp, MapPin } from "lucide-react";

export default function Ideas() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { data: ideas, isLoading } = useListIdeas();
  const { mutateAsync: upvote } = useUpvoteIdea();

  const handleUpvote = async (id: number) => {
    await upvote({ id });
    queryClient.invalidateQueries({ queryKey: getListIdeasQueryKey() });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("nav.ideas")}</h1>
          <p className="text-sm text-muted-foreground mt-1">Community ideas sorted by support</p>
        </div>
        <Link href="/ideas/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} />
            {t("ideas.new")}
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-card border border-border rounded-xl" />
          ))}
        </div>
      ) : ideas && ideas.length > 0 ? (
        <div className="space-y-3">
          {ideas.map((idea, idx) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-card border border-border rounded-xl p-5 flex gap-4 hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => handleUpvote(idea.id)}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group flex-shrink-0"
              >
                <ThumbsUp size={16} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">{idea.upvotes}</span>
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{idea.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{idea.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{idea.submittedBy}</span>
                  <span className="flex items-center gap-1"><MapPin size={11} />{t("dashboard.ward")} {idea.ward}</span>
                  <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">{t("common.empty")}</p>
          <p className="text-sm mt-1">Be the first to share an idea for your community</p>
        </div>
      )}
    </div>
  );
}
