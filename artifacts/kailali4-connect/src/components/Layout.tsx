import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { LayoutDashboard, FileText, Lightbulb, Newspaper, Map, Users, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, language, setLanguage } = useI18n();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/complaints", label: t("nav.complaints"), icon: FileText },
    { href: "/ideas", label: t("nav.ideas"), icon: Lightbulb },
    { href: "/news", label: t("nav.news"), icon: Newspaper },
    { href: "/directory", label: t("nav.directory"), icon: Map },
    { href: "/team", label: t("nav.team"), icon: Users },
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

      <footer className="border-t border-border bg-card text-muted-foreground text-xs py-4 text-center">
        <div className="max-w-7xl mx-auto px-4">
          Kailali Constituency 4 — Digital Governance Platform &mdash; Serving with Transparency
        </div>
      </footer>
    </div>
  );
}
