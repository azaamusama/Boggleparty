"use client";

import { useState } from "react";

type WordInputProps = {
  disabled: boolean;
  onSubmit: (word: string) => void;
};

export function WordInput({ disabled, onSubmit }: WordInputProps) {
  const [word, setWord] = useState("");

  const submit = () => {
    const nextWord = word.trim();

    if (!nextWord || disabled) {
      return;
    }

    onSubmit(nextWord);
    setWord("");
  };

  return (
    <div className="rounded-[2rem] border border-white/50 bg-white/90 p-4 shadow-[0_20px_64px_rgba(13,51,86,0.12)]">
      <label className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
        Find a word
      </label>
      <div className="mt-3 flex gap-3">
        <input
          value={word}
          onChange={(event) => setWord(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          placeholder={disabled ? "Round over" : "Type and press Enter"}
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg font-semibold uppercase tracking-[0.12em] text-slate-900 outline-none transition focus:border-sky-400"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={submit}
          className="rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#22c55e_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
