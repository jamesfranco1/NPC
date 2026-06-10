/* =========================================================
   NPC — script. Vanilla JS, no dependencies.
   ========================================================= */

(() => {
  "use strict";

  /* ---------- Copy contract address ---------- */
  const caValue = document.getElementById("caValue");
  const caCopy = document.getElementById("caCopy");
  if (caCopy && caValue) {
    caCopy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(caValue.textContent.trim());
        caCopy.textContent = "copied";
        caCopy.classList.add("copied");
        setTimeout(() => { caCopy.textContent = "copy"; caCopy.classList.remove("copied"); }, 1400);
      } catch {}
    });
  }

  /* ---------- Bounty recommendations ---------- */
  const STORE_KEY = "npc:bounty-submissions";
  const form = document.getElementById("bountyForm");
  const textEl = document.getElementById("bountyText");
  const charCount = document.getElementById("charCount");
  const walletEl = document.getElementById("walletInput");
  const submitBtn = document.getElementById("submitBtn");
  const formMsg = document.getElementById("formMsg");
  const mine = document.getElementById("mine");
  const mineList = document.getElementById("mineList");

  if (!form) return;

  const localDay = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const isWallet = (a) => /^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})$/.test(a);

  const loadAll = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch { return []; }
  };
  const saveAll = (list) => localStorage.setItem(STORE_KEY, JSON.stringify(list));

  const setMsg = (text, kind) => {
    formMsg.textContent = text;
    formMsg.classList.remove("is-error", "is-ok");
    if (kind) formMsg.classList.add(kind === "error" ? "is-error" : "is-ok");
  };

  const refreshSubmitState = () => {
    submitBtn.disabled = !(textEl.value.trim() && walletEl.value.trim());
  };

  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  const renderMine = () => {
    const w = walletEl.value.trim();
    if (!w) { mine.hidden = true; return; }
    const items = loadAll().filter((s) => s.wallet === w).sort((a, b) => b.ts - a.ts);
    if (!items.length) { mine.hidden = true; return; }
    mine.hidden = false;
    mineList.innerHTML = items.map((s) => `
      <li class="mine__item">
        <p>${escapeHtml(s.text)}</p>
        <span class="mine__date">${new Date(s.ts).toLocaleDateString()}</span>
      </li>`).join("");
  };

  textEl.addEventListener("input", () => {
    charCount.textContent = textEl.value.length;
    refreshSubmitState();
  });
  walletEl.addEventListener("input", () => { refreshSubmitState(); renderMine(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = textEl.value.trim();
    const wallet = walletEl.value.trim();
    if (!text) { setMsg("write your bounty idea first.", "error"); return; }
    if (!isWallet(wallet)) { setMsg("that doesn't look like a wallet address.", "error"); return; }

    const all = loadAll();
    if (all.some((s) => s.wallet === wallet && s.day === localDay())) {
      setMsg("this wallet already recommended a bounty today. try again tomorrow.", "error");
      return;
    }

    all.push({ wallet, text, day: localDay(), ts: Date.now() });
    saveAll(all);

    textEl.value = "";
    charCount.textContent = "0";
    refreshSubmitState();
    renderMine();
    setMsg("submitted. if it's selected, you receive 10% of the bounty payout.", "ok");
  });

  refreshSubmitState();
})();
