const STORAGE_KEY = "lenspedia.localLenses.v1";
const IMPORTANCE_ORDER = {
  legendary: 0,
  important: 1,
  niche: 2,
  obscure: 3,
  experimental: 4
};

const DEFAULT_TYPES = [
  "prime",
  "zoom",
  "anamorphic",
  "spherical",
  "rehoused",
  "still-lens-derived",
  "prototype",
  "vintage",
  "modern"
];
const DEFAULT_IMPORTANCE = ["legendary", "important", "niche", "obscure", "experimental"];
const DEFAULT_LINEAGES = ["original cinema lens", "rehoused", "still lens derived", "unknown"];

const starterLenses = [
  {
    id: "cooke-speed-panchro-series-i",
    name: "Cooke Speed Panchro Series I",
    manufacturer: "Cooke",
    yearIntroduced: 1920,
    yearApproximate: true,
    productionYears: "",
    country: "United Kingdom",
    factoryLocation: "",
    type: ["prime", "vintage", "spherical"],
    lineage: "original cinema lens",
    importance: "legendary",
    coverage: "",
    mounts: [],
    focalLengths: [],
    tStops: [],
    opticalFormula: "",
    elements: null,
    groups: null,
    coating: "",
    designFamily: "Speed Panchro",
    donorLens: "",
    rehousingInfo: "",
    lookSummary: "Classic vintage spherical rendering often associated with gentle contrast and human skin tone reproduction. Specific technical claims need sourcing.",
    characteristics: ["vintage", "low contrast", "Cooke", "British", "spherical"],
    strengths: [],
    weaknesses: [],
    famousUses: [],
    youtubeEmbeds: [],
    imageUrls: [],
    relatedLensIds: ["cooke-s4-i"],
    sources: [],
    confidence: "needs verification",
    notes: "Starter record only. Treat dates and variants as approximate until sourced."
  },
  {
    id: "bausch-lomb-baltar",
    name: "Bausch & Lomb Baltar",
    manufacturer: "Bausch & Lomb",
    yearIntroduced: 1930,
    yearApproximate: true,
    productionYears: "",
    country: "United States",
    factoryLocation: "",
    type: ["prime", "vintage", "spherical"],
    lineage: "original cinema lens",
    importance: "important",
    coverage: "",
    mounts: [],
    focalLengths: [],
    tStops: [],
    opticalFormula: "",
    elements: null,
    groups: null,
    coating: "",
    designFamily: "Baltar",
    donorLens: "",
    rehousingInfo: "",
    lookSummary: "Early American cinema prime family with a softer period character in many surviving examples.",
    characteristics: ["vintage", "American", "soft", "spherical"],
    strengths: [],
    weaknesses: [],
    famousUses: [],
    youtubeEmbeds: [],
    imageUrls: [],
    relatedLensIds: [],
    sources: [],
    confidence: "needs verification",
    notes: "The Baltar family spans multiple versions; split into subfamilies when verified."
  },
  {
    id: "angenieux-25-250-hr",
    name: "Angenieux 25-250mm HR",
    manufacturer: "Angenieux",
    yearIntroduced: 1960,
    yearApproximate: true,
    productionYears: "",
    country: "France",
    factoryLocation: "",
    type: ["zoom", "vintage", "spherical"],
    lineage: "original cinema lens",
    importance: "important",
    coverage: "",
    mounts: [],
    focalLengths: ["25-250mm"],
    tStops: [],
    opticalFormula: "",
    elements: null,
    groups: null,
    coating: "",
    designFamily: "Angenieux long cine zoom",
    donorLens: "",
    rehousingInfo: "",
    lookSummary: "A long-range vintage zoom reference point; exact version history and dates need confirmation.",
    characteristics: ["vintage", "zoom", "French", "spherical"],
    strengths: [],
    weaknesses: [],
    famousUses: [],
    youtubeEmbeds: [],
    imageUrls: [],
    relatedLensIds: [],
    sources: [],
    confidence: "needs verification",
    notes: "Use as a placeholder for Angenieux zoom research."
  },
  {
    id: "kowa-cine-prominar-anamorphic",
    name: "Kowa Cine Prominar Anamorphic",
    manufacturer: "Kowa",
    yearIntroduced: 1960,
    yearApproximate: true,
    productionYears: "",
    country: "Japan",
    factoryLocation: "",
    type: ["prime", "anamorphic", "vintage"],
    lineage: "original cinema lens",
    importance: "important",
    coverage: "",
    mounts: [],
    focalLengths: [],
    tStops: [],
    opticalFormula: "",
    elements: null,
    groups: null,
    coating: "",
    designFamily: "Kowa Prominar",
    donorLens: "",
    rehousingInfo: "",
    lookSummary: "Compact vintage anamorphic character with distinctive flare behavior in many sample sets.",
    characteristics: ["anamorphic", "vintage", "Japanese", "warm flares", "compact"],
    strengths: [],
    weaknesses: [],
    famousUses: [],
    youtubeEmbeds: [],
    imageUrls: [],
    relatedLensIds: ["panavision-c-series-anamorphic"],
    sources: [],
    confidence: "needs verification",
    notes: "Add verified focal lengths, squeeze ratio and mount variants later."
  },
  {
    id: "panavision-c-series-anamorphic",
    name: "Panavision C Series Anamorphic",
    manufacturer: "Panavision",
    yearIntroduced: 1968,
    yearApproximate: true,
    productionYears: "",
    country: "United States",
    factoryLocation: "",
    type: ["prime", "anamorphic", "vintage"],
    lineage: "original cinema lens",
    importance: "legendary",
    coverage: "",
    mounts: [],
    focalLengths: [],
    tStops: [],
    opticalFormula: "",
    elements: null,
    groups: null,
    coating: "",
    designFamily: "Panavision anamorphic",
    donorLens: "",
    rehousingInfo: "",
    lookSummary: "A major anamorphic cinema reference with compact vintage personality; individual focal lengths vary.",
    characteristics: ["anamorphic", "vintage", "Panavision", "warm flares", "scope"],
    strengths: [],
    weaknesses: [],
    famousUses: [],
    youtubeEmbeds: [],
    imageUrls: [],
    relatedLensIds: ["kowa-cine-prominar-anamorphic"],
    sources: [],
    confidence: "needs verification",
    notes: "Rental-only ecosystem details and serial-specific history should be sourced."
  },
  {
    id: "zeiss-high-speed-super-speed",
    name: "Zeiss High Speed / Super Speed",
    manufacturer: "Carl Zeiss",
    yearIntroduced: 1975,
    yearApproximate: true,
    productionYears: "",
    country: "Germany",
    factoryLocation: "",
    type: ["prime", "vintage", "spherical"],
    lineage: "original cinema lens",
    importance: "legendary",
    coverage: "",
    mounts: [],
    focalLengths: [],
    tStops: [],
    opticalFormula: "",
    elements: null,
    groups: null,
    coating: "",
    designFamily: "Zeiss high-speed primes",
    donorLens: "",
    rehousingInfo: "",
    lookSummary: "Fast vintage Zeiss cinema primes often valued for compact mechanics and crisp but characterful rendering.",
    characteristics: ["vintage", "German", "high contrast", "fast", "spherical"],
    strengths: [],
    weaknesses: [],
    famousUses: [],
    youtubeEmbeds: [],
    imageUrls: [],
    relatedLensIds: ["arri-zeiss-master-prime"],
    sources: [],
    confidence: "needs verification",
    notes: "Split Mk I, Mk II, Mk III and later variants when researched."
  },
  {
    id: "canon-k35",
    name: "Canon K35",
    manufacturer: "Canon",
    yearIntroduced: 1976,
    yearApproximate: true,
    productionYears: "",
    country: "Japan",
    factoryLocation: "",
    type: ["prime", "vintage", "spherical", "still-lens-derived"],
    lineage: "still lens derived",
    importance: "legendary",
    coverage: "",
    mounts: [],
    focalLengths: [],
    tStops: [],
    opticalFormula: "",
    elements: null,
    groups: null,
    coating: "",
    designFamily: "Canon K35 / FD-adjacent research",
    donorLens: "needs source",
    rehousingInfo: "",
    lookSummary: "Large-image vintage Canon character with softer contrast and warm flare associations. Donor-lens lineage needs careful sourcing.",
    characteristics: ["vintage", "Japanese", "warm", "full frame", "still-lens-derived"],
    strengths: [],
    weaknesses: [],
    famousUses: [],
    youtubeEmbeds: [],
    imageUrls: [],
    relatedLensIds: ["sigma-cine-ff-high-speed-prime"],
    sources: [],
    confidence: "needs verification",
    notes: "Keep Canon FD and K35 relationships explicit and sourced before treating as fact."
  },
  {
    id: "cooke-s4-i",
    name: "Cooke S4/i",
    manufacturer: "Cooke",
    yearIntroduced: 1998,
    yearApproximate: true,
    productionYears: "",
    country: "United Kingdom",
    factoryLocation: "",
    type: ["prime", "modern", "spherical"],
    lineage: "original cinema lens",
    importance: "legendary",
    coverage: "",
    mounts: [],
    focalLengths: [],
    tStops: [],
    opticalFormula: "",
    elements: null,
    groups: null,
    coating: "",
    designFamily: "Cooke S4",
    donorLens: "",
    rehousingInfo: "",
    lookSummary: "Modern Cooke prime family associated with smooth contrast and a warm, rounded cinema look.",
    characteristics: ["modern", "Cooke", "warm", "spherical", "clean"],
    strengths: [],
    weaknesses: [],
    famousUses: [],
    youtubeEmbeds: [],
    imageUrls: [],
    relatedLensIds: ["cooke-speed-panchro-series-i"],
    sources: [],
    confidence: "needs verification",
    notes: "Add exact launch timeline and /i metadata history later."
  },
  {
    id: "arri-zeiss-master-prime",
    name: "ARRI/Zeiss Master Prime",
    manufacturer: "ARRI/Zeiss",
    yearIntroduced: 2005,
    yearApproximate: true,
    productionYears: "",
    country: "Germany",
    factoryLocation: "",
    type: ["prime", "modern", "spherical"],
    lineage: "original cinema lens",
    importance: "legendary",
    coverage: "",
    mounts: [],
    focalLengths: [],
    tStops: [],
    opticalFormula: "",
    elements: null,
    groups: null,
    coating: "",
    designFamily: "Master Prime",
    donorLens: "",
    rehousingInfo: "",
    lookSummary: "A modern high-performance prime reference, generally associated with speed, contrast and controlled aberrations.",
    characteristics: ["modern", "German", "clean", "high contrast", "fast"],
    strengths: [],
    weaknesses: [],
    famousUses: [],
    youtubeEmbeds: [],
    imageUrls: [],
    relatedLensIds: ["zeiss-high-speed-super-speed"],
    sources: [],
    confidence: "needs verification",
    notes: "Verify exact release year and specs from manufacturer materials."
  },
  {
    id: "sigma-cine-ff-high-speed-prime",
    name: "Sigma Cine FF High Speed Prime",
    manufacturer: "Sigma",
    yearIntroduced: 2016,
    yearApproximate: true,
    productionYears: "",
    country: "Japan",
    factoryLocation: "",
    type: ["prime", "modern", "spherical", "still-lens-derived"],
    lineage: "still lens derived",
    importance: "important",
    coverage: "full frame",
    mounts: [],
    focalLengths: [],
    tStops: [],
    opticalFormula: "",
    elements: null,
    groups: null,
    coating: "",
    designFamily: "Sigma Cine FF",
    donorLens: "needs source",
    rehousingInfo: "",
    lookSummary: "Modern full-frame cine primes built around Sigma optical design language; donor and version details need source review.",
    characteristics: ["modern", "Japanese", "full frame", "clean", "still-lens-derived"],
    strengths: [],
    weaknesses: [],
    famousUses: [],
    youtubeEmbeds: [],
    imageUrls: [],
    relatedLensIds: ["canon-k35"],
    sources: [],
    confidence: "needs verification",
    notes: "Add mount availability and exact focal-length set once verified."
  }
];

const state = {
  baseLenses: [],
  localLenses: [],
  lenses: [],
  filters: {
    search: "",
    era: "all",
    manufacturer: "all",
    type: "all",
    format: "all",
    importance: "all",
    tag: "all",
    lineage: "all"
  },
  scale: 1,
  gameLens: null
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheEls();
  bindEvents();
  state.baseLenses = await loadBaseLenses();
  state.localLenses = loadLocalLenses();
  refreshData();
  renderAll();
}

function cacheEls() {
  [
    "totalLensCount",
    "eraCount",
    "legendaryCount",
    "searchInput",
    "eraFilter",
    "manufacturerFilter",
    "typeFilter",
    "formatFilter",
    "importanceFilter",
    "tagFilter",
    "lineageFilter",
    "scaleRange",
    "eraStrip",
    "timelineViewport",
    "resultSummary",
    "randomLensButton",
    "randomLensButtonSecondary",
    "gameCard",
    "openAddLens",
    "exportJson",
    "importJson",
    "clearLocalData",
    "localDataStatus",
    "detailDrawer",
    "drawerContent",
    "addLensDialog",
    "addLensForm"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    renderTimeline();
  });

  [
    ["eraFilter", "era"],
    ["manufacturerFilter", "manufacturer"],
    ["typeFilter", "type"],
    ["formatFilter", "format"],
    ["importanceFilter", "importance"],
    ["tagFilter", "tag"],
    ["lineageFilter", "lineage"]
  ].forEach(([elementId, filterKey]) => {
    els[elementId].addEventListener("change", (event) => {
      state.filters[filterKey] = event.target.value;
      renderTimeline();
    });
  });

  els.scaleRange.addEventListener("input", (event) => {
    state.scale = Number(event.target.value);
    renderTimeline();
  });

  els.randomLensButton.addEventListener("click", openRandomLens);
  els.randomLensButtonSecondary.addEventListener("click", openRandomLens);
  els.openAddLens.addEventListener("click", openAddDialog);
  els.exportJson.addEventListener("click", exportJson);
  els.importJson.addEventListener("change", importJson);
  els.clearLocalData.addEventListener("click", clearLocalData);
  els.addLensForm.addEventListener("submit", saveNewLens);

  els.detailDrawer.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-drawer]")) {
      closeDrawer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
    }
  });

  els.addLensDialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    els.addLensForm.reset();
  });

  document.querySelectorAll("[data-close-add-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      els.addLensDialog.close();
    });
  });
}

async function loadBaseLenses() {
  if (window.location.protocol === "file:") {
    return starterLenses;
  }

  try {
    const response = await fetch("data/lenses.json", { cache: "no-store" });
    if (!response.ok) return starterLenses;
    const payload = await response.json();
    return Array.isArray(payload) ? payload : payload.lenses || starterLenses;
  } catch {
    return starterLenses;
  }
}

function loadLocalLenses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalLenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.localLenses, null, 2));
}

function refreshData() {
  const byId = new Map();
  [...state.baseLenses, ...state.localLenses].forEach((lens) => {
    const normalized = normalizeLens(lens);
    byId.set(normalized.id, normalized);
  });
  state.lenses = Array.from(byId.values()).sort(sortByYearThenImportance);
}

function normalizeLens(lens) {
  const name = safeText(lens.name, "Untitled lens");
  const manufacturer = safeText(lens.manufacturer, "Unknown manufacturer");
  const id = safeText(lens.id, slugify(`${manufacturer}-${name}`));

  return {
    id,
    name,
    manufacturer,
    yearIntroduced: numberOrNull(lens.yearIntroduced),
    yearApproximate: Boolean(lens.yearApproximate),
    productionYears: safeText(lens.productionYears),
    country: safeText(lens.country),
    factoryLocation: safeText(lens.factoryLocation),
    type: asArray(lens.type),
    lineage: safeText(lens.lineage),
    importance: safeText(lens.importance, "niche").toLowerCase(),
    coverage: safeText(lens.coverage),
    mounts: asArray(lens.mounts),
    focalLengths: asArray(lens.focalLengths),
    tStops: asArray(lens.tStops),
    opticalFormula: safeText(lens.opticalFormula),
    elements: numberOrNull(lens.elements),
    groups: numberOrNull(lens.groups),
    coating: safeText(lens.coating),
    designFamily: safeText(lens.designFamily),
    donorLens: safeText(lens.donorLens),
    rehousingInfo: safeText(lens.rehousingInfo),
    lookSummary: safeText(lens.lookSummary, "No look description yet."),
    characteristics: asArray(lens.characteristics),
    strengths: asArray(lens.strengths),
    weaknesses: asArray(lens.weaknesses),
    famousUses: asArray(lens.famousUses),
    youtubeEmbeds: asArray(lens.youtubeEmbeds),
    imageUrls: asArray(lens.imageUrls),
    relatedLensIds: asArray(lens.relatedLensIds),
    sources: asArray(lens.sources),
    confidence: safeText(lens.confidence, "needs verification"),
    notes: safeText(lens.notes)
  };
}

function renderAll() {
  renderFilterOptions();
  renderStats();
  renderTimeline();
  startGame();
  renderLocalStatus();
}

function renderFilterOptions() {
  populateSelect(els.eraFilter, "All eras", getEraOptions(state.lenses));
  populateSelect(els.manufacturerFilter, "All makers", uniqueValues(state.lenses.map((lens) => lens.manufacturer)));
  populateSelect(els.typeFilter, "All types", uniqueValues([...DEFAULT_TYPES, ...state.lenses.flatMap((lens) => lens.type)]));
  populateSelect(els.formatFilter, "All formats", uniqueValues(state.lenses.map((lens) => lens.coverage).filter(Boolean)));
  populateSelect(els.importanceFilter, "All importance", uniqueValues([...DEFAULT_IMPORTANCE, ...state.lenses.map((lens) => lens.importance)]));
  populateSelect(els.tagFilter, "All look tags", uniqueValues(state.lenses.flatMap((lens) => lens.characteristics)));
  populateSelect(els.lineageFilter, "All lineage", uniqueValues([...DEFAULT_LINEAGES, ...state.lenses.map((lens) => lens.lineage).filter(Boolean)]));
}

function renderStats() {
  const eras = getEraOptions(state.lenses);
  els.totalLensCount.textContent = state.lenses.length;
  els.eraCount.textContent = eras.length;
  els.legendaryCount.textContent = state.lenses.filter((lens) => lens.importance === "legendary").length;
}

function renderTimeline() {
  const lenses = getFilteredLenses();
  renderEraStrip(lenses);

  els.resultSummary.textContent = `${lenses.length} ${lenses.length === 1 ? "record" : "records"} shown`;

  if (!lenses.length) {
    els.timelineViewport.innerHTML = '<div class="empty-state">No matching lenses yet. Loosen a filter or import more data.</div>';
    return;
  }

  if (state.scale === 0) {
    renderEraOverview(lenses);
  } else if (state.scale === 2) {
    renderCompactTimeline(lenses);
  } else {
    renderCardTimeline(lenses);
  }
}

function renderEraStrip(lenses) {
  const eras = getEraOptions(state.lenses);
  els.eraStrip.innerHTML = "";

  const allButton = createEraChip("All", state.lenses.length, state.filters.era === "all");
  allButton.addEventListener("click", () => setEraFilter("all"));
  els.eraStrip.append(allButton);

  eras.forEach((era) => {
    const count = lensesByEra(state.lenses, era).length;
    const button = createEraChip(era, count, state.filters.era === era);
    button.addEventListener("click", () => setEraFilter(era));
    els.eraStrip.append(button);
  });
}

function createEraChip(label, count, isActive) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `era-chip${isActive ? " is-active" : ""}`;
  button.innerHTML = `<strong>${escapeHtml(label)}</strong><span>${count} ${count === 1 ? "record" : "records"}</span>`;
  return button;
}

function setEraFilter(era) {
  state.filters.era = era;
  els.eraFilter.value = era;
  renderTimeline();
}

function renderEraOverview(lenses) {
  const groups = groupByDecade(lenses);
  const container = document.createElement("div");
  container.className = "era-overview";

  Object.entries(groups).forEach(([decade, group]) => {
    const panel = document.createElement("article");
    panel.className = "era-panel";
    const milestones = group
      .slice()
      .sort(sortByImportanceThenYear)
      .slice(0, 4)
      .map((lens) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.innerHTML = `<span>${escapeHtml(lens.name)}</span><small>${formatYear(lens)}</small>`;
        button.addEventListener("click", () => openLens(lens.id));
        item.append(button);
        return item;
      });

    panel.innerHTML = `
      <header>
        <h3>${escapeHtml(decade)}</h3>
        <strong>${group.length}</strong>
      </header>
    `;
    const list = document.createElement("ul");
    list.append(...milestones);
    panel.append(list);
    container.append(panel);
  });

  els.timelineViewport.replaceChildren(container);
}

function renderCardTimeline(lenses) {
  const groups = groupByDecade(lenses);
  const list = document.createElement("div");
  list.className = "timeline-list";

  Object.entries(groups).forEach(([decade, group]) => {
    const section = document.createElement("section");
    section.className = "decade-group";
    section.innerHTML = `
      <div class="decade-heading">
        <h3>${escapeHtml(decade)}</h3>
        <span>${group.length} ${group.length === 1 ? "entry" : "entries"}</span>
      </div>
    `;

    const grid = document.createElement("div");
    grid.className = "lens-grid";
    group.forEach((lens) => grid.append(createLensCard(lens)));
    section.append(grid);
    list.append(section);
  });

  els.timelineViewport.replaceChildren(list);
}

function renderCompactTimeline(lenses) {
  const list = document.createElement("div");
  list.className = "compact-list";

  lenses.forEach((lens) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "compact-row";
    row.innerHTML = `
      <span>${escapeHtml(formatYear(lens))}</span>
      <span><strong>${escapeHtml(lens.name)}</strong>${escapeHtml(lens.manufacturer)}</span>
      <span class="importance-pill ${escapeHtml(lens.importance)}">${escapeHtml(lens.importance)}</span>
    `;
    row.addEventListener("click", () => openLens(lens.id));
    list.append(row);
  });

  els.timelineViewport.replaceChildren(list);
}

function createLensCard(lens) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "lens-card";
  card.dataset.importance = lens.importance;
  card.innerHTML = `
    <div class="card-topline">
      <span class="year-pill">${escapeHtml(formatYear(lens))}</span>
      <span class="importance-pill ${escapeHtml(lens.importance)}">${escapeHtml(lens.importance)}</span>
    </div>
    <h3>${escapeHtml(lens.name)}</h3>
    <p class="manufacturer">${escapeHtml(lens.manufacturer)}</p>
    <p class="look-summary">${escapeHtml(lens.lookSummary)}</p>
    <div class="card-meta">
      ${lens.type.slice(0, 3).map((type) => `<span class="data-pill">${escapeHtml(type)}</span>`).join("")}
      ${lens.coverage ? `<span class="data-pill">${escapeHtml(lens.coverage)}</span>` : ""}
    </div>
    <div class="chip-list">
      ${lens.characteristics.slice(0, 5).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
  card.addEventListener("click", () => openLens(lens.id));
  return card;
}

function openLens(id) {
  const lens = state.lenses.find((item) => item.id === id);
  if (!lens) return;

  els.drawerContent.replaceChildren(renderLensDetails(lens));
  els.detailDrawer.classList.add("is-open");
  els.detailDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeDrawer() {
  els.detailDrawer.classList.remove("is-open");
  els.detailDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function renderLensDetails(lens) {
  const fragment = document.createDocumentFragment();
  const header = document.createElement("header");
  header.className = "drawer-title";
  header.innerHTML = `
    <p class="eyebrow">${escapeHtml(lens.manufacturer)}</p>
    <h2 id="drawerTitle">${escapeHtml(lens.name)}</h2>
    <div class="drawer-meta">
      <span class="year-pill">${escapeHtml(formatYear(lens))}</span>
      <span class="importance-pill ${escapeHtml(lens.importance)}">${escapeHtml(lens.importance)}</span>
      <span class="confidence">${escapeHtml(lens.confidence)}</span>
    </div>
    <p>${escapeHtml(lens.lookSummary)}</p>
  `;
  fragment.append(header);

  const factFields = [
    ["Year introduced", formatYear(lens)],
    ["Production years", lens.productionYears],
    ["Country", lens.country],
    ["Factory / location", lens.factoryLocation],
    ["Original use", lens.lineage],
    ["Mounts", lens.mounts],
    ["Coverage / format", lens.coverage],
    ["Focal lengths", lens.focalLengths],
    ["T-stops / f-stops", lens.tStops],
    ["Optical formula", lens.opticalFormula],
    ["Elements", lens.elements],
    ["Groups", lens.groups],
    ["Coating", lens.coating],
    ["Design family", lens.designFamily],
    ["Donor / base lens", lens.donorLens],
    ["Rehousing info", lens.rehousingInfo]
  ];
  fragment.append(createDetailSection("Technical and historical fields", createFieldGrid(factFields)));

  fragment.append(createTagSection("Type and look tags", [...lens.type, ...lens.characteristics]));
  fragment.append(createListSection("Strengths", lens.strengths));
  fragment.append(createListSection("Weaknesses", lens.weaknesses));
  fragment.append(createListSection("Famous uses", lens.famousUses));
  fragment.append(createYoutubeSection(lens.youtubeEmbeds));
  fragment.append(createRelatedSection(lens));
  fragment.append(createSourceSection(lens.sources));
  fragment.append(createListSection("Notes", lens.notes ? [lens.notes] : []));

  return fragment;
}

function createDetailSection(title, content) {
  const section = document.createElement("section");
  section.className = "detail-section";
  section.innerHTML = `<h3>${escapeHtml(title)}</h3>`;
  section.append(content);
  return section;
}

function createFieldGrid(fields) {
  const grid = document.createElement("dl");
  grid.className = "detail-grid";

  fields.forEach(([label, value]) => {
    const field = document.createElement("div");
    field.className = "detail-field";
    const displayValue = formatValue(value);
    field.innerHTML = `
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(displayValue || "unknown")}</dd>
    `;
    grid.append(field);
  });

  return grid;
}

function createTagSection(title, tags) {
  const wrapper = document.createElement("div");
  wrapper.className = "detail-tags";
  const cleanTags = uniqueValues(tags.filter(Boolean));
  wrapper.innerHTML = cleanTags.length
    ? cleanTags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")
    : '<span class="tag">none yet</span>';
  return createDetailSection(title, wrapper);
}

function createListSection(title, items) {
  const list = document.createElement("ul");
  list.className = "list-block";
  if (!items.length) {
    list.innerHTML = "<li>unknown</li>";
  } else {
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });
  }
  return createDetailSection(title, list);
}

function createYoutubeSection(urls) {
  const grid = document.createElement("div");
  grid.className = "youtube-grid";

  const embeds = urls.map(getYouTubeEmbedUrl).filter(Boolean);
  if (!embeds.length) {
    grid.innerHTML = '<div class="detail-field">No sample footage links yet.</div>';
  } else {
    embeds.forEach((url) => {
      const iframe = document.createElement("iframe");
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.src = url;
      grid.append(iframe);
    });
  }

  return createDetailSection("YouTube sample footage", grid);
}

function createRelatedSection(lens) {
  const related = lens.relatedLensIds
    .map((id) => state.lenses.find((item) => item.id === id))
    .filter(Boolean);

  const wrapper = document.createElement("div");
  wrapper.className = "related-list";

  if (!related.length) {
    wrapper.innerHTML = '<span class="tag">No related lenses linked yet.</span>';
  } else {
    related.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.name;
      button.addEventListener("click", () => openLens(item.id));
      wrapper.append(button);
    });
  }

  return createDetailSection("This lens is related to", wrapper);
}

function createSourceSection(sources) {
  const wrapper = document.createElement("div");
  wrapper.className = "source-list";

  if (!sources.length) {
    wrapper.innerHTML = '<span class="tag">needs source</span>';
  } else {
    sources.forEach((source, index) => {
      const href = typeof source === "string" ? source : source.url;
      const label = typeof source === "string" ? `Source ${index + 1}` : source.label || `Source ${index + 1}`;
      if (!href) return;
      const link = document.createElement("a");
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label;
      wrapper.append(link);
    });
  }

  return createDetailSection("Sources / references", wrapper);
}

function openRandomLens() {
  const lenses = getFilteredLenses();
  if (!lenses.length) return;
  const lens = lenses[Math.floor(Math.random() * lenses.length)];
  openLens(lens.id);
}

function startGame() {
  if (!state.lenses.length) return;
  state.gameLens = state.lenses[Math.floor(Math.random() * state.lenses.length)];
  renderGame();
}

function renderGame(resultText = "") {
  const lens = state.gameLens;
  if (!lens) return;
  const correctEra = getDecade(lens.yearIntroduced);
  const options = buildGameOptions(correctEra);

  els.gameCard.innerHTML = `
    <div class="game-prompt">
      <strong>${escapeHtml(lens.name)}</strong>
      <p>${escapeHtml(lens.manufacturer)} - ${escapeHtml(lens.lookSummary)}</p>
    </div>
    <div class="game-options">
      ${options.map((option) => `<button class="ghost-button" type="button" data-era="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}
    </div>
    <div class="game-result">${escapeHtml(resultText)}</div>
    <button class="secondary-button" type="button" data-new-game>New Challenge</button>
  `;

  els.gameCard.querySelectorAll("[data-era]").forEach((button) => {
    button.addEventListener("click", () => {
      const guess = button.dataset.era;
      const message = guess === correctEra
        ? `Correct: ${lens.name} is filed under ${correctEra}.`
        : `Filed under ${correctEra}; this record is marked ${lens.confidence}.`;
      renderGame(message);
    });
  });

  els.gameCard.querySelector("[data-new-game]").addEventListener("click", startGame);
}

function buildGameOptions(correctEra) {
  const eras = getEraOptions(state.lenses).filter((era) => era !== "Unknown");
  const shuffled = eras.filter((era) => era !== correctEra).sort(() => Math.random() - 0.5);
  return [correctEra, ...shuffled.slice(0, 3)].sort(() => Math.random() - 0.5);
}

function openAddDialog() {
  els.addLensDialog.showModal();
  document.body.classList.add("dialog-open");
  els.addLensDialog.querySelector("input[name='name']").focus();
}

function saveNewLens(event) {
  event.preventDefault();
  const formData = new FormData(els.addLensForm);
  const name = safeText(formData.get("name"), "Untitled lens");
  const manufacturer = safeText(formData.get("manufacturer"), "Unknown manufacturer");
  const yearIntroduced = numberOrNull(formData.get("yearIntroduced"));
  const newLens = normalizeLens({
    id: slugify(`${manufacturer}-${name}-${yearIntroduced || "unknown"}`),
    name,
    manufacturer,
    yearIntroduced,
    yearApproximate: true,
    productionYears: "",
    country: "",
    factoryLocation: "",
    type: splitList(formData.get("type")),
    lineage: inferLineage(splitList(formData.get("type")), splitList(formData.get("characteristics"))),
    importance: safeText(formData.get("importance"), "niche"),
    coverage: safeText(formData.get("coverage")),
    mounts: [],
    focalLengths: [],
    tStops: [],
    opticalFormula: "",
    elements: null,
    groups: null,
    coating: "",
    designFamily: "",
    donorLens: "",
    rehousingInfo: "",
    lookSummary: safeText(formData.get("lookSummary"), "No look description yet."),
    characteristics: splitList(formData.get("characteristics")),
    strengths: [],
    weaknesses: [],
    famousUses: [],
    youtubeEmbeds: splitLines(formData.get("youtubeEmbeds")),
    imageUrls: [],
    relatedLensIds: [],
    sources: splitLines(formData.get("sources")),
    confidence: "needs verification",
    notes: safeText(formData.get("notes"))
  });

  state.localLenses = upsertById(state.localLenses, newLens);
  saveLocalLenses();
  refreshData();
  renderAll();
  els.addLensForm.reset();
  els.addLensDialog.close();
  openLens(newLens.id);
}

function exportJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    note: "Exported from Cinema Lens Timeline. Verify factual fields before publishing.",
    lenses: state.lenses
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lenspedia-export.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    const incoming = Array.isArray(payload) ? payload : payload.lenses;
    if (!Array.isArray(incoming)) {
      renderLocalStatus("Import failed: expected an array or an object with a lenses array.");
      return;
    }
    const normalized = incoming.map(normalizeLens);
    state.localLenses = mergeById(state.localLenses, normalized);
    saveLocalLenses();
    refreshData();
    renderAll();
    renderLocalStatus(`Imported ${normalized.length} records into local storage.`);
  } catch {
    renderLocalStatus("Import failed: the file could not be read as JSON.");
  } finally {
    event.target.value = "";
  }
}

function clearLocalData() {
  const count = state.localLenses.length;
  state.localLenses = [];
  saveLocalLenses();
  refreshData();
  renderAll();
  renderLocalStatus(`Cleared ${count} local records.`);
}

function renderLocalStatus(message = "") {
  const count = state.localLenses.length;
  els.localDataStatus.textContent = message || `${count} local ${count === 1 ? "record" : "records"} stored in this browser.`;
}

function getFilteredLenses() {
  return state.lenses.filter((lens) => {
    const era = getDecade(lens.yearIntroduced);
    const haystack = buildSearchText(lens);
    const matchesSearch = !state.filters.search || haystack.includes(state.filters.search);
    const matchesEra = state.filters.era === "all" || era === state.filters.era;
    const matchesManufacturer = state.filters.manufacturer === "all" || lens.manufacturer === state.filters.manufacturer;
    const matchesType = state.filters.type === "all" || lens.type.includes(state.filters.type);
    const matchesFormat = state.filters.format === "all" || lens.coverage === state.filters.format;
    const matchesImportance = state.filters.importance === "all" || lens.importance === state.filters.importance;
    const matchesTag = state.filters.tag === "all" || lens.characteristics.includes(state.filters.tag);
    const matchesLineage = state.filters.lineage === "all" || lens.lineage === state.filters.lineage;

    return matchesSearch && matchesEra && matchesManufacturer && matchesType && matchesFormat && matchesImportance && matchesTag && matchesLineage;
  });
}

function buildSearchText(lens) {
  return [
    lens.name,
    lens.manufacturer,
    lens.country,
    lens.factoryLocation,
    lens.coverage,
    lens.coating,
    lens.opticalFormula,
    lens.designFamily,
    lens.donorLens,
    lens.rehousingInfo,
    lens.lookSummary,
    lens.notes,
    lens.type,
    lens.characteristics,
    lens.famousUses
  ].flat().filter(Boolean).join(" ").toLowerCase();
}

function groupByDecade(lenses) {
  return lenses.reduce((groups, lens) => {
    const decade = getDecade(lens.yearIntroduced);
    groups[decade] ||= [];
    groups[decade].push(lens);
    return groups;
  }, {});
}

function lensesByEra(lenses, era) {
  return lenses.filter((lens) => getDecade(lens.yearIntroduced) === era);
}

function getEraOptions(lenses) {
  return uniqueValues(lenses.map((lens) => getDecade(lens.yearIntroduced))).sort(sortEraLabels);
}

function getDecade(year) {
  if (!year) return "Unknown";
  return `${Math.floor(year / 10) * 10}s`;
}

function sortByYearThenImportance(a, b) {
  return (a.yearIntroduced || 9999) - (b.yearIntroduced || 9999)
    || (IMPORTANCE_ORDER[a.importance] ?? 9) - (IMPORTANCE_ORDER[b.importance] ?? 9)
    || a.name.localeCompare(b.name);
}

function sortByImportanceThenYear(a, b) {
  return (IMPORTANCE_ORDER[a.importance] ?? 9) - (IMPORTANCE_ORDER[b.importance] ?? 9)
    || (a.yearIntroduced || 9999) - (b.yearIntroduced || 9999)
    || a.name.localeCompare(b.name);
}

function sortEraLabels(a, b) {
  if (a === "Unknown") return 1;
  if (b === "Unknown") return -1;
  return Number(a.replace("s", "")) - Number(b.replace("s", ""));
}

function populateSelect(select, allLabel, values) {
  const current = select.value || "all";
  select.innerHTML = `<option value="all">${escapeHtml(allLabel)}</option>`;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
  select.value = values.includes(current) ? current : "all";
}

function formatYear(lens) {
  if (!lens.yearIntroduced) return "unknown";
  return `${lens.yearApproximate ? "c. " : ""}${lens.yearIntroduced}`;
}

function formatValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

function splitList(value) {
  return safeText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(value) {
  return safeText(value)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferLineage(types, tags) {
  const all = [...types, ...tags].map((item) => item.toLowerCase());
  if (all.some((item) => item.includes("rehoused"))) return "rehoused";
  if (all.some((item) => item.includes("still"))) return "still lens derived";
  return "unknown";
}

function asArray(value) {
  if (Array.isArray(value)) return value.map((item) => safeText(item)).filter(Boolean);
  if (typeof value === "string") return splitList(value);
  return [];
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function safeText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function uniqueValues(values) {
  return Array.from(new Set(values.map((value) => safeText(value)).filter(Boolean)));
}

function upsertById(items, item) {
  return mergeById(items.filter((current) => current.id !== item.id), [item]);
}

function mergeById(existing, incoming) {
  const byId = new Map(existing.map((item) => [item.id, item]));
  incoming.forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values()).sort(sortByYearThenImportance);
}

function getYouTubeEmbedUrl(value) {
  const text = safeText(value);
  if (!text) return "";
  if (text.includes("/embed/")) return text;

  try {
    const url = new URL(text);
    let id = "";
    if (url.hostname.includes("youtu.be")) {
      id = url.pathname.slice(1);
    } else if (url.searchParams.has("v")) {
      id = url.searchParams.get("v");
    } else if (url.pathname.includes("/shorts/")) {
      id = url.pathname.split("/shorts/")[1];
    }
    id = id.split(/[?&/]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : "";
  } catch {
    return "";
  }
}

function slugify(value) {
  return safeText(value, "lens")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return safeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
