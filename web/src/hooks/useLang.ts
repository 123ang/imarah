import { useContext } from "react";
import { LanguageContext, type LangContextValue } from "../context/language-context-internal";

export function useLang(): LangContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
