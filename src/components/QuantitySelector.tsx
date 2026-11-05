import { useId, useState } from "react";

interface QuantitySelectorProps {
  value: number;
  onChange: (quantity: number) => void;
  label?: string;
  id?: string;
}

export function QuantitySelector({
  value,
  onChange,
  label = "Quantity",
  id,
}: QuantitySelectorProps) {
  const generatedId = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const inputId = id ?? generatedId;
  const text = draft ?? String(value);
  const parsed = Number(text);
  const valid = text !== "" && Number.isSafeInteger(parsed) && parsed >= 1;
  const quantity = valid ? parsed : 1;
  const buttonClass =
    "h-10 w-7 sm:h-11 sm:w-11 shrink-0 touch-manipulation text-xl text-primary hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

  function step(amount: number) {
    const next = Math.max(1, quantity + amount);
    if (!Number.isSafeInteger(next)) return;
    setDraft(null);
    onChange(next);
  }

  return (
    <div className="inline-flex shrink-0 items-center overflow-hidden rounded-lg border border-border bg-background">
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        aria-controls={inputId}
        disabled={quantity <= 1}
        onClick={() => step(-1)}
        className={buttonClass}
      >
        <span aria-hidden="true">−</span>
      </button>
      <input
        id={inputId}
        aria-label={label}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={text}
        onChange={(event) => {
          const next = event.target.value;
          if (!/^[0-9]*$/.test(next)) return;
          const number = Number(next);
          if (next !== "" && !Number.isSafeInteger(number)) return;
          setDraft(next);
          if (next !== "" && number >= 1) onChange(number);
        }}
        onBlur={() => {
          setDraft(null);
          onChange(quantity);
        }}
        className="h-10 w-7 sm:h-11 sm:w-12 min-w-0 border-x border-border bg-transparent px-1 text-center text-base focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"
      />
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        aria-controls={inputId}
        disabled={quantity >= Number.MAX_SAFE_INTEGER}
        onClick={() => step(1)}
        className={buttonClass}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
