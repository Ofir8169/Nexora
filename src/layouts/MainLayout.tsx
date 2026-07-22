import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  RadioTower,
  Settings,
  Sparkles,
  Truck,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import CommandPalette from "../components/CommandPalette/CommandPalette";
import GlobalSearch from "../components/GlobalSearch/GlobalSearch";
import QuickActions from "../components/QuickActions/QuickActions";
import Onboarding from "../components/Onboarding/Onboarding";
import NexoraPulse from "../components/NexoraPulse/NexoraPulse";
import NotificationCenter from "../features/notifications/Notifications";
import { canAccess, getLocale, getUserRole, localized } from "../lib/preferences";
import { clearAuth } from "../lib/auth";
import AccessibilityMenu from "../components/Accessibility/AccessibilityMenu";

type NavigationItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

const navigationGroups: { label: string; items: NavigationItem[] }[] = [
  {
    label: "Core",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard },
      { label: "My Workday", path: "/work", icon: CalendarCheck2 },
      { label: "Business", path: "/business", icon: BriefcaseBusiness },
      { label: "Tasks", path: "/tasks", icon: ClipboardList },
      { label: "AI Commander", path: "/ai", icon: Bot },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Fleet", path: "/fleet", icon: Truck },
      { label: "Employees", path: "/employees", icon: Users },
      { label: "Sites", path: "/sites", icon: Building2 },
      { label: "Live map", path: "/map", icon: Map },
      { label: "Command Center", path: "/command", icon: RadioTower },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics", path: "/analytics", icon: BarChart3 },
      { label: "Reports", path: "/reports", icon: FileText },
    ],
  },
];

const mobileNavigation: NavigationItem[] = [
  { label: "Home", path: "/", icon: LayoutDashboard },
  { label: "Work", path: "/work", icon: CalendarCheck2 },
  { label: "Business", path: "/business", icon: BriefcaseBusiness },
  { label: "AI", path: "/ai", icon: Bot },
  { label: "More", path: "/settings", icon: Settings },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreToolsOpen, setMoreToolsOpen] = useState(() => navigationGroups.slice(1).some((group) => group.items.some((item) => item.path === window.location.pathname)));
  const user = localStorage.getItem("nexora_user") ?? "operator@nexora.ai";
  const role = getUserRole();
  const locale = getLocale();
  const t = (en: string, he: string) => localized(en, he, locale);
  const translatedLabels: Record<string, string> = {
    Dashboard: t("Dashboard", "ראשי"), "My Workday": t("My Workday", "היום שלי"), Work: t("Work", "עבודה"), "Command Center": t("Command Center", "מרכז שליטה"), Tasks: t("Tasks", "משימות"), Fleet: t("Fleet", "צי רכב"),
    Employees: t("Employees", "עובדים"), Sites: t("Sites", "אתרים"), "Live map": t("Live map", "מפה חיה"),
    Business: t("Business", "עסק"), Analytics: t("Analytics", "ניתוחים"), Reports: t("Reports", "דוחות"),
    "AI Commander": t("AI Commander", "עוזר AI"), Settings: t("Settings", "הגדרות"), Home: t("Home", "ראשי"),
    AI: "AI", More: t("More", "עוד"),
  };

  function logout() {
    clearAuth();
    window.location.reload();
  }

  return (
    <div className="nexora-light min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="nexora-ambient" aria-hidden="true">
        <span className="nexora-orb nexora-orb-blue" />
        <span className="nexora-orb nexora-orb-violet" />
        <span className="nexora-orb nexora-orb-cyan" />
        <span className="nexora-dot-field" />
      </div>
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[200] -translate-y-20 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0"
      >
        {t("Skip to content", "דלג לתוכן")}
      </a>
      <CommandPalette />
      <Onboarding />

      <div className="min-h-screen md:grid md:grid-cols-[248px_minmax(0,1fr)]">
        <aside
          className={`${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } nexora-sidebar fixed inset-y-0 left-0 z-[90] flex w-[272px] flex-col border-slate-200 bg-white px-4 py-5 shadow-2xl transition-transform duration-200 md:sticky md:top-0 md:h-screen md:w-auto md:translate-x-0 md:shadow-none`}
        >
          <div className="flex items-center justify-between px-2">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Nexora dashboard"
              className="flex items-center gap-3 rounded-xl"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
                <Sparkles size={19} />
              </span>
              <span>
                <span className="block text-[17px] font-bold tracking-[-0.02em] text-slate-950">
                  Nexora
                </span>
                <span className="block text-[11px] font-medium tracking-wide text-slate-400">
                  BUSINESS OS
                </span>
              </span>
            </NavLink>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav aria-label="Main navigation" className="mt-8 flex-1 overflow-y-auto">
            {navigationGroups.slice(0, 1).map((group) => {
              const visibleItems = group.items.filter((item) => canAccess(role, item.path));
              if (!visibleItems.length) return null;

              return (
                <div key={group.label}>
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{t("Workspace", "סביבת עבודה")}</p>
                  <div className="space-y-1">
                    {visibleItems.map((item) => (
                      <NavigationLink
                        key={item.path}
                        item={{ ...item, label: translatedLabels[item.label] ?? item.label }}
                        onNavigate={() => setMobileMenuOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            {navigationGroups.slice(1).some((group) => group.items.some((item) => canAccess(role, item.path))) && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  aria-expanded={moreToolsOpen}
                  onClick={() => setMoreToolsOpen((value) => !value)}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <span>{t("More tools", "כלים נוספים")}</span>
                  <ChevronDown size={16} className={`transition-transform ${moreToolsOpen ? "rotate-180" : ""}`} />
                </button>
                {moreToolsOpen && <div className="mt-2 space-y-5">
                  {navigationGroups.slice(1).map((group) => {
                    const visibleItems = group.items.filter((item) => canAccess(role, item.path));
                    if (!visibleItems.length) return null;
                    return <div key={group.label}>
                      <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{group.label === "Operations" ? t("Operations", "תפעול") : t("Insights", "תובנות")}</p>
                      <div className="space-y-1">{visibleItems.map((item) => <NavigationLink key={item.path} item={{ ...item, label: translatedLabels[item.label] ?? item.label }} onNavigate={() => setMobileMenuOpen(false)} />)}</div>
                    </div>;
                  })}
                </div>}
              </div>
            )}
          </nav>

          <div className="mt-5 border-t border-slate-100 pt-4">
            {canAccess(role, "/settings") && (
              <NavigationLink
                item={{ label: t("Settings", "הגדרות"), path: "/settings", icon: Settings }}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            )}
            <div className="mt-3 rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <UserCircle2 size={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{user.split("@")[0]}</p>
                  <p className="text-xs text-slate-500">{t(`${role} account`, `חשבון ${role}`)}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-[80] bg-slate-950/25 backdrop-blur-sm md:hidden"
          />
        )}

        <div className="min-w-0">
          <header className="nexora-topbar sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
            <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm md:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0 flex-1 md:max-w-xl">
                <GlobalSearch />
              </div>

              <button type="button" onClick={() => window.dispatchEvent(new Event("nexora:command"))} className="hidden h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 shadow-sm hover:bg-slate-50 xl:flex"><span>{t("Commands", "פקודות")}</span><kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px]">⌘K</kbd></button>

              <div className="hidden lg:block">
                <QuickActions />
              </div>

              <NexoraPulse />

              <NotificationCenter />

              <AccessibilityMenu />

              <div className="relative">
                <button
                  type="button"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Open user menu"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <UserCircle2 size={18} />
                  </span>
                  <span className="hidden max-w-28 truncate text-sm font-semibold lg:block">
                    {user.split("@")[0]}
                  </span>
                  <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
                </button>

                {userMenuOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                    <div className="px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-slate-900">{user}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{t(`${role} access`, `הרשאת ${role}`)}</p>
                    </div>
                    {canAccess(role, "/settings") && (
                      <NavLink
                        role="menuitem"
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Settings size={17} /> {t("Settings", "הגדרות")}
                      </NavLink>
                    )}
                    {canAccess(role, "/team") && (
                      <NavLink role="menuitem" to="/team" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        <Users size={17} /> {t("Team & permissions", "צוות והרשאות")}
                      </NavLink>
                    )}
                    {canAccess(role, "/plans") && (
                      <NavLink role="menuitem" to="/plans" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        <CreditCard size={17} /> {t("Plans & trial", "תוכניות ותקופת ניסיון")}
                      </NavLink>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={17} /> {t("Log out", "התנתקות")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1440px] px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-3 bottom-3 z-50 flex rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-2xl shadow-slate-900/15 backdrop-blur-xl md:hidden"
      >
        {mobileNavigation.filter((item) => canAccess(role, item.path)).map((item) => {
          const Icon = item.icon;
          const label = translatedLabels[item.label] ?? item.label;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              aria-label={label}
              className={({ isActive }) =>
                `flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-500"
                }`
              }
            >
              <Icon size={19} />
              <span className="max-w-full truncate">{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function NavigationLink({ item, onNavigate }: { item: NavigationItem; onNavigate: () => void }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${isActive ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 group-hover:text-slate-700"}`}>
            <Icon size={17} />
          </span>
          {item.label}
        </>
      )}
    </NavLink>
  );
}
