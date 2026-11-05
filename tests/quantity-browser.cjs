// Run with the Vite dev server at http://127.0.0.1:5173:
// node tests/quantity-browser.cjs
// Uses installed Microsoft Edge; blocks Firestore writes and captures WhatsApp URLs.
const { spawn } = require("node:child_process");
const assert = require("node:assert/strict");
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const edge = spawn(
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    [
      "--headless=new",
      "--remote-debugging-port=9223",
      `--user-data-dir=${process.cwd()}/node_modules/.quantity-browser-profile`,
      "--no-first-run",
      "about:blank",
    ],
    { windowsHide: true, stdio: "ignore" },
  );
  let ws;
  try {
    let target;
    for (let n = 0; n < 50; n++) {
      try {
        target = (await (await fetch("http://127.0.0.1:9223/json/list")).json()).find(
          (x) => x.type === "page",
        );
        if (target) break;
      } catch {}
      await delay(200);
    }
    assert.ok(target, "Browser started");
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener("open", r, { once: true }));
    let seq = 0;
    const pending = new Map();
    ws.addEventListener("message", (e) => {
      const m = JSON.parse(e.data);
      if (m.id) {
        const p = pending.get(m.id);
        pending.delete(m.id);
        m.error ? p.reject(m.error) : p.resolve(m.result);
      }
    });
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++seq;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    const evaluate = async (expression) => {
      const r = await send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (r.exceptionDetails)
        throw Error(r.exceptionDetails.text + " " + r.exceptionDetails.exception?.description);
      return r.result.value;
    };
    await send("Network.enable");
    await send("Network.setBlockedURLs", { urls: ["*firestore.googleapis.com*"] });
    await send("Page.enable");
    async function wait(expression) {
      for (let n = 0; n < 100; n++) {
        if (await evaluate(expression)) return;
        await delay(100);
      }
      throw Error("Timeout " + expression);
    }
    const set = async (selector, value) => {
      await evaluate(
        `document.querySelector(${JSON.stringify(selector)}).focus();document.querySelector(${JSON.stringify(selector)}).select()`,
      );
      await send("Input.insertText", { text: value });
      if (value === "") {
        await send("Input.dispatchKeyEvent", {
          type: "keyDown",
          key: "Backspace",
          code: "Backspace",
          windowsVirtualKeyCode: 8,
        });
        await send("Input.dispatchKeyEvent", {
          type: "keyUp",
          key: "Backspace",
          code: "Backspace",
          windowsVirtualKeyCode: 8,
        });
      }
      await delay(30);
    };
    let touchMode = false;
    const click = async (selector) => {
      if (!touchMode)
        return evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
      const point = await evaluate(
        `(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`,
      );
      await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
      await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await delay(40);
    };
    for (const [width, height, mobile] of [
      [1280, 900, false],
      [768, 1024, false],
      [1024, 768, false],
      [1366, 768, false],
      [1440, 900, false],
      [1920, 1080, false],
      [390, 844, true],
      [375, 812, true],
      [360, 800, true],
      [320, 740, true],
    ]) {
      touchMode = mobile;
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile,
      });
      await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
      for (const kind of ["workshop", "kit"]) {
        await send("Page.navigate", {
          url: "http://127.0.0.1:5173/" + (kind === "kit" ? "starter-kit" : "workshops"),
        });
        await wait(
          `!!Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='${kind === "kit" ? "Order a starter kit" : "Book a workshop"}')`,
        );
        await evaluate(
          `Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='${kind === "kit" ? "Order a starter kit" : "Book a workshop"}').click()`,
        );
        await wait(`!!document.querySelector('[role="dialog"] input[inputmode="numeric"]')`);
        await evaluate(`window.open=(url)=>{window.testWhatsApp=url;return null;}`);
        const q = '[role="dialog"] input[inputmode="numeric"]';
        const minus = '[role="dialog"] button[aria-label^="Decrease"]';
        const plus = '[role="dialog"] button[aria-label^="Increase"]';
        assert.equal(await evaluate(`document.querySelector('${minus}').disabled`), true);
        const fittedLabels = await evaluate(`(async()=>{
          const select=document.querySelector('[role="dialog"] select[aria-label="Workshop type (required)"]') || document.querySelector('[role="dialog"] select');
          const original=select.value;
          const results=[];
          for(const option of Array.from(select.options).filter(o=>!o.disabled)){
            select.value=option.value;
            select.dispatchEvent(new Event('change',{bubbles:true}));
            await new Promise(r=>setTimeout(r,60));
            const css=getComputedStyle(select), canvas=document.createElement('canvas'), ctx=canvas.getContext('2d');
            ctx.font=css.font;
            const available=select.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
            results.push({text:option.text, fits:ctx.measureText(option.text).width<=available, optionSize:getComputedStyle(option).fontSize});
          }
          select.value=original;
          select.dispatchEvent(new Event('change',{bubbles:true}));
          return results;
        })()`);
        for (const label of fittedLabels) {
          assert.ok(label.fits, `selected label fits at ${width}px: ${label.text}`);
          assert.equal(label.optionSize, "12px", "option list keeps its normal font size");
        }
        if (kind === "kit") {
          await evaluate(
            `(()=>{const e=document.querySelector('[role="dialog"] select');e.value=e.options[1].value;e.dispatchEvent(new Event('change',{bubbles:true}));})()`,
          );
          await wait(`document.querySelectorAll('[role="dialog"] fieldset').length>0`);
          await evaluate(
            `(()=>{const boxes=document.querySelectorAll('[role="dialog"] fieldset input');boxes[0].click();})()`,
          );
          await delay(40);
          await evaluate(`document.querySelectorAll('[role="dialog"] fieldset input')[1].click()`);
        }
        await click(plus);
        await delay(50);
        assert.equal(await evaluate(`document.querySelector('${q}').value`), "2");
        await click(minus);
        await delay(50);
        assert.equal(await evaluate(`document.querySelector('${q}').value`), "1");
        if (kind === "kit")
          assert.equal(
            await evaluate(
              `document.querySelectorAll('[role="dialog"] input[type="checkbox"]:checked').length`,
            ),
            2,
          );
        await set(q, "3");
        await delay(40);
        assert.equal(await evaluate(`document.querySelector('${q}').value`), "3");
        for (const invalid of ["1.5", "-2", "1e2", "abc", "9007199254740992"]) {
          await set(q, invalid);
          assert.equal(await evaluate(`document.querySelector('${q}').value`), "3");
        }
        for (const invalid of ["", "0"]) {
          await evaluate(`document.querySelector('${q}').focus()`);
          await set(q, invalid);
          assert.equal(await evaluate(`document.querySelector('${q}').value`), invalid);
          await evaluate(`document.querySelector('${q}').blur()`);
          await delay(30);
          assert.equal(await evaluate(`document.querySelector('${q}').value`), "1");
        }
        await set(q, "2");
        await evaluate(
          `document.querySelector('${q}').focus();document.querySelector('${q}').blur()`,
        );
        await delay(40);
        assert.equal(
          await evaluate(`document.querySelector('${minus}').getBoundingClientRect().width`),
          mobile ? 28 : 44,
        );
        assert.equal(
          await evaluate(`document.querySelector('${plus}').getBoundingClientRect().height`),
          mobile ? 40 : 44,
        );
        assert.ok(
          await evaluate(`(()=>{
            const dropdown=document.querySelector('[role="dialog"] select[aria-label="Workshop type (required)"]') || document.querySelector('[role="dialog"] select');
            const input=document.querySelector('${q}');
            const remove=document.querySelector('[role="dialog"] button[aria-label^="Remove"]');
            const d=dropdown.getBoundingClientRect(), c=input.parentElement.getBoundingClientRect(), r=remove.getBoundingClientRect();
            return Math.abs(d.bottom-c.bottom)<2 && Math.abs(c.bottom-r.bottom)<2 && d.right<=c.left && c.right<=r.left && d.width>c.width;
          })()`),
          "dropdown, quantity and remove share a row without overlap; dropdown gets the most width",
        );
        assert.ok(
          await evaluate(
            `(()=>{const d=document.querySelector('[role="dialog"]>div.relative');return d.scrollWidth<=d.clientWidth;})()`,
          ),
          "no dialog overflow",
        );
        if (kind === "kit") {
          await evaluate(
            `(()=>{const sets=document.querySelectorAll('[role="dialog"] fieldset');sets[2].querySelectorAll('input')[0].click();})()`,
          );
          await delay(40);
          await evaluate(
            `document.querySelectorAll('[role="dialog"] fieldset')[2].querySelectorAll('input')[1].click()`,
          );
          await set('[role="dialog"] input[name="name"]', "Quantity test");
          await set('[role="dialog"] input[name="phone"]', "0123456789");
          await click('[role="dialog"] button[type="submit"]');
          await wait("!!window.testWhatsApp");
          const message = await evaluate('new URL(window.testWhatsApp).searchParams.get("text")');
          assert.match(message, /\*Quantity:\* 2/);
          const base = Number(message.match(/Base price per kit:\* R(\d+)/)[1]);
          assert.ok(message.includes(`*Estimated Total:* R${base * 2}`));
        } else {
          const summary = await evaluate(
            `document.querySelector('[role="dialog"] form').innerText`,
          );
          assert.ok(summary.includes("2 people") && summary.includes("R580"));
          await set('[role="dialog"] input[type="text"]', "Quantity test");
          await set('[role="dialog"] input[type="tel"]', "0123456789");
          await click('[role="dialog"] button[type="submit"]');
          await wait("!!window.testWhatsApp");
          const message = await evaluate('new URL(window.testWhatsApp).searchParams.get("text")');
          assert.ok(
            message.includes("2x Coaster & Bookmark") && message.includes("Estimated total: R580"),
          );
        }
        console.log(
          `PASS ${kind} ${width}x${height}: editing, minimum, invalid values, pricing, WhatsApp, touch size, no overflow`,
        );
      }
    }
  } finally {
    if (ws) ws.close();
    edge.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
