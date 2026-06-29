"use client";
import { useState, useEffect, useCallback } from "react";
import { useLang } from "@/lib/i18n";

interface MathCaptchaProps {
  onVerified: (ok: boolean) => void;
}

function generateChallenge() {
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;
  if (op === "+") {
    a = Math.floor(Math.random() * 15) + 1;
    b = Math.floor(Math.random() * 15) + 1;
    answer = a + b;
  } else if (op === "-") {
    a = Math.floor(Math.random() * 15) + 6;
    b = Math.floor(Math.random() * (a - 1)) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 5) + 2;
    answer = a * b;
  }
  return { a, b, op, answer };
}

export default function MathCaptcha({ onVerified }: MathCaptchaProps) {
  const { lang } = useLang();
  const [challenge, setChallenge] = useState(() => generateChallenge());
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "wrong">("idle");

  const refresh = useCallback(() => {
    setChallenge(generateChallenge());
    setInput("");
    setStatus("idle");
    onVerified(false);
  }, [onVerified]);

  useEffect(() => {
    if (input === "") { setStatus("idle"); onVerified(false); return; }
    const val = parseInt(input);
    if (isNaN(val)) return;
    if (val === challenge.answer) {
      setStatus("ok");
      onVerified(true);
    } else {
      setStatus("wrong");
      onVerified(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, challenge.answer]);

  return (
    <div className="p-3 bg-[#f8f8fa] rounded-xl border border-[#e5e5e5]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[#8f9294] text-xs font-semibold uppercase tracking-wide">
            {lang === "zh" ? "验证码" : "Xác minh"}
          </span>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-[#e5e5e5] font-mono font-bold text-[#44494d] select-none">
            <span className="text-lg">{challenge.a}</span>
            <span className="text-[#8f9294]">{challenge.op}</span>
            <span className="text-lg">{challenge.b}</span>
            <span className="text-[#8f9294]">=</span>
            <span className="text-[#8f9294]">?</span>
          </div>
        </div>
        <input
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="?"
          maxLength={3}
          className={`w-16 px-3 py-2 border-2 rounded-lg text-sm text-center font-bold focus:outline-none transition-colors ${
            status === "ok" ? "border-green-400 bg-green-50 text-green-700" :
            status === "wrong" ? "border-red-400 bg-red-50 text-red-700" :
            "border-[#e5e5e5] focus:border-[#1a4b97]"
          }`}
        />
        {status === "ok" && <span className="text-green-500 text-lg">✓</span>}
        {status === "wrong" && (
          <button onClick={refresh} title={lang === "zh" ? "换一题" : "Đổi câu hỏi"}
            className="text-[#8f9294] hover:text-[#44494d] text-lg transition-colors">
            🔄
          </button>
        )}
        {status === "idle" && (
          <button onClick={refresh} title={lang === "zh" ? "换一题" : "Đổi câu hỏi"}
            className="text-[#8f9294] hover:text-[#44494d] text-sm transition-colors opacity-60 hover:opacity-100">
            🔄
          </button>
        )}
      </div>
      {status === "wrong" && (
        <p className="text-xs text-red-500 mt-1.5 ml-1">
          {lang === "zh" ? "答案不正确，请重试" : "Đáp án không đúng, thử lại"}
        </p>
      )}
    </div>
  );
}
