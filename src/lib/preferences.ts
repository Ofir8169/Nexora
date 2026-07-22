export type UserRole = "Admin" | "Manager" | "Finance" | "Operator";
export type Locale = "en" | "he";

const roles: UserRole[] = ["Admin", "Manager", "Finance", "Operator"];

export function getUserRole(): UserRole {
  const saved = localStorage.getItem("nexora_role") as UserRole | null;
  return saved && roles.includes(saved) ? saved : "Admin";
}

export function getLocale(): Locale {
  const saved = localStorage.getItem("nexora_locale");
  if (saved === "he" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("he") ? "he" : "en";
}

export function localized(en: string, he: string, locale = getLocale()) {
  return locale === "he" ? he : en;
}

export function applyLocale(locale = getLocale()) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
}

export function applyWorkspaceAppearance() {
  const saved = localStorage.getItem("nexora_brand_color") ?? "#2563eb";
  const brand = /^#[0-9a-f]{6}$/i.test(saved) ? saved : "#2563eb";
  document.documentElement.style.setProperty("--nexora-brand", brand);
  document.documentElement.classList.toggle("dark", localStorage.getItem("nexora_theme") === "dark");
}

export function canAccess(role: UserRole, path: string) {
  if (role === "Admin" || role === "Manager") return true;
  if (role === "Finance") {
    return ["/", "/business", "/reports", "/ai", "/settings", "/plans"].includes(path);
  }
  return ["/", "/work", "/tasks", "/map", "/ai"].includes(path);
}
