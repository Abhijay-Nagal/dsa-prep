"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import { Icon } from "@/components/ui/Icon";
import { Segmented } from "@/components/ui/bits";
import { useStore } from "@/lib/store/useStore";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-panel-2" />,
});

type Lang = "javascript" | "python" | "cpp" | "java";

const EXT: Record<Lang, ReturnType<typeof javascript>[]> = {
  javascript: [javascript({ jsx: false, typescript: false })],
  python: [python()] as never,
  cpp: [cpp()] as never,
  java: [cpp()] as never,
};

const STARTER: Record<Lang, (title: string) => string> = {
  javascript: (t) => `// ${t}\n// Only JavaScript runs in the sandbox below.\n\nfunction solve(input) {\n  // your code here\n  return input;\n}\n\nconsole.log(solve([1, 2, 3]));\n`,
  python: (t) => `# ${t}\n\ndef solve(nums):\n    # your code here\n    return nums\n\nprint(solve([1, 2, 3]))\n`,
  cpp: (t) => `// ${t}\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}\n`,
  java: (t) => `// ${t}\nclass Solution {\n    public static void main(String[] args) {\n        // your code here\n    }\n}\n`,
};

/**
 * Runs JavaScript inside a Web Worker built from a Blob, so a runaway loop
 * cannot freeze the page and the code has no access to the DOM.
 */
function runInWorker(code: string, timeoutMs = 2500): Promise<{ logs: string[]; error?: string; ms: number }> {
  return new Promise((resolve) => {
    const shim = `
      const __logs = [];
      const fmt = (v) => {
        try {
          if (typeof v === "string") return v;
          return JSON.stringify(v, (k, val) => (typeof val === "bigint" ? String(val) : val));
        } catch { return String(v); }
      };
      self.console = {
        log: (...a) => __logs.push(a.map(fmt).join(" ")),
        error: (...a) => __logs.push("error: " + a.map(fmt).join(" ")),
        warn: (...a) => __logs.push("warn: " + a.map(fmt).join(" ")),
        info: (...a) => __logs.push(a.map(fmt).join(" ")),
      };
      const __t0 = Date.now();
      try {
        ${code}
        self.postMessage({ logs: __logs, ms: Date.now() - __t0 });
      } catch (e) {
        self.postMessage({ logs: __logs, error: String(e && e.message ? e.message : e), ms: Date.now() - __t0 });
      }
    `;
    let url = "";
    let worker: Worker | null = null;
    const done = (r: { logs: string[]; error?: string; ms: number }) => {
      if (worker) worker.terminate();
      if (url) URL.revokeObjectURL(url);
      resolve(r);
    };
    try {
      url = URL.createObjectURL(new Blob([shim], { type: "text/javascript" }));
      worker = new Worker(url);
      const timer = setTimeout(() => done({ logs: [], error: `Timed out after ${timeoutMs}ms. Infinite loop?`, ms: timeoutMs }), timeoutMs);
      worker.onmessage = (e) => {
        clearTimeout(timer);
        done(e.data);
      };
      worker.onerror = (e) => {
        clearTimeout(timer);
        done({ logs: [], error: e.message || "Worker error", ms: 0 });
      };
    } catch (e) {
      done({ logs: [], error: String(e), ms: 0 });
    }
  });
}

export function CodePad({ problemId, title }: { problemId: string; title: string }) {
  const defaultLang = useStore((s) => s.settings.language);
  const [lang, setLang] = useState<Lang>(defaultLang);
  return <Pad key={`${problemId}:${lang}`} problemId={problemId} title={title} lang={lang} setLang={setLang} />;
}

function Pad({
  problemId,
  title,
  lang,
  setLang,
}: {
  problemId: string;
  title: string;
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const stored = useStore((s) => s.progress[problemId]?.code);
  const setCode = useStore((s) => s.setCode);
  const setSetting = useStore((s) => s.setSetting);
  const [value, setValue] = useState(() => stored?.[lang] ?? STARTER[lang](title));
  const [out, setOut] = useState<{ logs: string[]; error?: string; ms: number } | null>(null);
  const [running, setRunning] = useState(false);
  const saveTimer = useRef<number | null>(null);

  const onChange = useCallback(
    (v: string) => {
      setValue(v);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => setCode(problemId, lang, v), 700);
    },
    [lang, problemId, setCode],
  );

  const run = async () => {
    setRunning(true);
    setOut(null);
    const res = await runInWorker(value);
    setOut(res);
    setRunning(false);
  };
  return (
    <div className="panel overflow-hidden">
      <div className="hairline flex flex-wrap items-center gap-2 px-3 py-2">
        <Icon name="Code2" size={14} className="text-accent" />
        <span className="text-xs font-bold">Scratchpad</span>
        <Segmented
          size="sm"
          value={lang}
          onChange={(l) => {
            setLang(l);
            setSetting("language", l);
          }}
          options={[
            { value: "javascript", label: "JS" },
            { value: "python", label: "Py" },
            { value: "cpp", label: "C++" },
            { value: "java", label: "Java" },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <button
            className="btn !py-1 !text-[11px]"
            onClick={() => {
              setValue(STARTER[lang](title));
              setCode(problemId, lang, STARTER[lang](title));
            }}
          >
            <Icon name="RotateCcw" size={11} /> Reset
          </button>
          <button
            className="btn !py-1 !text-[11px]"
            onClick={() => navigator.clipboard?.writeText(value)}
          >
            <Icon name="Copy" size={11} /> Copy
          </button>
          <button className="btn btn-primary !py-1 !text-[11px]" onClick={run} disabled={running || lang !== "javascript"}>
            <Icon name={running ? "Loader2" : "Play"} size={11} className={running ? "animate-spin" : ""} />
            Run
          </button>
        </div>
      </div>

      <CodeMirror
        value={value}
        height="300px"
        theme={oneDark}
        extensions={EXT[lang]}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true, tabSize: 2 }}
      />

      <div className="border-t border-line-soft px-3 py-2">
        {lang !== "javascript" && (
          <p className="text-[11px] text-faint">
            The sandbox executes JavaScript only. Other languages are stored as notes so you can draft a solution in the
            language you will actually use in the interview.
          </p>
        )}
        {out && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] text-faint">
              <Icon name="Timer" size={10} /> {out.ms}ms
            </div>
            {out.logs.map((l, i) => (
              <pre key={i} className="whitespace-pre-wrap font-mono text-[11px] text-dim">
                {l}
              </pre>
            ))}
            {out.error && (
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-hard">{out.error}</pre>
            )}
            {!out.logs.length && !out.error && <span className="text-[11px] text-faint">No output.</span>}
          </div>
        )}
        {!out && lang === "javascript" && (
          <p className="text-[11px] text-faint">
            Runs in a worker with a 2.5 second cap, so an infinite loop cannot lock the page.
          </p>
        )}
      </div>
    </div>
  );
}
