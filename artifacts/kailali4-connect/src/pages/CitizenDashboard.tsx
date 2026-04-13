import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCitizenAuth } from "@/lib/citizenAuth";
import { useGetCitizenComplaints, useListTeamApplications } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import {
  UserCircle, FileText, Users, Clock, CheckCircle2,
  AlertCircle, LogOut, MapPin, Loader2, Plus
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; npLabel: string; cls: string; icon: typeof Clock }> = {
  pending:     { label: "Pending",     npLabel: "विचाराधीन", cls: "bg-yellow-100 text-yellow-800", icon: Clock },
  in_progress: { label: "Processing", npLabel: "प्रक्रियामा", cls: "bg-blue-100 text-blue-800",  icon: Loader2 },
  resolved:    { label: "Solved",     npLabel: "समाधान",     cls: "bg-green-100 text-green-800", icon: CheckCircle2 },
};

export default function CitizenDashboard() {
  const { language } = useI18n();
  const { citizen, clearCitizenSession } = useCitizenAuth();

  const { data: complaints = [], isLoading: cLoading } = useGetCitizenComplaints();
  const { data: applications = [], isLoading: aLoading } = useListTeamApplications({});

  const myApps = applications.filter(a => a.citizenId === citizen?.id);

  const stats = {
    total:      complaints.length,
    pending:    complaints.filter(c => c.status === "pending").length,
    inProgress: complaints.filter(c => c.status === "in_progress").length,
    resolved:   complaints.filter(c => c.status === "resolved").length,
  };

  if (!citizen) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <UserCircle size={40} className="text-muted-foreground" />
        <p className="text-muted-foreground">
          {language === "NP" ? "पहिले लगइन गर्नुस्" : "Please log in to view your dashboard"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === "NP" ? "नागरिक ड्यासबोर्ड" : "Citizen Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {language === "NP" ? `नमस्ते, ${citizen.name}` : `Welcome, ${citizen.name}`}
          </p>
        </div>
        <button onClick={clearCitizenSession}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-600 transition-colors">
          <LogOut size={14} />
          {language === "NP" ? "लगआउट" : "Logout"}
        </button>
      </div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="bg-primary text-primary-foreground rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <UserCircle size={24} />
        </div>
        <div>
          <p className="font-semibold">{citizen.name}</p>
          <p className="text-xs opacity-80">{citizen.phone}</p>
          <div className="flex items-center gap-1 text-xs opacity-70 mt-0.5">
            <MapPin size={10} />
            {citizen.palika} — Ward {citizen.ward}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: language === "NP" ? "कुल" : "Total", value: stats.total, cls: "text-foreground" },
          { label: language === "NP" ? "विचाराधीन" : "Pending", value: stats.pending, cls: "text-yellow-600" },
          { label: language === "NP" ? "प्रक्रियामा" : "Processing", value: stats.inProgress, cls: "text-blue-600" },
          { label: language === "NP" ? "समाधान" : "Solved", value: stats.resolved, cls: "text-green-600" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className={cn("text-xl font-bold", cls)}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* My Complaints */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <h2 className="font-semibold text-foreground text-sm">
              {language === "NP" ? "मेरा उजुरीहरू" : "My Complaints"}
            </h2>
          </div>
          <Link href="/complaints/new"
            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <Plus size={12} />
            {language === "NP" ? "नयाँ उजुरी" : "New Complaint"}
          </Link>
        </div>
        {cLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
            <AlertCircle size={24} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {language === "NP" ? "कुनै उजुरी छैन" : "No complaints submitted yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {complaints.map(c => {
              const cfg = statusConfig[c.status];
              const Icon = cfg.icon;
              return (
                <Link key={c.id} href={`/complaints/${c.id}`}
                  className="flex items-start gap-3 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className={cn("mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0", cfg.cls)}>
                    <Icon size={10} />
                    {language === "NP" ? cfg.npLabel : cfg.label}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.palika} · Ward {c.ward} · {c.category} ·{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-auto flex-shrink-0">#{c.id}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* My Team Applications */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <h2 className="font-semibold text-foreground text-sm">
              {language === "NP" ? "मेरा टोली आवेदनहरू" : "My Team Applications"}
            </h2>
          </div>
          <Link href="/team/apply"
            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <Plus size={12} />
            {language === "NP" ? "आवेदन दिनुस्" : "Apply"}
          </Link>
        </div>
        {aLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : myApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <Users size={22} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {language === "NP" ? "कुनै आवेदन छैन" : "No applications yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {myApps.map(a => {
              const appStatusCls = {
                pending:  "bg-yellow-100 text-yellow-800",
                approved: "bg-green-100 text-green-800",
                rejected: "bg-red-100 text-red-800",
              }[a.status];
              return (
                <div key={a.id} className="flex items-center gap-3 px-5 py-4">
                  <div className={cn("px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0", appStatusCls)}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.palika} · Ward {a.ward} · {a.skills}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
