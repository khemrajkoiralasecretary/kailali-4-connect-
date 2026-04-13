import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "EN" | "NP";

type Translations = Record<string, string>;

const en: Translations = {
  "app.title": "Kailali-4 Connect",
  "nav.dashboard": "Dashboard",
  "nav.complaints": "Complaints",
  "nav.ideas": "Ideas",
  "nav.news": "News",
  "nav.directory": "Directory",
  "nav.team": "Team",
  "nav.admin": "Admin",
  "btn.submitComplaint": "Submit Complaint",
  "btn.submitIdea": "Submit Idea",
  "dashboard.total": "Total",
  "dashboard.pending": "Pending",
  "dashboard.inProgress": "In Progress",
  "dashboard.resolved": "Resolved",
  "dashboard.ward": "Ward",
  "dashboard.mpProfile": "MP Profile",
  "complaints.filterStatus": "Filter Status",
  "complaints.filterWard": "Filter Ward",
  "complaints.new": "New Complaint",
  "complaints.name": "Name",
  "complaints.phone": "Phone (Optional)",
  "complaints.category": "Category",
  "complaints.description": "Description",
  "complaints.ward": "Ward",
  "ideas.new": "New Idea",
  "ideas.title": "Title",
  "ideas.description": "Description",
  "ideas.submittedBy": "Submitted By",
  "ideas.upvotes": "Upvotes",
  "news.new": "New Update",
  "news.title": "Title",
  "news.content": "Content",
  "news.category": "Category",
  "common.submit": "Submit",
  "common.cancel": "Cancel",
  "common.back": "Back",
  "common.loading": "Loading...",
  "common.error": "An error occurred",
  "common.empty": "No data available",
};

const np: Translations = {
  "app.title": "कैलाली-४ कनेक्ट",
  "nav.dashboard": "ड्यासबोर्ड",
  "nav.complaints": "उजुरी",
  "nav.ideas": "विचार",
  "nav.news": "समाचार",
  "nav.directory": "निर्देशिका",
  "nav.team": "टोली",
  "nav.admin": "एडमिन",
  "btn.submitComplaint": "उजुरी दिनुस्",
  "btn.submitIdea": "विचार राख्नुस्",
  "dashboard.total": "कुल",
  "dashboard.pending": "विचाराधीन",
  "dashboard.inProgress": "प्रगतिमा",
  "dashboard.resolved": "समाधान",
  "dashboard.ward": "वार्ड",
  "dashboard.mpProfile": "सांसद प्रोफाइल",
  "complaints.filterStatus": "स्थिति फिल्टर",
  "complaints.filterWard": "वार्ड फिल्टर",
  "complaints.new": "नयाँ उजुरी",
  "complaints.name": "नाम",
  "complaints.phone": "फोन (वैकल्पिक)",
  "complaints.category": "वर्ग",
  "complaints.description": "विवरण",
  "complaints.ward": "वार्ड",
  "ideas.new": "नयाँ विचार",
  "ideas.title": "शीर्षक",
  "ideas.description": "विवरण",
  "ideas.submittedBy": "पेश गर्ने",
  "ideas.upvotes": "अपभोटहरू",
  "news.new": "नयाँ समाचार",
  "news.title": "शीर्षक",
  "news.content": "सामग्री",
  "news.category": "वर्ग",
  "common.submit": "पेश गर्नुहोस्",
  "common.cancel": "रद्द गर्नुहोस्",
  "common.back": "पछाडि",
  "common.loading": "लोड हुँदैछ...",
  "common.error": "त्रुटि भयो",
  "common.empty": "कुनै डाटा छैन",
};

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("EN");

  const t = (key: string): string => {
    const translations = language === "EN" ? en : np;
    return translations[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
