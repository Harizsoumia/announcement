/* ══ GEAR LOGIC ══ */
const GEAR_KEY = "moulti_gear_v2";
let gearData = { bourak: [], milk: [], dates: [], tea: [], fire: [] };
const gearLimits = { bourak: 2, milk: 3, dates: 2, tea: 1, fire: 1 };

function loadGear() {
  try {
    const s = localStorage.getItem(GEAR_KEY);
    if (s) gearData = JSON.parse(s);
  } catch (e) {}
}

function saveGear() {
  try {
    localStorage.setItem(GEAR_KEY, JSON.stringify(gearData));
  } catch (e) {}
}

function renderGear() {
  Object.keys(gearLimits).forEach((key) => {
    const slots = document.getElementById("slots-" + key);
    const btn = document.getElementById("btn-" + key);
    if (!slots) return;
    const limit = gearLimits[key];
    slots.innerHTML = "";
    for (let i = 0; i < limit; i++) {
      const div = document.createElement("div");
      const entry = gearData[key][i];
      if (entry) {
        div.className = "gear-slot filled";
        let badge = "";
        if (key === "tea")
          badge = entry.skill
            ? '<span class="slot-badge yes">يلقم ✅</span>'
            : '<span class="slot-badge no">لا يلقم ❌</span>';
        div.innerHTML = `<div class="slot-num">${i + 1}</div><div class="slot-name">${entry.name}</div>${badge}`;
      } else {
        div.className = "gear-slot";
        div.innerHTML = `<div class="slot-num" style="background:#ddd;color:#999">${i + 1}</div><span class="slot-empty">مكان شاغر...</span>`;
      }
      slots.appendChild(div);
    }
    const full = gearData[key].length >= limit;
    btn.disabled = full;
    btn.textContent = full ? "✅ اكتمل" : "✋ أساهم";
  });
}

let currentGearKey = "";
let currentGearLimit = 0;
let pendingGearEntry = null;

function openGearModal(key, label, limit) {
  currentGearKey = key;
  currentGearLimit = limit;
  document.getElementById("gearModalTitle").textContent =
    "✋ المساهمة بـ " + label;
  document.getElementById("gearModalSub").textContent = "سجّل اسمك للمساهمة";
  document.getElementById("gearNameIn").value = "";
  document.getElementById("gearForm").style.display = "block";
  document.getElementById("gearConfirm").style.display = "none";
  document.getElementById("gearSuccess").style.display = "none";
  document.getElementById("teaExtraGroup").style.display =
    key === "tea" ? "block" : "none";
  document
    .querySelectorAll('input[name="teaSkill"]')
    .forEach((r) => (r.checked = false));
  document.getElementById("gearModalBg").classList.add("open");
  setTimeout(() => document.getElementById("gearNameIn").focus(), 100);
}

function closeGearModal() {
  document.getElementById("gearModalBg").classList.remove("open");
}

document.getElementById("gearModalBg").addEventListener("click", (e) => {
  if (e.target === document.getElementById("gearModalBg")) closeGearModal();
});

function submitGear() {
  const name = document.getElementById("gearNameIn").value.trim();
  const inp = document.getElementById("gearNameIn");
  if (!name) {
    inp.classList.add("err");
    inp.focus();
    setTimeout(() => inp.classList.remove("err"), 1600);
    return;
  }

  const isTea = currentGearKey === "tea";
  if (isTea) {
    const skill = document.querySelector('input[name="teaSkill"]:checked');
    if (!skill) {
      alert("الرجاء تحديد هل تقدر تلقم آتاي أم لا");
      return;
    }
    pendingGearEntry = { name, skill: skill.value === "yes" };
    const skillText =
      skill.value === "yes" ? "ويُقدر يلقم آتاي ✅" : "ولا يلقم آتاي ❌";
    document.getElementById("confirmText").textContent =
      name + " — " + skillText;
    document.getElementById("confirmSub").textContent =
      "هل أنت متأكد من تسجيل مساهمتك بالشاي؟";
  } else if (currentGearKey === "fire") {
    pendingGearEntry = { name };
    document.getElementById("confirmText").textContent =
      name + " — مشينة التسخين 🔥";
    document.getElementById("confirmSub").textContent =
      "هل أنت متأكد أنك ستحضر مشينة التسخين؟";
  } else {
    pendingGearEntry = { name };
    const gearNames = { bourak: "البوراك", milk: "الحليب", dates: "التمر" };
    document.getElementById("confirmText").textContent =
      name + " — " + (gearNames[currentGearKey] || "");
    document.getElementById("confirmSub").textContent =
      "تأكيد أنك ستحضر هذه المساهمة؟";
  }

  document.getElementById("gearForm").style.display = "none";
  document.getElementById("gearConfirm").style.display = "block";
}

function backToGearForm() {
  document.getElementById("gearConfirm").style.display = "none";
  document.getElementById("gearForm").style.display = "block";
}

function confirmGear() {
  if (!pendingGearEntry) return;
  gearData[currentGearKey].push(pendingGearEntry);
  saveGear();
  renderGear();

  document.getElementById("gearConfirm").style.display = "none";
  document.getElementById("gearSuccess").style.display = "block";
  const msg =
    currentGearKey === "tea"
      ? pendingGearEntry.skill
        ? "سيُلقم الشاي بإذن الله ☕✅"
        : "سيحضر الشاي بإذن الله ☕"
      : "تم تسجيل مساهمتك، جزاك الله خيراً 🤝";
  document.getElementById("gearSuccessMsg").textContent = msg;
  setTimeout(closeGearModal, 2400);
}

// 🗑️ مسح مساهمتي الشخصية فقط
function resetGear() {
  const userName = prompt("أدخل اسمك لمسح مساهمتك الشخصية:");

  if (!userName || userName.trim() === "") {
    return;
  }

  const name = userName.trim();
  let foundItems = [];

  Object.keys(gearData).forEach((key) => {
    const items = gearData[key];
    items.forEach((item, index) => {
      if (item.name.toLowerCase() === name.toLowerCase()) {
        foundItems.push({
          key: key,
          index: index,
          item: item,
        });
      }
    });
  });

  if (foundItems.length === 0) {
    alert(`لم يتم العثور على أي مساهمة باسم "${name}"`);
    return;
  }

  const gearNames = {
    bourak: "بوراك",
    milk: "حليب",
    dates: "تمر",
    tea: "شاي",
    fire: "نار",
  };

  let confirmMessage = `وُجدت ${foundItems.length} مساهمة باسم "${name}":\n\n`;
  foundItems.forEach((found, i) => {
    let extra = "";
    if (found.key === "tea" && found.item.skill !== undefined) {
      extra = found.item.skill ? " (يلقم)" : " (لا يلقم)";
    }
    confirmMessage += `${i + 1}. ${gearNames[found.key]}${extra}\n`;
  });
  confirmMessage += "\nهل تريد مسح جميع مساهماتك؟";

  const confirmReset = confirm(confirmMessage);

  if (!confirmReset) {
    return;
  }

  foundItems.reverse().forEach((found) => {
    gearData[found.key].splice(found.index, 1);
  });

  saveGear();
  renderGear();

  alert(`✅ تم مسح ${foundItems.length} مساهمة باسم "${name}" بنجاح!`);
}

loadGear();
renderGear();

/* ── Stars canvas ── */
const canvas = document.getElementById("starsCanvas");
const ctx = canvas.getContext("2d");
let stars = [];
let W, H;

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function initStars(n) {
  stars = [];
  for (let i = 0; i < n; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.4 + Math.random() * 1.6,
      a: 0.2 + Math.random() * 0.8,
      speed: 0.15 + Math.random() * 0.4,
      twinkle: Math.random() * Math.PI * 2,
    });
  }
}
initStars(220);

function drawStars(t) {
  ctx.clearRect(0, 0, W, H);
  stars.forEach((s) => {
    s.twinkle += 0.018;
    const alpha = s.a * (0.5 + 0.5 * Math.sin(s.twinkle));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.fill();
    s.y -= s.speed * 0.08;
    if (s.y < -2) {
      s.y = H + 2;
      s.x = Math.random() * W;
    }
  });
  requestAnimationFrame(drawStars);
}
requestAnimationFrame(drawStars);

/* ── Lights string bulbs ── */
const bulbsG = document.getElementById("bulbs");
const bColors = ["#e63946", "#2255a4", "#f1c40f", "#27ae60", "#e67e22"];
for (let i = 0; i < 14; i++) {
  const x = 50 + i * 84;
  const yBase =
    [18, 28, 16, 25, 20, 30, 17, 26, 19, 28, 16, 24, 21, 27][i] || 20;
  const c = bColors[i % bColors.length];
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.innerHTML = `
    <ellipse cx="${x}" cy="${yBase + 4}" rx="6" ry="8" fill="${c}" opacity="0.85"/>
    <rect x="${x - 2}" y="${yBase - 2}" width="4" height="4" rx="1" fill="#c9a84c"/>
    <ellipse cx="${x}" cy="${yBase + 5}" rx="3" ry="3" fill="white" opacity="0.2"/>
  `;
  g.style.animation = `lanternBob ${2 + (i % 3) * 0.5}s ease-in-out infinite alternate`;
  g.style.animationDelay = `${i * 0.18}s`;
  bulbsG.appendChild(g);
}

/* ── Background big lanterns ── */
const bgL = document.getElementById("bgLanterns");
const lanternPos = [
  { left: "5%", top: "8%", size: 80, delay: 0 },
  { left: "88%", top: "12%", size: 60, delay: 1.2 },
  { left: "3%", top: "55%", size: 50, delay: 0.7 },
  { left: "92%", top: "60%", size: 70, delay: 2 },
  { left: "48%", top: "3%", size: 45, delay: 1.5 },
];
lanternPos.forEach((p) => {
  const d = document.createElement("div");
  d.className = "bg-lantern";
  d.style.left = p.left;
  d.style.top = p.top;
  d.style.animationDelay = p.delay + "s";
  const s = p.size;
  d.innerHTML = `<svg width="${s}" height="${s * 1.6}" viewBox="0 0 60 96">
    <line x1="30" y1="0" x2="30" y2="10" stroke="#c9a84c" stroke-width="2"/>
    <polygon points="10,12 50,12 56,72 4,72" fill="#c9a84c"/>
    <polygon points="10,12 50,12 42,26 18,26" fill="#e8b020"/>
    <ellipse cx="30" cy="44" rx="12" ry="12" fill="#ffe066" opacity="0.3"/>
    <polygon points="4,72 56,72 50,84 10,84" fill="#c9a84c"/>
    <rect x="8" y="11" width="44" height="4" rx="2" fill="#a07010"/>
  </svg>`;
  bgL.appendChild(d);
});

/* ── Header floating leaves ── */
const headerLeavesWrap = document.getElementById("headerLeaves");
const hColors = [
  "#e63946",
  "#2255a4",
  "#f1c40f",
  "#27ae60",
  "#e67e22",
  "#c0392b",
];
for (let i = 0; i < 18; i++) {
  const l = document.createElement("div");
  l.className = "header-leaf";
  const sz = 8 + Math.random() * 10;
  l.style.cssText = `
    left:${5 + Math.random() * 88}%;
    top:${10 + Math.random() * 75}%;
    width:${sz}px; height:${sz * 1.3}px;
    background:${hColors[Math.floor(Math.random() * hColors.length)]};
    animation-delay:${Math.random() * 8}s;
    animation-duration:${6 + Math.random() * 6}s;
    transform: rotate(${Math.random() * 360}deg);
  `;
  headerLeavesWrap.appendChild(l);
}

/* ── Ya leaves ── */
const yaC = document.getElementById("yaLeaves");
["#e63946", "#2255a4", "#f1c40f", "#c0392b", "#27ae60"].forEach((c, i) => {
  const l = document.createElement("div");
  l.className = "ya-leaf";
  l.style.background = c;
  l.style.transform = `rotate(${-28 + i * 14}deg)`;
  yaC.appendChild(l);
});

/* ══════════════════════════════════════
   REGISTRATION LOGIC
══════════════════════════════════════ */
const STORAGE_KEY = "moulti_regs_v2";
let regs = [];

function loadRegs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) regs = JSON.parse(saved);
  } catch (e) {
    regs = [];
  }
}

function saveRegs() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(regs));
  } catch (e) {}
}

function renderList() {
  const sec = document.getElementById("regSection");
  const grid = document.getElementById("regGrid");

  if (!regs.length) {
    sec.classList.remove("show");
    return;
  }

  sec.classList.add("show");
  grid.innerHTML = "";

  regs.forEach((r, i) => {
    const d = document.createElement("div");
    d.className = "reg-row";
    d.innerHTML = `
      <div class="row-num">${i + 1}</div>
      <div class="row-name">${r.name}</div>
      <div class="row-day">${r.day}</div>
      <div class="row-att">${r.att ? "✅" : "❌"}</div>
    `;
    grid.appendChild(d);
  });
}

function removeRegistration() {
  const userName = prompt("أدخل اسمك لمسح التسجيل:");
  if (!userName || !userName.trim()) return;

  const name = userName.trim();
  const normalized = name.toLowerCase();
  const matches = regs.filter(
    (r) => r.name.trim().toLowerCase() === normalized,
  );

  if (!matches.length) {
    alert(`لم يتم العثور على أي تسجيل باسم "${name}"`);
    return;
  }

  const confirmReset = confirm(
    `وُجد ${matches.length} تسجيل${matches.length > 1 ? "ات" : ""} باسم "${name}".\nهل تريد مسح ${
      matches.length > 1 ? "جميعها" : "هذا"
    }؟`,
  );

  if (!confirmReset) return;

  regs = regs.filter((r) => r.name.trim().toLowerCase() !== normalized);
  saveRegs();
  renderList();
  alert(
    `✅ تم مسح ${matches.length} تسجيل${matches.length > 1 ? "ات" : ""} بنجاح!`,
  );
}

loadRegs();
renderList();

/* ── Modal ── */
function openModal() {
  document.getElementById("modalBg").classList.add("open");
  document.getElementById("mForm").style.display = "block";
  document.getElementById("mSuccess").style.display = "none";
  document.getElementById("nameIn").value = "";
  document
    .querySelectorAll('input[name="day"]')
    .forEach((r) => (r.checked = false));
  document
    .querySelectorAll('input[name="att"]')
    .forEach((r) => (r.checked = false));
  setTimeout(() => document.getElementById("nameIn").focus(), 100);
}

function closeModal() {
  document.getElementById("modalBg").classList.remove("open");
}

document.getElementById("modalBg").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalBg")) closeModal();
});

function submitReg() {
  const name = document.getElementById("nameIn").value.trim();
  const dayEl = document.querySelector('input[name="day"]:checked');
  const attEl = document.querySelector('input[name="att"]:checked');
  const inp = document.getElementById("nameIn");

  if (!name) {
    inp.classList.add("err");
    inp.focus();
    setTimeout(() => inp.classList.remove("err"), 1600);
    return;
  }
  if (!dayEl) {
    alert("الرجاء اختيار اليوم المناسب 📅");
    return;
  }
  if (!attEl) {
    alert("الرجاء تحديد هل ستحضر أم لا");
    return;
  }

  const att = attEl.value === "yes";
  regs.push({ name, day: dayEl.value, att });
  saveRegs();

  document.getElementById("mForm").style.display = "none";
  document.getElementById("mSuccess").style.display = "block";
  document.getElementById("sIco").textContent = att ? "🎉" : "🙏";
  document.getElementById("sTitle").textContent = att
    ? "تمّ تسجيلك بنجاح!"
    : "شكراً على الرد!";
  document.getElementById("sMsg").textContent = att
    ? `أهلاً ${name}! سنراك يوم ${dayEl.value} إن شاء الله 🌙`
    : `شكراً ${name}! نتمنى تكون معنا في المرة القادمة 🙏`;

  renderList();
  setTimeout(closeModal, 2800);
}
