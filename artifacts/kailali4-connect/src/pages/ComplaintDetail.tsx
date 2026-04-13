import { useI18n } from "@/lib/i18n";
import { useGetComplaint, useUpdateComplaintStatus, getGetComplaintQueryKey, getListComplaintsQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Phone, MapPin, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  pending: Clock,
  in_progress: AlertCircle,
  resolved: CheckCircle2,
};

const STATUS_OPTIONS = ["pending", "in_progress", "resolved"] as const;

const STATUS_LABELS: Record<string, Record<string, string>> = {
  EN: { pending: "Pending", in_progress: "In Progress", resolved: "Resolved" },
  NP: { pending: "विचाराधीन", in_progress: "प्रगतिमा", resolved: "समाधान" },
};

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  EN: {
    pm_council:    "Prime Minister & Council of Ministers",
    finance:       "Ministry of Finance",
    infrastructure:"Ministry of Physical Infrastructure & Transport",
    health:        "Ministry of Health and Population",
    education:     "Ministry of Education, Science & Technology",
    agriculture:   "Ministry of Agriculture & Livestock Development",
    foreign_affairs:"Ministry of Foreign Affairs",
    law_justice:   "Ministry of Law, Justice & Parliamentary Affairs",
    home_affairs:  "Ministry of Home Affairs",
    defence:       "Ministry of Defence",
    forests:       "Ministry of Forests & Environment",
    energy:        "Ministry of Energy, Water Resources & Irrigation",
    industry:      "Ministry of Industry, Commerce & Supplies",
    urban:         "Ministry of Urban Development",
    women_children:"Ministry of Women, Children & Senior Citizens",
    culture_tourism:"Ministry of Culture, Tourism & Civil Aviation",
    communication: "Ministry of Communication & Information Technology",
  },
  NP: {
    pm_council:    "प्रधानमन्त्री तथा मन्त्रिपरिषद",
    finance:       "अर्थ मन्त्रालय",
    infrastructure:"भौतिक पूर्वाधार तथा यातायात मन्त्रालय",
    health:        "स्वास्थ्य तथा जनसंख्या मन्त्रालय",
    education:     "शिक्षा, विज्ञान तथा प्रविधि मन्त्रालय",
    agriculture:   "कृषि तथा पशुपन्छी विकास मन्त्रालय",
    foreign_affairs:"परराष्ट्र मन्त्रालय",
    law_justice:   "कानून, न्याय तथा संसदीय मामिला मन्त्रालय",
    home_affairs:  "गृह मन्त्रालय",
    defence:       "रक्षा मन्त्रालय",
    forests:       "वन तथा वातावरण मन्त्रालय",
    energy:        "ऊर्जा, जलस्रोत तथा सिँचाइ मन्त्रालय",
    industry:      "उद्योग, वाणिज्य तथा आपूर्ति मन्त्रालय",
    urban:         "शहरी विकास मन्त्रालय",
    women_children:"महिला, बालबालिका तथा ज्येष्ठ नागरिक मन्त्रालय",
    culture_tourism:"संस्कृति, पर्यटन तथा नागरिक उड्डयन मन्त्रालय",
    communication: "सञ्चार तथा सूचना प्रविधि मन्त्रालय",
  },
};

export default function ComplaintDetail() {
  const { t, language } = useI18n();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const queryClient = useQueryClient();

  const { data: complaint, isLoading } = useGetComplaint(id, {
    query: { enabled: !!id, queryKey: getGetComplaintQueryKey(id) },
  });
  const { mutateAsync: updateStatus, isPending: updating } = useUpdateComplaintStatus();

  const handleStatusChange = async (newStatus: "pending" | "in_progress" | "resolved") => {
    await updateStatus({ id, data: { status: newStatus } });
    queryClient.invalidateQueries({ queryKey: getGetComplaintQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: getListComplaintsQueryKey() });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-32 animate-pulse bg-muted rounded" />
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-6 animate-pulse bg-muted rounded" />)}
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Complaint not found.</p>
        <Link href="/complaints"><button className="mt-4 text-primary text-sm underline">{t("common.back")}</button></Link>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[complaint.status] ?? Clock;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/complaints">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-foreground">Complaint #{complaint.id}</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6 space-y-5"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{complaint.name}</h2>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              {complaint.phone && (
                <span className="flex items-center gap-1.5"><Phone size={13} />{complaint.phone}</span>
              )}
              {complaint.palika && (
                <span className="flex items-center gap-1.5 capitalize">
                  <MapPin size={13} />{complaint.palika.charAt(0).toUpperCase() + complaint.palika.slice(1)}, {t("dashboard.ward")} {complaint.ward}
                </span>
              )}
              {!complaint.palika && (
                <span className="flex items-center gap-1.5"><MapPin size={13} />{t("dashboard.ward")} {complaint.ward}</span>
              )}
              <span className="flex items-center gap-1.5 capitalize">
                <Tag size={13} />{CATEGORY_LABELS[language]?.[complaint.category] ?? complaint.category}
              </span>
            </div>
          </div>
          <span className={cn("flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border capitalize", STATUS_COLORS[complaint.status])}>
            <StatusIcon size={14} />
            {STATUS_LABELS[language]?.[complaint.status] ?? complaint.status}
          </span>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm leading-relaxed text-foreground">{complaint.description}</p>
        </div>

        <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
          <span>Submitted: {new Date(complaint.createdAt).toLocaleString()}</span>
          <span>Updated: {new Date(complaint.updatedAt).toLocaleString()}</span>
        </div>
      </motion.div>

      {/* Status Update */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={updating || complaint.status === status}
              className={cn(
                "px-4 py-2 text-sm rounded-lg border font-medium transition-all capitalize",
                complaint.status === status
                  ? STATUS_COLORS[status]
                  : "border-border hover:bg-muted disabled:opacity-50"
              )}
            >
              {STATUS_LABELS[language]?.[status] ?? status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
