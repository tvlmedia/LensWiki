const INDEX_URL = "data/lens-index.json";
const LIBRARY_LOAD_ERROR = "Could not load LensWiki library. Check /data/lens-index.json.";

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

const state = {
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
  mode: "timeline",
  gameLens: null,
  loadError: "",
  libraryStatus: {
    listedFiles: 0,
    loadedFiles: 0,
    failedFiles: 0,
    importedRecords: 0
  }
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    console.error(error);
    state.loadError = LIBRARY_LOAD_ERROR;
    renderAll();
  });
});

async function init() {
  cacheEls();
  bindEvents();

  const library = await loadLensLibrary();
  state.lenses = library.lenses;
  state.libraryStatus = library.status;
  if (!state.lenses.length) {
    state.loadError = LIBRARY_LOAD_ERROR;
  }

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
    "clearFilters",
    "scaleToggle",
    "eraStrip",
    "timelineViewport",
    "resultSummary",
    "dataStatus",
    "libraryStatus",
    "randomLensButtonSecondary",
    "gameCard",
    "exportJson",
    "detailDrawer",
    "drawerContent"
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

  els.clearFilters.addEventListener("click", clearFilters);

  els.scaleToggle.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scale]");
    if (!button) return;
    state.mode = button.dataset.scale;
    renderTimeline();
  });

  els.randomLensButtonSecondary.addEventListener("click", openRandomLens);
  els.exportJson.addEventListener("click", exportJson);

  els.detailDrawer.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-drawer]")) {
      closeDrawer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
    }
  });
}

async function loadLensLibrary() {
  const status = {
    listedFiles: 0,
    loadedFiles: 0,
    failedFiles: 0,
    importedRecords: 0
  };

  let indexPayload;
  let indexUrl;
  try {
    indexUrl = new URL(INDEX_URL, window.location.href);
    const response = await fetch(indexUrl.href, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`${INDEX_URL} returned ${response.status}`);
    }
    indexPayload = await response.json();
  } catch (error) {
    console.warn("LensWiki: could not load data/lens-index.json", error);
    return { lenses: [], status };
  }

  const files = Array.isArray(indexPayload.files) ? indexPayload.files : [];
  if (!files.length) {
    console.warn("LensWiki: data/lens-index.json does not contain a non-empty files array.");
  }
  status.listedFiles = files.length;

  const results = await Promise.all(files.map((file) => loadLensFile(file, indexUrl)));
  const seenIds = new Set();
  const lenses = [];

  results.forEach((result) => {
    if (result.failed) {
      status.failedFiles += 1;
      return;
    }

    status.loadedFiles += 1;
    result.lenses.forEach((lens) => {
      if (!isValidLens(lens, result.file)) return;
      const normalized = normalizeLens(lens, result.file);
      if (seenIds.has(normalized.id)) {
        console.warn(`LensWiki: duplicate lens id "${normalized.id}" in ${result.file}. Keeping the first record.`);
        return;
      }
      seenIds.add(normalized.id);
      lenses.push(normalized);
    });
  });

  lenses.sort(sortByYearThenImportance);
  status.importedRecords = lenses.length;
  return { lenses, status };
}

async function loadLensFile(file, indexUrl) {
  const url = new URL(file, indexUrl);

  try {
    const response = await fetch(url.href, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`${file} returned ${response.status}`);
    }
    const payload = await response.json();
    return { file, lenses: extractLensRecords(payload, file), failed: false };
  } catch (error) {
    console.warn(`LensWiki: could not load or parse ${file}`, error);
    return { file, lenses: [], failed: true };
  }
}

function extractLensRecords(payload, file) {
  if (payload && Array.isArray(payload.lenses)) {
    return payload.lenses;
  }

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return [payload];
  }

  console.warn(`LensWiki: ${file} is not a lens object or a wrapper with a lenses array.`);
  return [];
}

function isValidLens(lens, file) {
  if (!lens || typeof lens !== "object" || Array.isArray(lens)) {
    console.warn(`LensWiki: invalid lens record in ${file}.`);
    return false;
  }

  const missing = [];
  if (!safeText(lens.id)) missing.push("id");
  if (!safeText(lens.name)) missing.push("name");
  if (numberOrNull(lens.yearIntroduced) === null) missing.push("yearIntroduced");

  if (missing.length) {
    console.warn(`LensWiki: skipping record in ${file}; missing ${missing.join(", ")}.`);
    return false;
  }

  return true;
}

function normalizeLens(lens, sourceFile) {
  const type = asArray(lens.type);
  const characteristics = asArray(lens.characteristics);
  const cardLabel = safeText(lens.cardLabel)
    || safeText(lens.designFamily)
    || type[0]
    || safeText(lens.lineage)
    || "lens record";

  return {
    id: safeText(lens.id),
    name: safeText(lens.name),
    manufacturer: safeText(lens.manufacturer, "Unknown manufacturer"),
    yearIntroduced: numberOrNull(lens.yearIntroduced),
    yearApproximate: Boolean(lens.yearApproximate),
    productionYears: safeText(lens.productionYears),
    country: safeText(lens.country),
    factoryLocation: safeText(lens.factoryLocation),
    type,
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
    publicSummary: safeText(lens.publicSummary),
    lookSummary: safeText(lens.lookSummary, "No look description yet."),
    cardLabel,
    characteristics,
    strengths: asArray(lens.strengths),
    weaknesses: asArray(lens.weaknesses),
    famousUses: asArray(lens.famousUses),
    youtubeEmbeds: asArray(lens.youtubeEmbeds),
    imageUrls: asArray(lens.imageUrls),
    relatedLensIds: asArray(lens.relatedLensIds),
    sources: asArray(lens.sources),
    confidence: normalizeConfidence(lens.confidence),
    notes: safeText(lens.notes),
    sourceFile,
    searchText: JSON.stringify(lens).toLowerCase()
  };
}

function renderAll() {
  renderFilterOptions();
  renderStats();
  renderLibraryStatus();
  renderTimeline();
  startGame();
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
  const eras = getEraOptions(state.lenses).filter((era) => era !== "Unknown");
  els.totalLensCount.textContent = state.lenses.length;
  els.eraCount.textContent = eras.length;
  els.legendaryCount.textContent = state.lenses.filter((lens) => lens.importance === "legendary").length;
}

function renderLibraryStatus() {
  const { listedFiles, loadedFiles, failedFiles, importedRecords } = state.libraryStatus;
  els.libraryStatus.textContent = `${importedRecords} ${importedRecords === 1 ? "record" : "records"} loaded from curated JSON files · ${loadedFiles}/${listedFiles} JSON files · ${failedFiles} failed`;
  els.libraryStatus.classList.toggle("has-failures", failedFiles > 0 || Boolean(state.loadError));
}

function renderTimeline() {
  const lenses = getFilteredLenses();
  renderDataStatus();
  renderModeButtons();
  renderEraStrip();

  els.resultSummary.textContent = `${lenses.length} ${lenses.length === 1 ? "record" : "records"} shown`;

  if (!state.lenses.length && state.loadError) {
    els.timelineViewport.innerHTML = `<div class="empty-state error-state">${escapeHtml(state.loadError)}</div>`;
    return;
  }

  if (!lenses.length) {
    els.timelineViewport.innerHTML = '<div class="empty-state">No lenses found. Clear filters or check the JSON library.</div>';
    return;
  }

  if (state.mode === "timeline") {
    renderArchiveTimeline(lenses);
  } else if (state.mode === "dense") {
    renderDenseTimeline(lenses);
  } else {
    renderCardTimeline(lenses);
  }
}

function renderDataStatus() {
  if (state.loadError) {
    els.dataStatus.hidden = false;
    els.dataStatus.textContent = state.loadError;
  } else if (state.libraryStatus.failedFiles > 0) {
    els.dataStatus.hidden = false;
    els.dataStatus.textContent = `${state.libraryStatus.failedFiles} JSON file could not be loaded. Valid records are still shown.`;
  } else {
    els.dataStatus.hidden = true;
    els.dataStatus.textContent = "";
  }
}

function renderModeButtons() {
  els.scaleToggle.querySelectorAll("[data-scale]").forEach((button) => {
    const active = button.dataset.scale === state.mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderEraStrip() {
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
  button.innerHTML = `<strong>${escapeHtml(label)}</strong><span>${count}</span>`;
  return button;
}

function setEraFilter(era) {
  state.filters.era = era;
  els.eraFilter.value = era;
  renderTimeline();
}

function clearFilters() {
  Object.keys(state.filters).forEach((key) => {
    state.filters[key] = key === "search" ? "" : "all";
  });

  els.searchInput.value = "";
  [
    els.eraFilter,
    els.manufacturerFilter,
    els.typeFilter,
    els.formatFilter,
    els.importanceFilter,
    els.tagFilter,
    els.lineageFilter
  ].forEach((select) => {
    select.value = "all";
  });
  renderTimeline();
}

function renderArchiveTimeline(lenses) {
  const groups = groupByDecade(lenses);
  const container = document.createElement("div");
  container.className = "archive-timeline";

  Object.entries(groups).forEach(([decade, group]) => {
    const section = document.createElement("section");
    section.className = "archive-decade";
    section.innerHTML = `
      <div class="archive-decade-heading">
        <h3>${escapeHtml(decade)}</h3>
        <span>${group.length} ${group.length === 1 ? "entry" : "entries"}</span>
      </div>
    `;

    const rows = document.createElement("div");
    rows.className = "archive-rows";
    group.forEach((lens) => rows.append(createArchiveRow(lens)));
    section.append(rows);
    container.append(section);
  });

  els.timelineViewport.replaceChildren(container);
}

function createArchiveRow(lens) {
  const row = document.createElement("button");
  row.type = "button";
  row.className = "archive-row";
  row.dataset.importance = lens.importance;
  row.innerHTML = `
    <span class="archive-year">${escapeHtml(formatYear(lens))}</span>
    <span class="archive-main">
      <strong>${escapeHtml(lens.name)}</strong>
      <span class="archive-summary">${escapeHtml(getPublicSummary(lens))}</span>
      <span class="archive-maker">${escapeHtml(formatArchiveMakerLine(lens))}</span>
      <span class="archive-tags">${renderTags(lens.characteristics, 3)}</span>
    </span>
    <span class="archive-side">
      <span class="importance-pill ${escapeHtml(lens.importance)}">${escapeHtml(lens.importance)}</span>
      <span class="confidence ${escapeHtml(confidenceClass(lens.confidence))}">${escapeHtml(lens.confidence)}</span>
    </span>
  `;
  row.addEventListener("click", () => openLens(lens.id));
  return row;
}

function renderCardTimeline(lenses) {
  const grid = document.createElement("div");
  grid.className = "lens-grid";
  lenses.forEach((lens) => grid.append(createLensCard(lens)));
  els.timelineViewport.replaceChildren(grid);
}

function renderDenseTimeline(lenses) {
  const list = document.createElement("div");
  list.className = "dense-table";
  list.innerHTML = `
    <div class="dense-row dense-head" aria-hidden="true">
      <span>Year</span>
      <span>Name</span>
      <span>Manufacturer</span>
      <span>Category</span>
      <span>Importance</span>
      <span>Confidence</span>
    </div>
  `;

  lenses.forEach((lens) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "dense-row";
    row.innerHTML = `
      <span>${escapeHtml(formatYear(lens))}</span>
      <span><strong>${escapeHtml(lens.name)}</strong></span>
      <span>${escapeHtml(lens.manufacturer)}</span>
      <span>${escapeHtml(lens.cardLabel)}</span>
      <span class="importance-pill ${escapeHtml(lens.importance)}">${escapeHtml(lens.importance)}</span>
      <span class="confidence ${escapeHtml(confidenceClass(lens.confidence))}">${escapeHtml(lens.confidence)}</span>
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
    <p class="card-label">${escapeHtml(lens.cardLabel)}</p>
    <p class="look-summary">${escapeHtml(getPublicSummary(lens))}</p>
    <div class="chip-list">${renderTags(lens.characteristics, 3)}</div>
  `;
  card.addEventListener("click", () => openLens(lens.id));
  return card;
}

function renderTags(tags, limit = 3) {
  const visibleTags = tags.slice(0, limit);
  const remaining = tags.length - visibleTags.length;
  const chips = visibleTags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`);
  if (remaining > 0) {
    chips.push(`<span class="tag tag-more">+${remaining}</span>`);
  }
  return chips.join("");
}

function getPublicSummary(lens) {
  return safeText(lens.publicSummary)
    || safeText(lens.lookSummary)
    || safeText(lens.cardLabel)
    || safeText(lens.designFamily)
    || lens.type[0]
    || "Lens archive record";
}

function formatArchiveMakerLine(lens) {
  return [lens.manufacturer, lens.cardLabel].filter(Boolean).join(" / ");
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
      <span class="confidence ${escapeHtml(confidenceClass(lens.confidence))}">${escapeHtml(lens.confidence)}</span>
    </div>
    <p>${escapeHtml(lens.lookSummary)}</p>
  `;
  fragment.append(header);

  const factFields = [
    ["Source file", lens.sourceFile],
    ["Year introduced", formatYear(lens)],
    ["Production years", lens.productionYears],
    ["Country", lens.country],
    ["Factory / location", lens.factoryLocation],
    ["Type", lens.type],
    ["Lineage", lens.lineage],
    ["Coverage", lens.coverage],
    ["Mounts", lens.mounts],
    ["Focal lengths", lens.focalLengths],
    ["T-stops / f-stops", lens.tStops],
    ["Optical formula", lens.opticalFormula],
    ["Elements / groups", formatElementsGroups(lens)],
    ["Coating", lens.coating],
    ["Design family", lens.designFamily],
    ["Donor lens", lens.donorLens],
    ["Rehousing info", lens.rehousingInfo],
    ["Confidence level", lens.confidence]
  ];
  appendIf(fragment, createDetailSection("Technical and historical fields", createFieldGrid(factFields)));
  appendIf(fragment, createListSection("Characteristics", lens.characteristics));
  appendIf(fragment, createListSection("Strengths", lens.strengths));
  appendIf(fragment, createListSection("Weaknesses", lens.weaknesses));
  appendIf(fragment, createListSection("Famous uses", lens.famousUses));
  appendIf(fragment, createYoutubeSection(lens.youtubeEmbeds));
  appendIf(fragment, createRelatedSection(lens));
  appendIf(fragment, createSourceSection(lens.sources));
  appendIf(fragment, createListSection("Notes", lens.notes ? [lens.notes] : []));

  return fragment;
}

function appendIf(fragment, node) {
  if (node) fragment.append(node);
}

function createDetailSection(title, content) {
  if (!content) return null;
  const section = document.createElement("section");
  section.className = "detail-section";
  section.innerHTML = `<h3>${escapeHtml(title)}</h3>`;
  section.append(content);
  return section;
}

function createFieldGrid(fields) {
  const visibleFields = fields.filter(([, value]) => hasValue(value));
  if (!visibleFields.length) return null;

  const grid = document.createElement("dl");
  grid.className = "detail-grid";

  visibleFields.forEach(([label, value]) => {
    const field = document.createElement("div");
    field.className = "detail-field";
    field.innerHTML = `
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(formatValue(value))}</dd>
    `;
    grid.append(field);
  });

  return grid;
}

function createListSection(title, items) {
  if (!hasValue(items)) return null;
  const list = document.createElement("ul");
  list.className = "list-block";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  });
  return createDetailSection(title, list);
}

function createYoutubeSection(urls) {
  const embeds = urls.map(getYouTubeEmbedUrl).filter(Boolean);
  if (!embeds.length) return null;

  const grid = document.createElement("div");
  grid.className = "youtube-grid";
  embeds.forEach((url) => {
    const iframe = document.createElement("iframe");
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.src = url;
    grid.append(iframe);
  });

  return createDetailSection("YouTube sample footage", grid);
}

function createRelatedSection(lens) {
  if (!hasValue(lens.relatedLensIds)) return null;
  const wrapper = document.createElement("div");
  wrapper.className = "related-list";

  lens.relatedLensIds.forEach((id) => {
    const related = state.lenses.find((item) => item.id === id);
    if (related) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = related.name;
      button.addEventListener("click", () => openLens(related.id));
      wrapper.append(button);
    } else {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = id;
      wrapper.append(chip);
    }
  });

  return createDetailSection("Related lenses", wrapper);
}

function createSourceSection(sources) {
  if (!hasValue(sources)) return null;
  const wrapper = document.createElement("div");
  wrapper.className = "source-list";

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

  return wrapper.children.length ? createDetailSection("Sources", wrapper) : null;
}

function openRandomLens() {
  const filtered = getFilteredLenses();
  const lenses = filtered.length ? filtered : state.lenses;
  if (!lenses.length) return;
  const lens = lenses[Math.floor(Math.random() * lenses.length)];
  openLens(lens.id);
}

function startGame() {
  if (!state.lenses.length) {
    els.gameCard.innerHTML = '<div class="game-prompt">Load lens records to start the era challenge.</div>';
    return;
  }
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
  const pool = uniqueValues([correctEra, ...eras]).filter(Boolean);
  const shuffled = pool.filter((era) => era !== correctEra).sort(() => Math.random() - 0.5);
  return [correctEra, ...shuffled.slice(0, 3)].sort(() => Math.random() - 0.5);
}

function exportJson() {
  const payload = {
    schemaVersion: "1.0",
    project: "Cinema Lens Timeline / Lenspedia",
    exportedAt: new Date().toISOString(),
    source: "Generated from data/lens-index.json and standalone JSON files.",
    lenses: state.lenses.map(toExportLens)
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lenswiki-library-export.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toExportLens(lens) {
  const { searchText, ...exportable } = lens;
  return exportable;
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
    lens.searchText,
    lens.name,
    lens.manufacturer,
    lens.cardLabel,
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
    lens.sourceFile,
    lens.type,
    lens.characteristics,
    lens.famousUses,
    lens.sources
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

function formatElementsGroups(lens) {
  const elements = lens.elements ? `${lens.elements} elements` : "";
  const groups = lens.groups ? `${lens.groups} groups` : "";
  return [elements, groups].filter(Boolean).join(" / ");
}

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && value !== "";
}

function asArray(value) {
  if (Array.isArray(value)) return value.map((item) => safeText(item)).filter(Boolean);
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeConfidence(value) {
  const confidence = safeText(value, "needs verification").toLowerCase();
  if (confidence === "verified" || confidence === "medium") return confidence;
  return "needs verification";
}

function confidenceClass(confidence) {
  return confidence.replace(/\s+/g, "-");
}

function safeText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function uniqueValues(values) {
  return Array.from(new Set(values.map((value) => safeText(value)).filter(Boolean)));
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

function escapeHtml(value) {
  return safeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
