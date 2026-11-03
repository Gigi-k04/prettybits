const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(__dirname, "..");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(
    this,
    request.startsWith("@/") ? path.join(root, "src", request.slice(2)) : request,
    ...args,
  );
};
for (const ext of [".ts", ".tsx"]) {
  require.extensions[ext] = (module, filename) =>
    module._compile(
      // Match Vite's environment replacement for this Node-only render harness.
      ts.transpileModule(fs.readFileSync(filename, "utf8").replaceAll("import.meta.env", "({})"), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
      filename,
    );
}
require.extensions[".jpg"] = (module) => {
  module.exports = "/placeholder.jpg";
};
require.extensions[".jpeg"] = require.extensions[".jpg"];
const { starterKits, starterKitColours } = require("../src/data/starter-kits.ts");
const {
  starterKitPricing,
  isValidColourSelection,
  buildStarterKitMessage,
  buildStarterKitRequestMessage,
  isValidKitRequest,
  starterKitRequestTotal,
} = require("../src/lib/starter-kit-request.ts");
const { waLink } = require("../src/lib/whatsapp.ts");

test("custom enquiry query selects the contact enquiry type", () => {
  const { Route } = require("../src/routes/contact.tsx");
  const query = Object.fromEntries(new URLSearchParams("enquiry=Custom+Commission"));
  assert.deepEqual(Route.options.validateSearch(query), {
    enquiry: "Custom Commission",
    product: undefined,
  });
});

test("five kit cards render with correct names and prices", () => {
  assert.equal(starterKits.length, 5);
  assert.ok(starterKits.every((kit) => Number.isFinite(kit.price) && kit.price > 0));
  const { Route } = require("../src/routes/starter-kit.tsx");
  const html = renderToStaticMarkup(React.createElement(Route.options.component));
  for (const kit of starterKits) {
    assert.ok(html.includes(`View details for ${kit.name}`));
    assert.ok(html.includes(`R${kit.price}`));
    assert.ok(kit.contents.length > 0 && kit.description && kit.image);
  }
});

test("exactly two included colours required; duplicates and unknown colours rejected", () => {
  for (const included of [
    [],
    ["Pink"],
    ["Pink", "White", "Light blue"],
    ["Pink", "Pink"],
    ["Pink", "Unknown"],
  ]) {
    assert.equal(isValidColourSelection(included, []), false);
    assert.throws(() => buildStarterKitMessage(starterKits[0], included, []));
  }
  assert.equal(isValidColourSelection(["Pink", "White"], ["Pink"]), false);
  assert.equal(isValidColourSelection(["Pink", "White"], ["Light blue", "Light blue"]), false);
  assert.equal(isValidColourSelection(["Pink", "White"], []), true);
});

test("all kits calculate R5 per extra colour and update when removed", () => {
  const extras = starterKitColours
    .map((c) => c.name)
    .filter((name) => !["Pink", "White"].includes(name));
  for (const kit of starterKits)
    for (let count = 0; count <= extras.length; count++) {
      const selected = extras.slice(0, count);
      assert.deepEqual(starterKitPricing(kit, selected), {
        additionalCost: count * 5,
        total: kit.price + count * 5,
      });
      if (count)
        assert.equal(starterKitPricing(kit, selected.slice(1)).total, kit.price + (count - 1) * 5);
    }
});

test("WhatsApp requests contain each kit and accurate encoded pricing", () => {
  for (const kit of starterKits) {
    const message = buildStarterKitMessage(kit, ["Pink", "White"], ["Purple", "Light blue"]);
    const url = new URL(waLink(message));
    assert.equal(url.pathname, "/27834411311");
    assert.equal(url.searchParams.get("text"), message);
    for (const value of [
      "Hello PrettyBits! 💕",
      kit.name,
      `*Base Price:* R${kit.price}`,
      "1. Pink\n2. White",
      "Purple, Light blue",
      "*Additional Colour Cost:* R10",
      `*Estimated Total:* R${kit.price + 10}`,
      "Please send me an invoice and payment details",
    ])
      assert.ok(message.includes(value));
    assert.ok(
      buildStarterKitMessage(kit, ["Pink", "White"], []).includes("*Additional Colours:* None"),
    );
  }
});

test("request initially blocks submission; shared modal renders only when open", () => {
  const { StarterKitRequestForm } = require("../src/components/StarterKitRequestForm.tsx");
  const { Modal } = require("../src/components/Modal.tsx");
  const form = renderToStaticMarkup(
    React.createElement(StarterKitRequestForm, { kit: starterKits[0], onBack() {} }),
  );
  assert.match(form, /type="submit" disabled=""/);
  assert.ok(form.includes(`R${starterKits[0].price}`) && form.includes("Choose two included colours"));
  assert.match(form, /autocomplete="name"/i);
  assert.ok(form.includes('type="tel"'));
  assert.equal((form.match(/<option /g) || []).length, starterKits.length + 1);
  for (const open of [false, true]) {
    const html = renderToStaticMarkup(
      React.createElement(Modal, { open, onClose() {}, title: "Kit details" }, "Kit contents"),
    );
    assert.equal(html.includes("Kit contents"), open);
  }
});

test("direct starter kit request opens without a kit or back link", () => {
  const { StarterKitRequestForm } = require("../src/components/StarterKitRequestForm.tsx");
  const form = renderToStaticMarkup(React.createElement(StarterKitRequestForm));
  assert.match(form, /value="" disabled="" selected=""/);
  assert.ok(form.includes("Choose a starter kit"));
  assert.ok(!form.includes("Back to kit details"));
  assert.ok(!form.includes("Choose two included colours"));
  assert.match(form, /type="submit" disabled=""/);
});

test("multiple kit types and quantities keep individual colours and accurate totals", () => {
  const items = [
    { kit: starterKits[0], colours: [
      { included: ["Pink", "White"], additional: ["Light blue"] },
      { included: ["Gold", "Black"], additional: ["Red", "Light green"] },
    ] },
    { kit: starterKits[1], colours: [
      { included: ["Purple", "Charcoal"], additional: [] },
    ] },
  ];
  const expected = starterKits[0].price * 2 + starterKits[1].price + 15;
  assert.equal(isValidKitRequest(items), true);
  assert.equal(starterKitRequestTotal(items), expected);
  const message = buildStarterKitRequestMessage(items, { name: " Ada ", phone: " 0123456789 ", email: "ada@example.com" });
  for (const value of ["*Quantity:* 2", "*Quantity:* 1", "Pink, White", "Gold, Black", "Purple, Charcoal", "Light blue", "Red, Light green", `*Estimated Total:* R${expected}`, "*Name:* Ada", "*Phone:* 0123456789", "*Email:* ada@example.com"])
    assert.ok(message.includes(value), value);
  assert.equal(new URL(waLink(message)).searchParams.get("text"), message);
  assert.equal(starterKitRequestTotal(items.slice(1)), starterKits[1].price);
  items[0].colours.pop();
  assert.equal(starterKitRequestTotal(items), expected - starterKits[0].price - 10);
  items[0].colours[0].included = ["Pink"];
  assert.equal(isValidKitRequest(items), false);
  assert.throws(() => buildStarterKitRequestMessage(items, { name: "Ada", phone: "0123" }));
  assert.equal(isValidKitRequest([]), false);
  assert.equal(isValidKitRequest([{ kit: starterKits[0], colours: [] }]), false);
});

test("removed routes absent; starter kit requests do not create orders or payments", () => {
  for (const route of ["book", "custom"])
    assert.equal(fs.existsSync(path.join(root, "src/routes", route + ".tsx")), false);
  const tree = fs.readFileSync(path.join(root, "src/routeTree.gen.ts"), "utf8");
  assert.doesNotMatch(tree, /['"]\/(book|custom)['"]/);
  for (const file of ["src/routes/starter-kit.tsx", "src/components/StarterKitRequestForm.tsx"])
    assert.doesNotMatch(
      fs.readFileSync(path.join(root, file), "utf8"),
      /createStarterKitOrder|firestore|checkout|setSubmitted/,
    );
  assert.ok(fs.existsSync(path.join(root, "src/components/BookingForm.tsx")));
});
