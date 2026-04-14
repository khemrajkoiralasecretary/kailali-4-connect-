import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useCitizenAuth } from "@/lib/citizenAuth";
import {
  LayoutDashboard, FileText, Lightbulb, Newspaper, Map, Users,
  ShieldCheck, Menu, X, Facebook, Youtube, Globe, Info, UserCircle, LogOut, CalendarDays, Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGetSocialLinks } from "@workspace/api-client-react";
import CitizenAuthModal from "@/components/CitizenAuthModal";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, language, setLanguage } = useI18n();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { data: socialLinks } = useGetSocialLinks();
  const { citizen, clearCitizenSession } = useCitizenAuth();

  const navItems = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/complaints", label: t("nav.complaints"), icon: FileText },
    { href: "/ideas", label: t("nav.ideas"), icon: Lightbulb },
    { href: "/news", label: t("nav.news"), icon: Newspaper },
    { href: "/events", label: language === "NP" ? "कार्यक्रम" : "Events", icon: CalendarDays },
    { href: "/fund",   label: language === "NP" ? "कोष" : "Fund",         icon: Wallet },
    { href: "/directory", label: t("nav.directory"), icon: Map },
    { href: "/team", label: t("nav.team"), icon: Users },
    { href: "/about", label: t("nav.about") ?? "About", icon: Info },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-1 rounded hover:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  K4
                </div>
                <span className="font-bold text-lg tracking-tight hidden sm:block">
                  {t("app.title")}
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === "EN" ? "NP" : "EN")}
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white/20 hover:bg-white/30 transition-colors border border-white/30"
              >
                {language === "EN" ? "ने" : "EN"}
              </button>

              {/* Citizen Auth Button */}
              {citizen ? (
                <div className="flex items-center gap-1.5">
                  <Link href="/citizen"
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors border border-white/30",
                      isActive("/citizen") ? "bg-white/30" : "bg-white/15 hover:bg-white/25"
                    )}>
                    <UserCircle size={14} />
                    <span className="hidden sm:inline max-w-[80px] truncate">{citizen.name.split(" ")[0]}</span>
                  </Link>
                  <button onClick={clearCitizenSession}
                    title="Logout"
                    className="w-7 h-7 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors border border-white/20">
                    <LogOut size={13} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-white/15 hover:bg-white/25 transition-colors border border-white/30">
                  <UserCircle size={14} />
                  <span className="hidden sm:inline">
                    {language === "NP" ? "लगइन" : "Login"}
                  </span>
                </button>
              )}

              <Link href="/admin" title="Admin">
                <div className="w-8 h-8 bg-white/20 hover:bg-white/30 transition-colors rounded-full flex items-center justify-center cursor-pointer">
                  <ShieldCheck size={15} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-primary text-primary-foreground border-t border-white/10 px-4 pb-4"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors mt-1",
                    isActive(item.href)
                      ? "bg-white/20"
                      : "hover:bg-white/10"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            {/* Mobile citizen link */}
            {citizen ? (
              <div className="mt-2 pt-2 border-t border-white/10">
                <Link href="/citizen" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium hover:bg-white/10">
                  <UserCircle size={18} />
                  {citizen.name}
                </Link>
                <button onClick={() => { clearCitizenSession(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium hover:bg-white/10 w-full text-left">
                  <LogOut size={18} />
                  {language === "NP" ? "लगआउट" : "Logout"}
                </button>
              </div>
            ) : (
              <div className="mt-2 pt-2 border-t border-white/10">
                <button onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium hover:bg-white/10 w-full text-left">
                  <UserCircle size={18} />
                  {language === "NP" ? "नागरिक लगइन" : "Citizen Login"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t border-border bg-card text-muted-foreground text-xs py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Kailali Constituency 4 — Digital Governance Platform &mdash; Serving with Transparency</span>

          {(socialLinks?.facebook || socialLinks?.youtube || socialLinks?.website) && (
            <div className="flex items-center gap-3">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200">
                  <Facebook size={13} />
                  <span className="font-medium">Facebook</span>
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" title="YouTube"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200">
                  <Youtube size={13} />
                  <span className="font-medium">YouTube</span>
                </a>
              )}
              {socialLinks.website && (
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" title="Website"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200">
                  <Globe size={13} />
                  <span className="font-medium">Website</span>
                </a>
              )}
            </div>
          )}
        </div>
      </footer>

      {authOpen && <CitizenAuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
