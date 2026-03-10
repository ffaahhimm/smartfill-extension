const FIELDS = [
  "uid", "branch", "section", "semester", "year", "college",
  "firstName", "lastName", "fullName", "gender", "dob",
  "email", "phone", "whatsapp", "city", "state", "address", "pincode",
  "linkedin", "github", "portfolio"
];
const TOTAL = FIELDS.length;

// ── Tab switching ──
document.querySelectorAll(".nav-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("panel-" + tab.dataset.nav).classList.add("active");
  });
});

// ── Completion bar ──
function updateCompletion(data) {
  const count = FIELDS.filter(k => data[k] && String(data[k]).trim() !== "").length;
  const pct   = Math.round((count / TOTAL) * 100);
  const bar   = document.getElementById("comp-bar");
  const num   = document.getElementById("comp-count");
  if (bar) bar.style.width = pct + "%";
  if (num) num.textContent = count;
}

// ── Load profile ──
function loadProfile() {
  const keys = [...FIELDS, "opt-highlight", "opt-skip", "opt-dropdowns", "lastFillTime", "lastFillCount"];
  chrome.storage.sync.get(keys, (data) => {
    FIELDS.forEach(k => {
      const el = document.getElementById(k);
      if (el && data[k]) el.value = data[k];
    });
    ["opt-highlight", "opt-skip", "opt-dropdowns"].forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id] !== undefined) el.checked = data[id];
    });
    updateCompletion(data);
    renderSummary(data);
    renderLastFill(data.lastFillTime, data.lastFillCount);
  });
}

// ── Last fill notice ──
function renderLastFill(ts, count) {
  const bar = document.getElementById("last-bar");
  const txt = document.getElementById("last-text");
  if (!ts || !bar) return;
  const diff = Math.round((Date.now() - ts) / 1000);
  const t = diff < 60 ? "just now"
    : diff < 3600  ? `${Math.round(diff/60)} min ago`
    : diff < 86400 ? `${Math.round(diff/3600)} hr ago`
    : `${Math.round(diff/86400)} day ago`;
  txt.textContent = `Last filled ${t} — ${count ?? "?"} field${count !== 1 ? "s" : ""} filled`;
  bar.classList.add("on");
}

// ── Summary rows + copy on click ──
function renderSummary(data) {
  const area = document.getElementById("summary-area");
  const btn  = document.getElementById("btn-fill");
  const computedFull = data.fullName || [data.firstName, data.lastName].filter(Boolean).join(" ");
  const hasData = FIELDS.some(k => data[k]);

  if (!hasData) {
    area.innerHTML = `
      <div class="no-data">
        <div class="no-icon">📋</div>
        <strong>No profile saved yet</strong>
        <p>Go to <b>Profile</b> tab, fill your details, click Save — then come back here to fill any form instantly.</p>
      </div>`;
    btn.disabled = true;
    return;
  }

  btn.disabled = false;

  const rows = [
    { key: "Name",      val: computedFull   },
    { key: "UID",       val: data.uid       },
    { key: "Email",     val: data.email     },
    { key: "Phone",     val: data.phone     },
    { key: "Branch",    val: data.branch    },
    { key: "Semester",  val: data.semester  },
    { key: "College",   val: data.college   },
    { key: "City",      val: data.city      },
  ].filter(r => r.val);

  area.innerHTML = `
    <div class="content-card" style="margin-bottom:12px">
      <div class="card-header">Your Saved Details — click any row to copy</div>
      <div class="sum-rows">
        ${rows.map(r => `
          <div class="sum-row" data-copy="${r.val}">
            <div class="sum-key">${r.key}</div>
            <div class="sum-val">${r.val}</div>
            <div class="sum-copy">COPY</div>
          </div>`).join("")}
      </div>
    </div>`;

  area.querySelectorAll(".sum-row").forEach(row => {
    row.addEventListener("click", () => {
      navigator.clipboard.writeText(row.dataset.copy)
        .then(() => showToast("📋 Copied!", "blue"))
        .catch(() => showToast("❌ Copy failed"));
    });
  });
}

// ── Save ──
document.getElementById("btn-save").addEventListener("click", () => {
  const data = {};
  FIELDS.forEach(k => {
    const v = document.getElementById(k)?.value?.trim();
    if (v) data[k] = v;
  });
  // Auto-compute fullName if not manually set
  if (!data.fullName && (data.firstName || data.lastName)) {
    data.fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
  }
  ["opt-highlight", "opt-skip", "opt-dropdowns"].forEach(id => {
    data[id] = document.getElementById(id)?.checked ?? true;
  });
  chrome.storage.sync.set(data, () => {
    updateCompletion(data);
    renderSummary(data);
    showToast("✅ Profile saved!", "green");
  });
});

// ── Settings live save ──
["opt-highlight", "opt-skip", "opt-dropdowns"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", e => {
    chrome.storage.sync.set({ [id]: e.target.checked });
  });
});

// ── Clear ──
document.getElementById("btn-clear").addEventListener("click", () => {
  if (!confirm("Clear all saved profile data?")) return;
  chrome.storage.sync.clear(() => {
    FIELDS.forEach(k => { const el = document.getElementById(k); if (el) el.value = ""; });
    updateCompletion({});
    renderSummary({});
    document.getElementById("last-bar")?.classList.remove("on");
    showToast("🗑 Profile cleared");
  });
});

// ── Export ──
document.getElementById("btn-export").addEventListener("click", () => {
  chrome.storage.sync.get(FIELDS, (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: "smartfill-profile.json" });
    a.click();
    URL.revokeObjectURL(url);
    showToast("⬇ Exported!", "purple");
  });
});

// ── Import ──
document.getElementById("btn-import-trigger").addEventListener("click", () => {
  document.getElementById("import-file").click();
});
document.getElementById("import-file").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const raw = JSON.parse(ev.target.result);
      const clean = {};
      FIELDS.forEach(k => { if (raw[k]) clean[k] = raw[k]; });
      chrome.storage.sync.set(clean, () => {
        FIELDS.forEach(k => { const el = document.getElementById(k); if (el && clean[k]) el.value = clean[k]; });
        updateCompletion(clean);
        renderSummary(clean);
        showToast("⬆ Imported!", "green");
      });
    } catch { showToast("❌ Invalid file"); }
  };
  r.readAsText(file);
  e.target.value = "";
});

// ── Fill Form ──
document.getElementById("btn-fill").addEventListener("click", () => {
  const keys = [...FIELDS, "opt-highlight", "opt-skip", "opt-dropdowns"];
  chrome.storage.sync.get(keys, (data) => {
    // Compute fullName if not set
    if (!data.fullName) {
      data.fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: autoFillForm,
        args: [data]
      }, (results) => {
        const count = results?.[0]?.result ?? 0;
        const now   = Date.now();
        chrome.storage.sync.set({ lastFillTime: now, lastFillCount: count });
        renderLastFill(now, count);
        showToast(
          count > 0 ? `⚡ ${count} field${count !== 1 ? "s" : ""} filled!` : "⚠ No fields matched",
          count > 0 ? "green" : ""
        );
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════
//  AUTO-FILL — injected into the actual webpage
//  Works on: Google Forms, company sites, job portals, college portals
// ═══════════════════════════════════════════════════════════════
function autoFillForm(profile) {
  const doHighlight   = profile["opt-highlight"]  !== false;
  const skipFilled    = profile["opt-skip"]        !== false;
  const fillDropdowns = profile["opt-dropdowns"]   !== false;

  // ── Master keyword map — very broad to catch all site variations ──
  const matchers = [
    // ── Academic ──
    {
      keys: ["enrollment", "enroll", "roll no", "rollno", "roll number", "student id",
             "studentid", "reg no", "regno", "registration no", "application no", "uid",
             "admission no", "prn", "htno", "hall ticket"],
      val: profile.uid
    },
    {
      keys: ["branch", "dept", "department", "stream", "programme", "program",
             "course", "discipline", "specialization", "major"],
      val: profile.branch
    },
    {
      keys: ["section", "division", "group"],
      val: profile.section
    },
    {
      keys: ["semester", "sem", "term"],
      val: profile.semester
    },
    {
      keys: ["year of study", "current year", "study year", "academic year", "year of passing",
             "passout year", "pass out year", "graduation year", "expected graduation"],
      val: profile.year
    },
    {
      keys: ["college", "university", "institution", "institute", "school", "organization",
             "organisation", "academy", "campus", "alma mater"],
      val: profile.college
    },

    // ── Name variants ──
    {
      keys: ["first name", "firstname", "fname", "given name", "forename", "first_name"],
      val: profile.firstName
    },
    {
      keys: ["last name", "lastname", "lname", "surname", "family name", "last_name"],
      val: profile.lastName
    },
    {
      keys: ["full name", "fullname", "complete name", "your name", "candidate name",
             "student name", "applicant name", "participant name", "name of student",
             "name of applicant", "legal name", "display name"],
      val: profile.fullName
    },

    // ── Personal ──
    {
      keys: ["gender", "sex", "male/female"],
      val: profile.gender
    },
    {
      keys: ["date of birth", "dob", "birth date", "birthdate", "d.o.b", "birthday",
             "date of birth (dd/mm/yyyy)", "born on"],
      val: profile.dob
    },

    // ── Contact ──
    {
      keys: ["email", "e-mail", "mail", "email id", "emailid", "email address",
             "email-id", "e mail", "work email", "personal email", "official email",
             "your email", "enter email"],
      val: profile.email
    },
    {
      keys: ["whatsapp", "whatsapp number", "whatsapp no"],
      val: profile.whatsapp || profile.phone
    },
    {
      keys: ["phone", "mobile", "contact", "telephone", "cell", "ph no", "phno",
             "mobile no", "mobile number", "phone number", "contact number",
             "phone no", "tel", "contact no", "phone/mobile", "mobile/phone",
             "alternate number", "secondary number"],
      val: profile.phone
    },
    {
      keys: ["city", "town", "location", "district", "current city", "hometown"],
      val: profile.city
    },
    {
      keys: ["state", "province", "region"],
      val: profile.state
    },
    {
      keys: ["address", "full address", "permanent address", "current address",
             "residential address", "street address", "home address", "postal address"],
      val: profile.address
    },
    {
      keys: ["pincode", "pin code", "zip", "zip code", "postal code", "post code"],
      val: profile.pincode
    },

    // ── Online ──
    {
      keys: ["linkedin", "linkedin url", "linkedin profile", "linkedin link"],
      val: profile.linkedin
    },
    {
      keys: ["github", "github url", "github profile", "github link"],
      val: profile.github
    },
    {
      keys: ["portfolio", "website", "personal website", "personal site", "blog",
             "portfolio url", "website url", "web link", "profile link"],
      val: profile.portfolio
    },
  ];

  // Standalone name — only match when label is exactly/mostly just "name"
  const nameStandalone = [" name ", " name*", "your name", "full name"];

  let filled = 0;

  // ── Highlight filled field ──
  function highlight(el) {
    if (!doHighlight) return;
    el.style.outline = "2px solid #7b4ecc";
    el.style.outlineOffset = "2px";
    el.style.transition = "outline 0.2s";
    setTimeout(() => { el.style.outline = ""; el.style.outlineOffset = ""; }, 3000);
  }

  // ── Fill any text input / textarea ──
  function fillInput(el, value) {
    if (!value) return false;
    if (skipFilled && el.value?.trim()) return false;

    el.focus();
    // React / Angular / Vue native setter trick
    const proto  = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(el, value);
    else el.value = value;

    // Fire all events frameworks listen to
    ["input", "change", "blur"].forEach(evt =>
      el.dispatchEvent(new Event(evt, { bubbles: true }))
    );
    ["keydown", "keyup"].forEach(evt =>
      el.dispatchEvent(new KeyboardEvent(evt, { bubbles: true }))
    );
    el.blur();
    highlight(el);
    return true;
  }

  // ── Fill <select> dropdown (if enabled) ──
  function fillSelect(el, value) {
    if (!fillDropdowns || !value) return false;
    if (skipFilled && el.value) return false;
    const lower = value.toLowerCase();
    let best = null;
    for (const opt of el.options) {
      const t = opt.text.toLowerCase();
      const v = opt.value.toLowerCase();
      if (t === lower || v === lower) { best = opt; break; }
      if (t.includes(lower) || lower.includes(t)) best = best ?? opt;
    }
    if (!best) return false;
    el.value = best.value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    highlight(el);
    return true;
  }

  // ── Get all label text for an input from every possible source ──
  function getLabelText(input) {
    const parts = [];

    // Direct attributes
    ["aria-label", "placeholder", "title", "name", "id"].forEach(attr => {
      const v = input.getAttribute(attr);
      if (v) parts.push(v);
    });

    // aria-labelledby
    const lbId = input.getAttribute("aria-labelledby");
    if (lbId) lbId.split(" ").forEach(id => {
      const e = document.getElementById(id);
      if (e) parts.push(e.innerText || e.textContent);
    });

    // <label for="">
    if (input.id) {
      const lb = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
      if (lb) parts.push(lb.innerText);
    }

    // Wrapping <label>
    const wrapLabel = input.closest("label");
    if (wrapLabel) parts.push(wrapLabel.innerText);

    // Google Forms — question container with heading
    const gfSelectors = [
      "[data-params]",
      ".freebirdFormviewerViewItemsItemItem",
      ".freebirdFormviewerComponentsQuestionBaseRoot",
      ".freebirdFormviewerViewItemsTextShortTextItem",
    ];
    for (const sel of gfSelectors) {
      const c = input.closest(sel);
      if (c) {
        const h = c.querySelector(
          "[role='heading'], .freebirdFormviewerViewItemsItemItemTitle, " +
          ".freebirdFormviewerComponentsQuestionBaseTitle, .exportLabel"
        );
        if (h) { parts.push(h.innerText); break; }
      }
    }

    // Walk up DOM 6 levels — catches most company/college portals
    let el = input.parentElement;
    for (let i = 0; i < 6 && el; i++) {
      // Get first text node content (label-like text before input)
      for (const node of el.childNodes) {
        if (node.nodeType === 3) { // text node
          const t = node.textContent.trim();
          if (t.length > 1 && t.length < 100) parts.push(t);
        }
      }
      const firstEl = el.querySelector("label, legend, h3, h4, h5, span, p, div");
      if (firstEl && firstEl !== input) {
        const t = firstEl.innerText?.split("\n")[0]?.trim();
        if (t && t.length > 1 && t.length < 100) parts.push(t);
      }
      el = el.parentElement;
    }

    // Add surrounding text from sibling elements
    const prev = input.previousElementSibling;
    if (prev) parts.push(prev.innerText?.trim() || "");

    return " " + parts.join(" ").toLowerCase().replace(/[*:]/g, " ") + " ";
  }

  function matches(label, keyList) {
    return keyList.some(k => {
      const kl = k.toLowerCase();
      return label.includes(kl);
    });
  }

  // ── Process every input, textarea, and select on the page ──
  const allEls = document.querySelectorAll(
    "input:not([type=submit]):not([type=button]):not([type=hidden])" +
    ":not([type=checkbox]):not([type=radio]):not([type=file]):not([type=image]), " +
    "textarea, select"
  );

  allEls.forEach(el => {
    if (el.disabled || el.readOnly) return;
    const label = getLabelText(el);
    if (!label || label.trim().length < 2) return;

    for (const { keys, val } of matchers) {
      if (!val) continue;
      if (matches(label, keys)) {
        const ok = el.tagName === "SELECT" ? fillSelect(el, val) : fillInput(el, val);
        if (ok) { filled++; return; }
      }
    }

    // Standalone name fallback — only if label is primarily just "name"
    if (profile.fullName && nameStandalone.some(k => label.includes(k))) {
      const ok = el.tagName === "SELECT" ? fillSelect(el, profile.fullName) : fillInput(el, profile.fullName);
      if (ok) filled++;
    }
  });

  return filled;
}

// ── Toast ──
function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast" + (type ? " " + type : "");
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

loadProfile();
