const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");

function load(relative, mocks = {}) {
  const filename = path.resolve(__dirname, "..", relative);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", output)(
    (name) => (Object.hasOwn(mocks, name) ? mocks[name] : require(name)),
    module,
    module.exports,
  );
  return module.exports;
}
const bookings = load("src/lib/bookings.ts", { "firebase/firestore": {}, "./firebase": {} });
const whatsapp = load("src/lib/whatsapp.ts");

function harness(save, open = () => null) {
  const states = [];
  let cursor = 0;
  const { BookingForm } = load("src/components/BookingForm.tsx", {
    react: {
      ...React,
      useState(initial) {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [
          states[index],
          (value) => {
            states[index] = typeof value === "function" ? value(states[index]) : value;
          },
        ];
      },
    },
    "../lib/bookings": { ...bookings, createBooking: save },
    "./QuantitySelector": { QuantitySelector: "quantity-selector" },
    "./ItemSelect": { ItemSelect: "select" },
    "@/lib/whatsapp": whatsapp,
  });
  global.window = { open };
  const render = () => {
    cursor = 0;
    return BookingForm({
      workshopOptions: [{ name: "Coaster & Bookmark", price: 290 }],
      availableDates: [{ date: "Saturday, 7 November", time: "11:00 AM" }],
    });
  };
  const nodes = (node) =>
    !node || typeof node !== "object"
      ? []
      : Array.isArray(node)
        ? node.flatMap(nodes)
        : [node, ...nodes(node.props?.children)];
  const find = (predicate) => nodes(render()).find(predicate);
  find((n) => n.type === "input" && n.props.type === "text").props.onChange({
    target: { value: "Zoë & Ada" },
  });
  find((n) => n.type === "input" && n.props.type === "tel").props.onChange({
    target: { value: "+27 83 123 4567" },
  });
  return { render, find, submit: () => render().props.onSubmit({ preventDefault() {} }) };
}

test("opens synchronously before a slow save; preserves fields and exposes a native retry link", async () => {
  const events = [];
  let finish;
  let url;
  const form = harness(
    () => {
      events.push("save");
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
    (href) => {
      events.push("open");
      url = href;
      return null;
    },
  );
  const pending = form.submit();
  assert.deepEqual(events, ["open", "save"]);
  assert.equal(new URL(url).hostname, "wa.me");
  assert.equal(new URL(url).pathname, "/27834411311");
  const message = new URL(url).searchParams.get("text");
  for (const text of [
    "Zoë & Ada",
    "+27 83 123 4567",
    "Saturday, 7 November, 11:00 AM",
    "1x Coaster & Bookmark (R290pp)",
    "Total party size: 1",
    "Estimated total: R290",
  ])
    assert.ok(message.includes(text), text);
  assert.equal(form.find((n) => n.type === "a").props.href, url);
  assert.equal(
    form.find((n) => n.type === "input" && n.props.type === "text").props.value,
    "Zoë & Ada",
  );
  assert.ok(form.find((n) => n.props?.role === "status"));
  await form.submit();
  assert.deepEqual(events, ["open", "save"]);
  finish("id");
  await pending;
  assert.ok(form.find((n) => n.type === "textarea" && n.props.readOnly));
});

test("popup exceptions and database failure still leave manual and copy fallbacks", async () => {
  const form = harness(
    () => Promise.reject(new Error("offline")),
    () => {
      throw new Error("blocked");
    },
  );
  const original = console.error;
  console.error = () => {};
  try {
    await form.submit();
  } finally {
    console.error = original;
  }
  assert.ok(form.find((n) => n.type === "a"));
  assert.ok(form.find((n) => n.type === "p" && String(n.props.children).includes("couldn't save")));
  assert.equal(
    form.find((n) => n.type === "button" && n.props.type === "submit").props.disabled,
    false,
  );
});

test("copy uses current edited details and supports clipboard denial with selectable text", async () => {
  const form = harness(() => Promise.resolve("id"));
  await form.submit();
  form
    .find((n) => n.type === "input" && n.props.type === "text")
    .props.onChange({ target: { value: "Edited name" } });
  let copied;
  Object.defineProperty(global, "navigator", {
    configurable: true,
    value: {
      clipboard: {
        writeText: async (text) => {
          copied = text;
        },
      },
    },
  });
  const copy = () =>
    form
      .find((n) => n.type === "button" && n.props.children === "Copy booking message")
      .props.onClick();
  await copy();
  assert.ok(copied.includes("Edited name"));
  assert.equal(
    new URL(form.find((n) => n.type === "a").props.href).searchParams.get("text"),
    copied,
  );
  global.navigator.clipboard.writeText = async () => {
    throw new Error("denied");
  };
  await copy();
  assert.ok(
    form.find((n) => n.type === "p" && String(n.props.children).includes("Copy was unavailable")),
  );
  let selected = false;
  form
    .find((n) => n.type === "textarea" && n.props.readOnly)
    .props.onFocus({
      target: {
        select() {
          selected = true;
        },
      },
    });
  assert.equal(selected, true);
});

test("invalid details never open WhatsApp or save a booking", async () => {
  const form = harness(
    () => assert.fail("saved invalid booking"),
    () => assert.fail("opened invalid booking"),
  );
  form
    .find((n) => n.type === "input" && n.props.type === "tel")
    .props.onChange({ target: { value: "" } });
  await form.submit();
  assert.equal(
    form.find((n) => n.type === "a"),
    undefined,
  );
});
