// Lê e persiste UTMs e info de origem
import { useEffect, useState } from "react";
import type { UTMs } from "@/types/funnel";

const STORAGE_KEY = "innerai_utms_v1";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"] as const;

function detectDevice(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return "mobile";
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  return "desktop";
}

function readUtms(): UTMs {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const fromStorage: UTMs = stored ? JSON.parse(stored) : {};
    const params = new URLSearchParams(window.location.search);
    const fromUrl: UTMs = {};
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) (fromUrl as Record<string, string>)[k] = v;
    });
    const merged: UTMs = {
      ...fromStorage,
      ...fromUrl,
      referrer: fromStorage.referrer || (document.referrer || undefined),
      device: fromStorage.device || detectDevice(),
      user_agent: fromStorage.user_agent || navigator.userAgent,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return {};
  }
}

export function useUtmParams(): UTMs {
  const [utms, setUtms] = useState<UTMs>({});
  useEffect(() => {
    setUtms(readUtms());
  }, []);
  return utms;
}

export function getStoredUtms(): UTMs {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}
