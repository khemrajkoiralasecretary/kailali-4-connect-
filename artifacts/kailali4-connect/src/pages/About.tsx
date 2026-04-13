import { useI18n } from "@/lib/i18n";
import { useGetMpProfile, useGetSocialLinks, useGetDashboardStats, useListTeamMembers } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import {
  User, Facebook, Youtube, Globe, MapPin, Phone, Mail,
  FileText, Users, CheckCircle2, Building2, Info, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function About() {
  const { language } = useI18n();
  const { data: mpProfile }    = useGetMpProfile();
  const { data: socialLinks }  = useGetSocialLinks();
  const { data: stats }        = useGetDashboardStats();
  const { data: teamMembers }  = useListTeamMembers({});

  const hasSocial = socialLinks?.facebook || socialLinks?.youtube || socialLinks?.website;

  const infoCards = [
    {
      icon: Building2,
      title: language === "NP" ? "निर्वाचन क्षेत्र" : "Constituency",
      value: language === "NP" ? "कैलाली निर्वाचन क्षेत्र नम्बर ४" : "Kailali Constituency No. 4",
      colorCls: "bg-blue-50 text-blue-600",
    },
    {
      icon: MapPin,
      title: language === "NP" ? "पालिकाहरू" : "Palikas Covered",
      value: language === "NP" ? "गोदावरी, गौरीगंगा, चुरे, मोहनयाल" : "Godawari, Gauriganga, Chure, Mohanyal",
      colorCls: "bg-green-50 text-green-600",
    },
    {
      icon: FileText,
      title: language === "NP" ? "कुल उजुरी" : "Complaints Filed",
      value: String(stats?.total ?? 0),
      colorCls: "bg-orange-50 text-orange-600",
    },
    {
      icon: CheckCircle2,
      title: language === "NP" ? "समाधान भएका" : "Resolved",
      value: String(stats?.resolved ?? 0),
      colorCls: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Users,
      title: language === "NP" ? "स्वयंसेवकहरू" : "Volunteers",
      value: String(teamMembers?.length ?? 0),
      colorCls: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {language === "NP" ? "हाम्रो बारेमा" : "About Us"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {language === "NP"
            ? "कैलाली-४ डिजिटल सांसद कार्यालय प्रणाली"
            : "Kailali-4 Digital MP Office System"}
        </p>
      </div>

      {/* MP Profile Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary text-primary-foreground rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-lg"
      >
        <div className="w-24 h-24 rounded-full bg-white/20 flex-shrink-0 overflow-hidden flex items-center justify-center border-4 border-white/30">
          {mpProfile?.photoUrl
            ? <img src={mpProfile.photoUrl} alt="MP" className="w-full h-full object-cover" />
            : <User size={40} className="opacity-80" />
          }
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
            {language === "NP" ? "सांसद प्रोफाइल" : "Member of Parliament"}
          </p>
          <h2 className="text-2xl font-bold">
            {mpProfile?.name ?? "Member of Parliament — Kailali-4"}
          </h2>
          <p className="text-sm opacity-80 mt-2 leading-relaxed max-w-xl">
            {mpProfile?.message ?? "Serving with transparency, accountability, and dedication to the people of Kailali Constituency 4."}
          </p>
          {hasSocial && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              {socialLinks?.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs font-medium">
                  <Facebook size={13} /> Facebook <ExternalLink size={10} className="opacity-60" />
                </a>
              )}
              {socialLinks?.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs font-medium">
                  <Youtube size={13} /> YouTube <ExternalLink size={10} className="opacity-60" />
                </a>
              )}
              {socialLinks?.website && (
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs font-medium">
                  <Globe size={13} /> Website <ExternalLink size={10} className="opacity-60" />
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {infoCards.map(({ icon: Icon, title, value, colorCls }, idx) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 text-center"
          >
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2", colorCls)}>
              <Icon size={18} />
            </div>
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{title}</p>
          </motion.div>
        ))}
      </div>

      {/* About the system */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Info size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">
            {language === "NP" ? "प्रणालीको बारेमा" : "About the System"}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {language === "NP"
            ? "कैलाली-४ डिजिटल सांसद कार्यालय प्रणाली एक आधुनिक नागरिक-प्रविधि मञ्च हो जसले कैलाली निर्वाचन क्षेत्र नम्बर ४ का नागरिकहरूलाई सरकारसँग जोड्छ। यस प्रणालीमार्फत नागरिकहरू आफ्ना उजुरी दर्ता गर्न, विचार साझा गर्न, र सांसदीय कार्यालयको गतिविधिबारे जानकारी प्राप्त गर्न सक्छन्।"
            : "The Kailali-4 Digital MP Office System is a modern civic-tech platform that connects the citizens of Kailali Constituency 4 with their elected representative. Through this system, citizens can file complaints, share ideas for community development, track the status of their submissions, and stay informed about the work of the parliamentary office."
          }
        </p>
        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          {[
            {
              title: language === "NP" ? "उजुरी व्यवस्थापन" : "Complaint Management",
              desc:  language === "NP" ? "उजुरी दर्ता गर्नुस् र स्थिति ट्र्याक गर्नुस्" : "File complaints and track their resolution status in real time",
            },
            {
              title: language === "NP" ? "विचार मञ्च" : "Ideas Platform",
              desc:  language === "NP" ? "विकासका विचार साझा गर्नुस् र मतदान गर्नुस्" : "Share development ideas and vote on community proposals",
            },
            {
              title: language === "NP" ? "पालिका निर्देशिका" : "Palika Directory",
              desc:  language === "NP" ? "वडा र पालिका जानकारी ब्राउज गर्नुस्" : "Browse ward and palika information across the constituency",
            },
            {
              title: language === "NP" ? "स्वयंसेवक टोली" : "Volunteer Team",
              desc:  language === "NP" ? "स्वयंसेवक टोलीमा सामेल हुनुस्" : "Join the volunteer team and contribute to your community",
            },
          ].map(({ title, desc }) => (
            <div key={title} className="flex gap-3 p-3 bg-muted/40 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Contact info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Phone size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">
            {language === "NP" ? "सम्पर्क जानकारी" : "Contact Information"}
          </h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: MapPin, label: language === "NP" ? "कार्यालय ठेगाना" : "Office Address",   value: language === "NP" ? "धनगढी, कैलाली" : "Dhangadhi, Kailali" },
            { icon: Phone,  label: language === "NP" ? "फोन" : "Phone",                        value: "+977-091-XXXXXX" },
            { icon: Mail,   label: language === "NP" ? "इमेल" : "Email",                       value: "mp@kailali4.gov.np" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <Icon size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-sm text-foreground font-medium mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Social links section — shown when at least one link is saved */}
      {hasSocial && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">
              {language === "NP" ? "सामाजिक सञ्जाल" : "Social Media"}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {socialLinks?.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm">
                <Facebook size={18} />
                {language === "NP" ? "फेसबुक" : "Facebook"}
                <ExternalLink size={12} className="opacity-60" />
              </a>
            )}
            {socialLinks?.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm">
                <Youtube size={18} />
                {language === "NP" ? "युट्युब" : "YouTube"}
                <ExternalLink size={12} className="opacity-60" />
              </a>
            )}
            {socialLinks?.website && (
              <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition-colors font-medium text-sm">
                <Globe size={18} />
                {language === "NP" ? "वेबसाइट" : "Website"}
                <ExternalLink size={12} className="opacity-60" />
              </a>
            )}
          </div>
        </motion.div>
      )}

    </div>
  );
}
