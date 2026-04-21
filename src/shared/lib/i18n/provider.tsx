"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { translations } from "./translations"
import type { Lang, Translations } from "./translations"

// Each section is Record<string, string> so PT and EN are compatible
type T = { [K in keyof Translations]: Record<string, string> }

const LanguageContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: T
}>({
  lang: "pt",
  setLang: () => {},
  t: translations.pt as unknown as T,
})

const STORAGE_KEY = "budfin-lang"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored === "en" || stored === "pt") setLangState(stored)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] as unknown as T }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
