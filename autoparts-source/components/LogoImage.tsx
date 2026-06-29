"use client";
import { useState, useEffect, useRef } from "react";

const DEFAULT_LOGO = "/ap-assets/autoparts-logo-clean.png";
const BC_NAME = "ap_logo_channel";

interface LogoImageProps {
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

// Extend Window to hold our listener set
declare global {
  interface Window {
    __apLogoListeners?: Set<(url: string) => void>;
  }
}

/** Called after admin uploads new logo - instantly syncs all open tabs */
export function notifyLogoChanged(url: string) {
  if (typeof window === "undefined") return;
  // Same-tab listeners
  window.__apLogoListeners?.forEach(fn => fn(url));
  // Cross-tab via BroadcastChannel
  try {
    const bc = new BroadcastChannel(BC_NAME);
    bc.postMessage({ type: "logo_changed", url });
    bc.close();
  } catch { /* unsupported */ }
}

export default function LogoImage({ className, alt = "AutoParts", style }: LogoImageProps) {
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // Register in global listener set for same-tab instant updates
    if (!window.__apLogoListeners) window.__apLogoListeners = new Set();
    const onUpdate = (url: string) => { if (mounted.current) setLogoUrl(url); };
    window.__apLogoListeners.add(onUpdate);

    // Always fetch fresh - no module-level cache that could be stale
    fetch("/api/settings", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const url: string = d?.branding?.logoUrl ?? DEFAULT_LOGO;
        if (mounted.current) setLogoUrl(url);
      })
      .catch(() => { /* keep default */ });

    // Cross-tab sync via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BC_NAME);
      bc.onmessage = (e) => {
        if (e.data?.type === "logo_changed" && e.data?.url && mounted.current) {
          setLogoUrl(e.data.url);
        }
      };
    } catch { /* ignore in unsupported envs */ }

    return () => {
      mounted.current = false;
      bc?.close();
      window.__apLogoListeners?.delete(onUpdate);
    };
  }, []);

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        const el = e.target as HTMLImageElement;
        if (!el.src.includes("autoparts-logo-clean")) {
          el.src = DEFAULT_LOGO;
        }
      }}
    />
  );
}
