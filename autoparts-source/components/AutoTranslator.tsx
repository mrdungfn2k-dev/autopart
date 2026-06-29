"use client";

import { useEffect, useRef } from "react";
import { useLang, type Lang } from "@/lib/i18n";

const TRANSLATABLE_ATTRS = ["placeholder", "title", "aria-label"] as const;
const BASE_SKIP_SELECTOR = [
  "script",
  "style",
  "noscript",
  "svg",
  "canvas",
  "code",
  "pre",
  "[contenteditable='true']",
  "[data-no-translate]",
  "[data-auto-translate='off']",
  ".notranslate",
  ".ap-no-auto-translate",
].join(",");
const TEXT_SKIP_SELECTOR = [
  BASE_SKIP_SELECTOR,
  "input",
  "textarea",
].join(",");

type TextJob = {
  node: Text;
  source: string;
};

type AttrJob = {
  element: Element;
  attr: (typeof TRANSLATABLE_ATTRS)[number];
  source: string;
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function targetCode(lang: Lang) {
  return lang === "zh" ? "zh-CN" : lang;
}

function hasVietnameseLetters(value: string) {
  return /[\u00c0-\u1ef9]/i.test(value);
}

function hasCjk(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}

function shouldTranslate(source: string, lang: Lang) {
  const text = normalizeText(source);
  if (!text || lang === "vi") return false;
  if (text.length < 2 || text.length > 500) return false;
  if (!/[A-Za-z\u00c0-\u1ef9\u3400-\u9fff]/.test(text)) return false;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(text)) return false;
  if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(text)) return false;
  if (/^[A-Z0-9][A-Z0-9\s._/#:-]{1,40}$/.test(text) && !hasVietnameseLetters(text) && !hasCjk(text)) return false;
  if (lang === "zh" && hasCjk(text)) return false;
  return true;
}

function cacheKey(lang: Lang, source: string) {
  return `ap_i18n_auto:${lang}:${source}`;
}

function readCache(lang: Lang, source: string) {
  try {
    return sessionStorage.getItem(cacheKey(lang, source));
  } catch {
    return null;
  }
}

function writeCache(lang: Lang, source: string, value: string) {
  try {
    sessionStorage.setItem(cacheKey(lang, source), value);
  } catch {}
}

async function translateBatch(lang: Lang, texts: string[]) {
  const unique = Array.from(new Set(texts.map(normalizeText).filter(Boolean)));
  const output = new Map<string, string>();
  const pending: string[] = [];

  for (const text of unique) {
    const cached = readCache(lang, text);
    if (cached) output.set(text, cached);
    else pending.push(text);
  }

  for (let i = 0; i < pending.length; i += 40) {
    const batch = pending.slice(i, i + 40);
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: batch, from: "auto", to: targetCode(lang) }),
    });
    if (!res.ok) continue;
    const data = await res.json();
    const results = Array.isArray(data.results) ? data.results : [];
    batch.forEach((source, index) => {
      const translated = normalizeText(String(results[index] || ""));
      if (!translated) return;
      output.set(source, translated);
      writeCache(lang, source, translated);
    });
  }

  return output;
}

function isInsideSkippedElement(node: Node, selector = TEXT_SKIP_SELECTOR) {
  const parent = node.parentElement;
  return !parent || Boolean(parent.closest(selector));
}

export default function AutoTranslator() {
  const { lang } = useLang();
  const textOriginals = useRef<WeakMap<Text, string>>(new WeakMap());
  const attrOriginals = useRef<WeakMap<Element, Map<string, string>>>(new WeakMap());
  const observer = useRef<MutationObserver | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applying = useRef(false);
  const previousLang = useRef<Lang>(lang);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const lastLang = previousLang.current;
    previousLang.current = lang;

    if (lang === "vi" && lastLang !== "vi") {
      window.setTimeout(() => window.location.reload(), 20);
      return;
    }

    const restore = () => {
      applying.current = true;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode() as Text | null;
      while (node) {
        const original = textOriginals.current.get(node);
        if (original !== undefined && node.nodeValue !== original) node.nodeValue = original;
        node = walker.nextNode() as Text | null;
      }

      document.body.querySelectorAll("*").forEach((element) => {
        const originals = attrOriginals.current.get(element);
        if (!originals) return;
        originals.forEach((value, attr) => {
          if (element.getAttribute(attr) !== value) element.setAttribute(attr, value);
        });
      });
      applying.current = false;
    };

    const collect = () => {
      const textJobs: TextJob[] = [];
      const attrJobs: AttrJob[] = [];

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode() as Text | null;
      while (node) {
        if (!isInsideSkippedElement(node)) {
          const saved = textOriginals.current.get(node);
          const current = node.nodeValue || "";
          const source = saved ?? current;
          if (saved === undefined && normalizeText(current)) textOriginals.current.set(node, current);
          if (shouldTranslate(source, lang)) textJobs.push({ node, source: normalizeText(source) });
        }
        node = walker.nextNode() as Text | null;
      }

      document.body.querySelectorAll("*").forEach((element) => {
        if (element.closest(BASE_SKIP_SELECTOR)) return;
        for (const attr of TRANSLATABLE_ATTRS) {
          const current = element.getAttribute(attr);
          if (!current) continue;
          let originals = attrOriginals.current.get(element);
          if (!originals) {
            originals = new Map();
            attrOriginals.current.set(element, originals);
          }
          const source = originals.get(attr) ?? current;
          if (!originals.has(attr) && normalizeText(current)) originals.set(attr, current);
          if (shouldTranslate(source, lang)) attrJobs.push({ element, attr, source: normalizeText(source) });
        }
      });

      return { textJobs, attrJobs };
    };

    const run = async () => {
      if (lang === "vi") {
        restore();
        return;
      }

      const { textJobs, attrJobs } = collect();
      const translations = await translateBatch(lang, [
        ...textJobs.map((job) => job.source),
        ...attrJobs.map((job) => job.source),
      ]);

      applying.current = true;
      for (const job of textJobs) {
        const translated = translations.get(job.source);
        if (translated && job.node.isConnected && job.node.nodeValue !== translated) job.node.nodeValue = translated;
      }
      for (const job of attrJobs) {
        const translated = translations.get(job.source);
        if (translated && job.element.isConnected && job.element.getAttribute(job.attr) !== translated) {
          job.element.setAttribute(job.attr, translated);
        }
      }
      applying.current = false;
    };

    const schedule = () => {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => void run(), 180);
    };

    schedule();
    observer.current?.disconnect();
    observer.current = new MutationObserver(() => {
      if (!applying.current) schedule();
    });
    observer.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRS],
    });

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
      observer.current?.disconnect();
      observer.current = null;
    };
  }, [lang]);

  return null;
}
