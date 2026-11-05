import { useState, type FormEvent } from "react";
import { MessageCircle, Plus, Trash2, ChevronDown } from "lucide-react";
import {
  EXTRA_COLOUR_PRICE,
  INCLUDED_COLOUR_COUNT,
  starterKitColours,
  starterKits,
  type StarterKit,
} from "@/data/starter-kits";
import {
  buildStarterKitRequestMessage,
  isValidKitRequest,
  starterKitRequestTotal,
  starterKitPricing,
  type KitRequestItem,
} from "@/lib/starter-kit-request";
import { QuantitySelector } from "./QuantitySelector";
import { ItemSelect } from "./ItemSelect";
import { waLink } from "@/lib/whatsapp";
import { useEffect, useRef } from "react";

export function StarterKitRequestForm({ kit, onBack }: { kit?: StarterKit; onBack?: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<
    (Omit<KitRequestItem, "kit"> & { id: number; kit: StarterKit | null })[]
  >([{ id: 0, kit: kit ?? null, colours: [{ included: [], additional: [] }] }]);
  const [nextId, setNextId] = useState(1);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    formRef.current?.parentElement?.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  const scrollToAddedItem = useRef(false);
  useEffect(() => {
    if (!scrollToAddedItem.current) return;
    scrollToAddedItem.current = false;
    lastItemRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  }, [items]);
  const selectedItems: KitRequestItem[] = items.flatMap((item) =>
    item.kit ? [{ kit: item.kit, colours: item.colours }] : [],
  );
  const valid = selectedItems.length === items.length && isValidKitRequest(selectedItems);
  const contactValid = Boolean(name.trim() && phone.trim());
  const total = starterKitRequestTotal(selectedItems);
  const updateItem = (id: number, patch: Partial<Omit<KitRequestItem, "kit"> & { kit: StarterKit | null }>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || !contactValid) return;
    window.open(
      waLink(buildStarterKitRequestMessage(selectedItems, { name, phone, email })),
      "_blank",
      "noopener,noreferrer",
    );
  }
  return (
    <form ref={formRef} onSubmit={submit} className="space-y-6">
      {onBack && (
        <button type="button" onClick={onBack} className="text-sm text-primary hover:underline">
          Back to kit details
        </button>
      )}
      <div className="space-y-4">
        <label className="block text-sm font-medium">
          Name (required)
          <input
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Phone (required)
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Email (optional)
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Your starter kits</h3>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          onClick={() => {
            scrollToAddedItem.current = true;
            setItems((current) => [
              ...current,
              { id: nextId, kit: null, colours: [{ included: [], additional: [] }] },
            ]);
            setNextId((current) => current + 1);
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Add item
        </button>
      </div>
      {items.map((item, itemIndex) => (
        <div
          key={item.id}
          ref={itemIndex === items.length - 1 ? lastItemRef : undefined}
          className="scroll-mt-4 rounded-xl border border-border p-3 sm:p-4 space-y-5"
        >
          <div className="flex items-end gap-1 sm:gap-1.5">
            <label className="flex-1 min-w-0 text-sm font-medium">
              Starter kit {itemIndex + 1} (required)
              <div className="relative mt-1">
                <ItemSelect
                  required
                  value={item.kit?.id ?? ""}
                  onChange={(event) =>
                    updateItem(item.id, {
                      kit: starterKits.find((option) => option.id === event.target.value) ?? null,
                    })
                  }
                  className="h-10 sm:h-11 w-full appearance-none rounded-lg border border-border pl-1 pr-5 py-2 text-xs"
                >
                  <option value="" disabled>
                    Choose a starter kit
                  </option>
                  {starterKits.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} (R{option.price})
                    </option>
                  ))}
                </ItemSelect>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
              </div>
            </label>
            <div className="shrink-0 space-y-1">
              <span className="block text-sm font-medium">Qty</span>
              <QuantitySelector
                label={`Starter kit ${itemIndex + 1} quantity`}
                value={item.colours.length}
                onChange={(quantity) => {
                  if (quantity === item.colours.length) return;
                  updateItem(item.id, {
                    colours: Array.from(
                      { length: quantity },
                      (_, index) => item.colours[index] ?? { included: [], additional: [] },
                    ),
                  });
                }}
              />
            </div>
            <button
              type="button"
              disabled={items.length === 1}
              aria-label={`Remove starter kit ${itemIndex + 1}`}
              onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))}
              className="flex h-10 w-6 sm:h-11 sm:w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {item.colours.map((colours, unitIndex) => {
            if (!item.kit) return null;
            const { included, additional } = colours;
            const { additionalCost, total: unitTotal } = starterKitPricing(item.kit, additional);
            return (
              <div key={unitIndex} className="space-y-4 border-t border-border pt-4">
                <h4 className="font-medium text-sm">
                  {item.kit.name}
                </h4>
                {(["included", "additional"] as const).map((group) => {
                  const isIncluded = group === "included";
                  const selected = isIncluded ? included : additional;
                  const other = isIncluded ? additional : included;
                  const setSelected = (change: (current: string[]) => string[]) =>
                    updateItem(item.id, {
                      colours: item.colours.map((unit, index) =>
                        index === unitIndex ? { ...unit, [group]: change(unit[group]) } : unit,
                      ),
                    });
                  const colourOptions = (
                    <fieldset>
                      <legend
                        className={isIncluded ? "font-display text-lg font-semibold" : "sr-only"}
                      >
                        {isIncluded
                          ? "Choose two included colours"
                          : `Additional colours — R${EXTRA_COLOUR_PRICE} each`}
                      </legend>
                      <p className="mt-1 mb-3 text-sm text-muted-foreground">
                        {isIncluded
                          ? `Select exactly ${INCLUDED_COLOUR_COUNT} colours (${included.length}/${INCLUDED_COLOUR_COUNT} selected).`
                          : "Optional. Select or remove any extra colours below."}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {starterKitColours.map((colour) => (
                          <label
                            key={colour.name}
                            className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm has-disabled:opacity-50 has-checked:border-primary has-checked:bg-secondary/40"
                          >
                            <input
                              type="checkbox"
                              checked={selected.includes(colour.name)}
                              disabled={
                                other.includes(colour.name) ||
                                (isIncluded &&
                                  !selected.includes(colour.name) &&
                                  included.length >= INCLUDED_COLOUR_COUNT)
                              }
                              onChange={() =>
                                setSelected((current) =>
                                  current.includes(colour.name)
                                    ? current.filter((name) => name !== colour.name)
                                    : [...current, colour.name],
                                )
                              }
                              className="accent-primary"
                            />
                            <span
                              className="h-4 w-4 shrink-0 rounded-full border border-border"
                              style={{ backgroundColor: colour.hex }}
                            />
                            {colour.name}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  );
                  return isIncluded ? (
                    <div key={group}>{colourOptions}</div>
                  ) : (
                    <details key={group} className="group/colours rounded-lg border border-border">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">
                        <span>
                          Additional colours — R{EXTRA_COLOUR_PRICE} each
                          <span className="mt-1 block text-xs font-normal text-muted-foreground">
                            {additional.length
                              ? `${additional.join(", ")} · R${additionalCost}`
                              : "Optional · None selected"}
                          </span>
                        </span>
                        <ChevronDown
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 transition-transform group-open/colours:rotate-180"
                        />
                      </summary>
                      <div className="border-t border-border p-3">{colourOptions}</div>
                    </details>
                  );
                })}
                <p className="text-sm text-muted-foreground">
                  Extra colours: R{additionalCost} · Kit total: R{unitTotal}
                </p>
              </div>
            );
          })}
          {item.kit && (
            <p className="text-sm font-semibold">
              Subtotal: R{starterKitRequestTotal([{ kit: item.kit, colours: item.colours }])}
            </p>
          )}
        </div>
      ))}
      <div
        className="rounded-xl bg-secondary/40 p-4 space-y-3 text-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="flex justify-between gap-3 border-t border-border pt-3 font-semibold text-base">
          <span>Estimated Total</span>
          <span>R{total}</span>
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Send your request through WhatsApp. PrettyBits will send an invoice and payment details to
        complete your order.
      </p>
      {!valid && (
        <p className="text-sm text-muted-foreground">
          Please choose a starter kit and select two included colours for every kit to continue.
        </p>
      )}
      {!contactValid && (
        <p className="text-sm text-muted-foreground">Please enter your name and phone number to continue.</p>
      )}
      <button
        type="submit"
        disabled={!valid || !contactValid}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-teal text-primary-foreground px-6 py-3.5 text-sm font-medium shadow-soft hover:shadow-elevated transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MessageCircle className="h-4 w-4" />
        Send WhatsApp Request
      </button>
    </form>
  );
}
