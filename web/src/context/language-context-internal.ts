import { createContext } from "react";
import type { Lang, MsgKey } from "../i18n/copy";

export type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MsgKey) => string;
  ti: (key: MsgKey, vars: Record<string, string>) => string;
};

export const LanguageContext = createContext<LangContextValue | null>(null);
