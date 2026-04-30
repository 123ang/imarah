/* eslint-disable react-refresh/only-export-components -- module exports ToastProvider + useToast */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastItem = { id: number; text: string; kind: "info" | "err" };

type ToastCtx = { pushInfo: (t: string) => void; pushErr: (t: string) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((xs) => xs.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (text: string, kind: ToastItem["kind"]) => {
      const id = Date.now() + Math.random();
      setItems((xs) => [...xs, { id, text, kind }]);
      window.setTimeout(() => dismiss(id), 6000);
    },
    [dismiss],
  );

  const pushInfo = useCallback((text: string) => push(text, "info"), [push]);
  const pushErr = useCallback((text: string) => push(text, "err"), [push]);

  const v = useMemo(() => ({ pushInfo, pushErr }), [pushInfo, pushErr]);

  return (
    <Ctx.Provider value={v}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex max-w-sm flex-col gap-2"
        aria-live="polite"
      >
        {items.map((t) => (
          <button
            key={t.id}
            type="button"
            role="alert"
            onClick={() => dismiss(t.id)}
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-left text-sm shadow-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              t.kind === "err"
                ? "border-red-300 bg-red-50 text-red-900 focus-visible:outline-red-700"
                : "border-imarah-border bg-white text-imarah-deep focus-visible:outline-imarah-primary"
            }`}
          >
            {t.text}
          </button>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const x = useContext(Ctx);
  if (!x) throw new Error("useToast must be inside ToastProvider");
  return x;
}
