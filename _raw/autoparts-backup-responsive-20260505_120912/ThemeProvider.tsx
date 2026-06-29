"use client";
import { useEffect } from "react";

interface ThemeColors {
  primary: string;
  primaryDark: string;
  sidebarBg: string;
  sidebarBorder: string;
  sidebarText: string;
  headerBg: string;
  textPrimary: string;
  textMuted: string;
  linkColor: string;
  pageBg: string;
  cardBg: string;
  accentRed: string;
  borderColor: string;
  topBarBg: string;
  topBarText: string;
  buttonRadius: string;
}

const DEFAULTS: ThemeColors = {
  primary:      "#1a4b97",
  primaryDark:  "#113264",
  sidebarBg:    "#0d1f3b",
  sidebarBorder:"#1a3258",
  sidebarText:  "#a5c0e1",
  headerBg:     "#ffffff",
  textPrimary:  "#24292e",
  textMuted:    "#6a737d",
  linkColor:    "#2188ff",
  pageBg:       "#f6f8fa",
  cardBg:       "#ffffff",
  accentRed:    "#5C4DB1",   // Purple accent from logo
  borderColor:  "#e1e4e8",
  topBarBg:     "#04142d",
  topBarText:   "#ffffff",
  buttonRadius: "6",
};

function buildCSS(t: ThemeColors): string {
  const r = t.buttonRadius + "px";

  // All old red/orange hex values that might still appear
  const redHexes = ["#fe0035","#cc002c","#ee0033","#e03"];
  // All old sidebar/dark bg hex values
  const darkHexes = ["#1b1d1f","#04142d"];

  let overrides = "";

  // Override arbitrary Tailwind hex classes → CSS vars
  const colorMap: [string, string][] = [
    ...redHexes.map(h => [h, "var(--ap-primary)"] as [string, string]),
    ...darkHexes.map(h => [h, "var(--ap-sidebar-bg)"] as [string, string]),
    ["#f4f4f4", "var(--ap-page-bg)"],
    ["#44494d", "var(--ap-text)"],
    ["#8f9294", "var(--ap-text-muted)"],
    ["#2f3336", "var(--ap-sidebar-border)"],
    ["#e5e5e5", "var(--ap-border)"],
  ];

  for (const [hex, varRef] of colorMap) {
    const e = hex.replace("#", "\\#");
    overrides += `
.bg-\\[${e}\\]      { background-color: ${varRef} !important; }
.text-\\[${e}\\]    { color: ${varRef} !important; }
.border-\\[${e}\\]  { border-color: ${varRef} !important; }
.accent-\\[${e}\\]  { accent-color: ${varRef} !important; }
.fill-\\[${e}\\]    { fill: ${varRef} !important; }
.from-\\[${e}\\]    { --tw-gradient-from: ${varRef} !important; }
.to-\\[${e}\\]      { --tw-gradient-to: ${varRef} !important; }
.ring-\\[${e}\\]    { --tw-ring-color: ${varRef} !important; }`;
  }

  // Override for primary color with current value (handles the new #1a4b97 classes too)
  const primaryE = t.primary.replace("#", "\\#");
  overrides += `
.bg-\\[${primaryE}\\]      { background-color: var(--ap-primary) !important; }
.text-\\[${primaryE}\\]    { color: var(--ap-primary) !important; }
.border-\\[${primaryE}\\]  { border-color: var(--ap-primary) !important; }
.accent-\\[${primaryE}\\]  { accent-color: var(--ap-primary) !important; }`;

  return `
:root {
  --ap-primary:        ${t.primary};
  --ap-primary-dark:   ${t.primaryDark};
  --ap-sidebar-bg:     ${t.sidebarBg};
  --ap-sidebar-border: ${t.sidebarBorder};
  --ap-sidebar-text:   ${t.sidebarText};
  --ap-header-bg:      ${t.headerBg};
  --ap-text:           ${t.textPrimary};
  --ap-text-muted:     ${t.textMuted};
  --ap-link:           ${t.linkColor};
  --ap-page-bg:        ${t.pageBg};
  --ap-card-bg:        ${t.cardBg};
  --ap-accent:         ${t.accentRed};
  --ap-border:         ${t.borderColor};
  --ap-topbar-bg:      ${t.topBarBg};
  --ap-topbar-text:    ${t.topBarText};
  --ap-btn-radius:     ${r};
}

/* ── Global accent-color for ALL form controls (sliders, checkboxes, etc.) ── */
input[type="range"],
input[type="checkbox"],
input[type="radio"],
progress {
  accent-color: var(--ap-primary) !important;
}

/* ── Override Tailwind orange/red utility classes used as brand colors ── */
.text-orange-400, .text-orange-500, .text-orange-600 { color: var(--ap-primary) !important; }
.bg-orange-400, .bg-orange-500, .bg-orange-600 { background-color: var(--ap-primary) !important; }
.border-orange-400, .border-orange-500, .border-orange-600 { border-color: var(--ap-primary) !important; }
.hover\\:text-orange-500:hover, .hover\\:text-orange-600:hover { color: var(--ap-primary) !important; }
.focus\\:border-orange-400:focus, .focus\\:border-orange-500:focus { border-color: var(--ap-primary) !important; }
.ring-orange-400, .ring-orange-500 { --tw-ring-color: var(--ap-primary) !important; }
.accent-\\[\\#fe0035\\], .accent-\\[\\#ee0033\\] { accent-color: var(--ap-primary) !important; }

/* ── Sidebar arbitrary classes ── */
${overrides}
`;
}

export default function ThemeProvider() {
  useEffect(() => {
    const id = "ap-theme-style";
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    // Apply defaults immediately (no flicker)
    style.textContent = buildCSS(DEFAULTS);

    // Then fetch fresh settings from API
    fetch("/api/settings", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const theme = d?.theme as Partial<ThemeColors> | undefined;
        if (theme) {
          style!.textContent = buildCSS({ ...DEFAULTS, ...theme });
        }
      })
      .catch(() => { /* keep defaults */ });

    return () => { document.getElementById(id)?.remove(); };
  }, []);

  return null;
}
