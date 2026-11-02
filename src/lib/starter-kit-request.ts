import {
  EXTRA_COLOUR_PRICE,
  INCLUDED_COLOUR_COUNT,
  starterKitColours,
  type StarterKit,
} from "../data/starter-kits";

export function isValidColourSelection(included: string[], additional: string[]) {
  const selected = [...included, ...additional];
  return (
    included.length === INCLUDED_COLOUR_COUNT &&
    new Set(selected).size === selected.length &&
    selected.every((name) => starterKitColours.some((colour) => colour.name === name))
  );
}

export function starterKitPricing(kit: StarterKit, additional: string[]) {
  const additionalCost = additional.length * EXTRA_COLOUR_PRICE;
  return { additionalCost, total: kit.price + additionalCost };
}

export interface KitRequestItem {
  kit: StarterKit;
  colours: { included: string[]; additional: string[] }[];
}

export function starterKitRequestTotal(items: KitRequestItem[]) {
  return items.reduce(
    (sum, item) =>
      sum +
      item.colours.reduce(
        (subtotal, colours) => subtotal + starterKitPricing(item.kit, colours.additional).total,
        0,
      ),
    0,
  );
}

export function isValidKitRequest(items: KitRequestItem[]) {
  return (
    items.length > 0 &&
    items.every(
      (item) =>
        item.colours.length > 0 &&
        item.colours.every((colours) =>
          isValidColourSelection(colours.included, colours.additional),
        ),
    )
  );
}

export function buildStarterKitRequestMessage(
  items: KitRequestItem[],
  contact: { name: string; phone: string; email?: string },
) {
  if (!isValidKitRequest(items)) throw new Error("Choose two included colours for every kit.");
  return [
    "Hello PrettyBits! I would like to request starter kits.",
    `*Name:* ${contact.name.trim()}\n*Phone:* ${contact.phone.trim()}${contact.email?.trim() ? `\n*Email:* ${contact.email.trim()}` : ""}`,
    ...items.map((item, index) =>
      [
        `*${index + 1}. ${item.kit.name}*\n*Quantity:* ${item.colours.length}\n*Base price per kit:* R${item.kit.price}`,
        ...item.colours.map((colours, unit) => {
          const pricing = starterKitPricing(item.kit, colours.additional);
          return `Kit ${unit + 1}:\nIncluded colours: ${colours.included.join(", ")}\nAdditional colours: ${colours.additional.join(", ") || "None"}\nAdditional colour cost: R${pricing.additionalCost}\nKit total: R${pricing.total}`;
        }),
        `*Subtotal:* R${starterKitRequestTotal([item])}`,
      ].join("\n\n"),
    ),
    `*Estimated Total:* R${starterKitRequestTotal(items)}`,
    "Please send me an invoice and payment details to complete my order. Thank you!",
  ].join("\n\n");
}

export function buildStarterKitMessage(
  kit: StarterKit,
  included: string[],
  additional: string[],
  contact?: { name: string; phone: string; email?: string },
) {
  if (!isValidColourSelection(included, additional))
    throw new Error("Please select exactly two included colours without duplicates.");
  const { additionalCost, total } = starterKitPricing(kit, additional);
  return `Hello PrettyBits! 💕

I would like to order a starter kit.
${
  contact
    ? `
*Name:* ${contact.name.trim()}
*Phone:* ${contact.phone.trim()}${contact.email?.trim() ? `\n*Email:* ${contact.email.trim()}` : ""}
`
    : ""
}

*Starter Kit:* ${kit.name}
*Base Price:* R${kit.price}

*Included Colours:*
1. ${included[0]}
2. ${included[1]}

*Additional Colours:* ${additional.join(", ") || "None"}
*Additional Colour Cost:* R${additionalCost}
*Estimated Total:* R${total}

Please send me an invoice and payment details to complete my order.

Thank you!`;
}
