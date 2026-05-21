const GITHUB_LENSES_API = "https://api.github.com/repos/tvlmedia/LensWiki/contents/data/lenses?ref=main";
const LIBRARY_LOAD_ERROR = "Could not load LensWiki library. Check the GitHub Contents API for /data/lenses/.";

const IMPORTANCE_ORDER = {
  legendary: 0,
  important: 1,
  niche: 2,
  obscure: 3,
  experimental: 4,
  "": 9
};

const KNOWN_IMPORTANCE = ["legendary", "important", "niche", "obscure", "experimental"];
const KNOWN_CONFIDENCE = ["verified", "medium", "needs verification"];
const DEFAULT_TYPES = ["prime", "zoom", "anamorphic", "spherical", "rehoused", "still-lens-derived", "prototype"];

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
  loadError: "",
  libraryStatus: {
    discoveredJsonFiles: 0,
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
  state.loadError = library.error;

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
    renderArchive();
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
      renderArchive();
    });
  });

  els.clearFilters.addEventListener("click", clearFilters);

  els.scaleToggle.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scale]");
    if (!button) return;
    state.mode = button.dataset.scale;
    renderArchive();
  });

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
    discoveredJsonFiles: 0,
    loadedFiles: 0,
    failedFiles: 0,
    importedRecords: 0
  };

  let entries = [];
  try {
    const response = await fetch(GITHUB_LENSES_API, {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json"
      }
    });
    if (!response.ok) {
      throw new Error(`GitHub Contents API returned ${response.status}`);
    }
    entries = await response.json();
  } catch (error) {
    console.warn("LensWiki: could not load GitHub directory listing for data/lenses/.", error);
    return { lenses: [], status, error: LIBRARY_LOAD_ERROR };
  }

  if (!Array.isArray(entries)) {
    console.warn("LensWiki: GitHub directory listing was not an array.", entries);
    return { lenses: [], status, error: LIBRARY_LOAD_ERROR };
  }

  const jsonEntries = entries.filter((entry) => entry.type === "file" && entry.name.toLowerCase().endsWith(".json"));
  status.discoveredJsonFiles = jsonEntries.length;

  jsonEntries.forEach(validateFileName);

  const results = await Promise.all(jsonEntries.map(loadLensFile));
  const seenIds = new Set();
  const lenses = [];

  results.forEach((result) => {
    if (result.failed) {
      status.failedFiles += 1;
      return;
    }

    status.loadedFiles += 1;
    result.lenses.forEach((lens) => {
      if (!isValidLens(lens, result.fileName)) return;
      warnIfIdDoesNotMatchFile(lens.id, result.fileName);
      const normalized = normalizeLens(lens, result.fileName);
      if (seenIds.has(normalized.id)) {
        console.warn(`LensWiki: duplicate lens id "${normalized.id}" in ${result.fileName}. Keeping the first record.`);
        return;
      }
      seenIds.add(normalized.id);
      lenses.push(normalized);
    });
  });

  lenses.sort(sortByYearThenImportance);
  status.importedRecords = lenses.length;
  return { lenses, status, error: "" };
}

async function loadLensFile(entry) {
  if (!entry.download_url) {
    console.warn(`LensWiki: ${entry.name} does not include a download_url.`);
    return { fileName: entry.name, lenses: [], failed: true };
  }

  try {
    const response = await fetch(entry.download_url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`${entry.name} returned ${response.status}`);
    }
    const payload = await response.json();
    return {
      fileName: entry.name,
      lenses: extractLensRecords(payload, entry.name),
      failed: false
    };
  } catch (error) {
    console.warn(`LensWiki: invalid JSON or failed fetch for ${entry.name}.`, error);
    return { fileName: entry.name, lenses: [], failed: true };
  }
}

function extractLensRecords(payload, fileName) {
  if (payload && Array.isArray(payload.lenses)) {
    return payload.lenses;
  }

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return [payload];
  }

  console.warn(`LensWiki: ${fileName} is not a lens object or a wrapper with a lenses array.`);
  return [];
}

function validateFileName(entry) {
  const valid = /^\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(entry.name);
  if (!valid) {
    console.warn(`LensWiki: filename "${entry.name}" should start with a 4-digit year and use lowercase hyphenated words.`);
  }
}

function isValidLens(lens, fileName) {
  if (!lens || typeof lens !== "object" || Array.isArray(lens)) {
    console.warn(`LensWiki: invalid lens record in ${fileName}.`);
    return false;
  }

  const missing = [];
  if (!safeText(lens.id)) missing.push("id");
  if (!safeText(lens.name)) missing.push("name");
  if (numberOrNull(lens.yearIntroduced) === null) missing.push("yearIntroduced");

  if (missing.length) {
    console.warn(`LensWiki: skipping ${fileName}; missing ${missing.join(", ")}.`);
    return false;
  }

  return true;
}

function warnIfIdDoesNotMatchFile(id, fileName) {
  const idSlug = slugify(id);
  const fileSlug = fileName.replace(/\.json$/i, "");
  const idWithoutYear = idSlug.replace(/^\d{4}-/, "");
  const fileWithoutYear = fileSlug.replace(/^\d{4}-/, "");
  const roughlyMatches = idSlug === fileSlug
    || idSlug === fileWithoutYear
    || idWithoutYear === fileSlug
    || idWithoutYear === fileWithoutYear
    || fileWithoutYear.includes(idWithoutYear)
    || idWithoutYear.includes(fileWithoutYear);

  if (!roughlyMatches) {
    console.warn(`LensWiki: id "${id}" does not roughly match filename "${fileName}".`);
  }
}

function normalizeLens(lens, fileName) {
  const type = asArray(lens.type);
  const timelineCategory = safeText(lens.timelineCategory);
  const cardLabel = safeText(lens.cardLabel)
    || timelineCategory
    || safeText(lens.designFamily)
    || type[0]
    || "";

  return {
    id: safeText(lens.id),
    slug: safeText(lens.slug) || slugify(lens.id),
    fileName: safeText(lens.fileName) || fileName,
    name: safeText(lens.name),
    manufacturer: safeText(lens.manufacturer),
    designer: safeText(lens.designer),
    yearIntroduced: numberOrNull(lens.yearIntroduced),
    yearApproximate: Boolean(lens.yearApproximate),
    productionYears: safeText(lens.productionYears),
    country: safeText(lens.country),
    factoryLocation: safeText(lens.factoryLocation),
    type,
    importance: normalizeImportance(lens.importance),
    timelineCategory,
    era: safeText(lens.era),
    lineage: safeText(lens.lineage),
    cardLabel,
    publicSummary: safeText(lens.publicSummary),
    coverage: safeText(lens.coverage),
    formatCoverageNotes: asArray(lens.formatCoverageNotes),
    mounts: asArray(lens.mounts),
    seriesHistory: asArray(lens.seriesHistory),
    focalLengths: asArray(lens.focalLengths),
    tStops: asArray(lens.tStops),
    closeFocus: asArray(lens.closeFocus),
    focalLengthSpecs: asArray(lens.focalLengthSpecs),
    opticalFormula: safeText(lens.opticalFormula),
    elements: numberOrNull(lens.elements),
    groups: numberOrNull(lens.groups),
    coating: safeText(lens.coating),
    designFamily: safeText(lens.designFamily),
    donorLens: safeText(lens.donorLens),
    rehousingInfo: safeText(lens.rehousingInfo),
    lookSummary: safeText(lens.lookSummary),
    characteristics: asArray(lens.characteristics),
    strengths: asArray(lens.strengths),
    weaknesses: asArray(lens.weaknesses),
    famousUses: asArray(lens.famousUses),
    youtubeEmbeds: asArray(lens.youtubeEmbeds),
    imageUrls: asArray(lens.imageUrls),
    relatedLensIds: asArray(lens.relatedLensIds),
    sources: asArray(lens.sources),
    confidence: normalizeConfidence(lens.confidence),
    libraryStatus: safeText(lens.libraryStatus),
    curationNotes: safeText(lens.curationNotes),
    notes: safeText(lens.notes),
    sourceFile: fileName,
    searchText: JSON.stringify(lens).toLowerCase()
  };
}

function renderAll() {
  renderFilterOptions();
  renderStats();
  renderLibraryStatus();
  renderArchive();
}

function renderFilterOptions() {
  populateSelect(els.eraFilter, "All eras", getEraOptions(state.lenses));
  populateSelect(els.manufacturerFilter, "All makers", uniqueValues(state.lenses.map((lens) => lens.manufacturer)));
  populateSelect(els.typeFilter, "All types", uniqueValues([...DEFAULT_TYPES, ...state.lenses.flatMap((lens) => lens.type)]));
  populateSelect(els.formatFilter, "All formats", uniqueValues(state.lenses.map((lens) => lens.coverage)));
  populateSelect(els.importanceFilter, "All importance", uniqueValues([...KNOWN_IMPORTANCE, ...state.lenses.map((lens) => lens.importance)]));
  populateSelect(els.tagFilter, "All look tags", uniqueValues(state.lenses.flatMap((lens) => lens.characteristics)));
  populateSelect(els.lineageFilter, "All lineage", uniqueValues(state.lenses.map((lens) => lens.lineage)));
}

function renderStats() {
  const eras = getEraOptions(state.lenses).filter((era) => era !== "Unknown");
  els.totalLensCount.textContent = state.lenses.length;
  els.eraCount.textContent = eras.length;
  els.legendaryCount.textContent = state.lenses.filter((lens) => lens.importance === "legendary").length;
}

function renderLibraryStatus() {
  const { loadedFiles, failedFiles, importedRecords } = state.libraryStatus;
  const fileLabel = loadedFiles === 1 ? "JSON file" : "JSON files";
  const recordLabel = importedRecords === 1 ? "lens record" : "lens records";
  const failedText = failedFiles ? ` · ${failedFiles} failed` : "";
  els.libraryStatus.textContent = `${loadedFiles} ${fileLabel} loaded · ${importedRecords} ${recordLabel} imported${failedText}`;
  els.libraryStatus.classList.toggle("has-failures", failedFiles > 0 || Boolean(state.loadError));
}

function renderArchive() {
  const lenses = getFilteredLenses();
  renderDataStatus();
  renderModeButtons();
  renderEraStrip();

  els.resultSummary.textContent = `${lenses.length} ${lenses.length === 1 ? "record" : "records"} shown`;

  if (state.loadError) {
    els.timelineViewport.innerHTML = `<div class="empty-state error-state">${escapeHtml(state.loadError)}</div>`;
    return;
  }

  if (!state.lenses.length) {
    els.timelineViewport.innerHTML = `
      <div class="empty-state empty-library">
        <h3>No lens records yet.</h3>
        <p>LensWiki is a curated JSON-based library. Add standalone lens JSON files to /data/lenses/ to build the archive.</p>
      </div>
    `;
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
    els.dataStatus.textContent = `${state.libraryStatus.failedFiles} JSON file could not be loaded or parsed. Valid records are still shown.`;
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
  els.eraStrip.innerHTML = "";
  els.eraStrip.hidden = !state.lenses.length;
  if (!state.lenses.length) return;

  const eras = getEraOptions(state.lenses);
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
  renderArchive();
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
  renderArchive();
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
  row.innerHTML = `
    <span class="archive-year">${escapeHtml(formatYear(lens))}</span>
    <span class="archive-main">
      <strong>${escapeHtml(lens.name)}</strong>
      ${getPublicSummary(lens) ? `<span class="archive-summary">${escapeHtml(getPublicSummary(lens))}</span>` : ""}
      ${formatArchiveMakerLine(lens) ? `<span class="archive-maker">${escapeHtml(formatArchiveMakerLine(lens))}</span>` : ""}
      ${lens.characteristics.length ? `<span class="archive-tags">${renderTags(lens.characteristics, 3)}</span>` : ""}
    </span>
    <span class="archive-side">
      ${lens.importance ? `<span class="importance-pill ${escapeHtml(lens.importance)}">${escapeHtml(lens.importance)}</span>` : ""}
      ${lens.confidence ? `<span class="confidence ${escapeHtml(confidenceClass(lens.confidence))}">${escapeHtml(lens.confidence)}</span>` : ""}
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
      <span>${escapeHtml(getCategory(lens))}</span>
      <span>${lens.importance ? `<span class="importance-pill ${escapeHtml(lens.importance)}">${escapeHtml(lens.importance)}</span>` : ""}</span>
      <span>${lens.confidence ? `<span class="confidence ${escapeHtml(confidenceClass(lens.confidence))}">${escapeHtml(lens.confidence)}</span>` : ""}</span>
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
  card.innerHTML = `
    <div class="card-topline">
      <span class="year-pill">${escapeHtml(formatYear(lens))}</span>
      ${lens.importance ? `<span class="importance-pill ${escapeHtml(lens.importance)}">${escapeHtml(lens.importance)}</span>` : ""}
    </div>
    <h3>${escapeHtml(lens.name)}</h3>
    ${lens.manufacturer ? `<p class="manufacturer">${escapeHtml(lens.manufacturer)}</p>` : ""}
    ${getCategory(lens) ? `<p class="card-label">${escapeHtml(getCategory(lens))}</p>` : ""}
    ${getPublicSummary(lens) ? `<p class="look-summary">${escapeHtml(getPublicSummary(lens))}</p>` : ""}
    ${lens.characteristics.length ? `<div class="chip-list">${renderTags(lens.characteristics, 3)}</div>` : ""}
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
    ${lens.manufacturer ? `<p class="eyebrow">${escapeHtml(lens.manufacturer)}</p>` : ""}
    <h2 id="drawerTitle">${escapeHtml(lens.name)}</h2>
    <div class="drawer-meta">
      <span class="year-pill">${escapeHtml(formatYear(lens))}</span>
      ${lens.importance ? `<span class="importance-pill ${escapeHtml(lens.importance)}">${escapeHtml(lens.importance)}</span>` : ""}
      ${lens.confidence ? `<span class="confidence ${escapeHtml(confidenceClass(lens.confidence))}">${escapeHtml(lens.confidence)}</span>` : ""}
    </div>
    ${getPublicSummary(lens) ? `<p>${escapeHtml(getPublicSummary(lens))}</p>` : ""}
  `;
  fragment.append(header);

  const factFields = [
    ["Source file", lens.sourceFile],
    ["Year introduced", formatYear(lens)],
    ["Production years", lens.productionYears],
    ["Designer", lens.designer],
    ["Country", lens.country],
    ["Factory / location", lens.factoryLocation],
    ["Type", lens.type],
    ["Timeline category", lens.timelineCategory],
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
    ["Library status", lens.libraryStatus],
    ["Confidence", lens.confidence]
  ];

  appendIf(fragment, createDetailSection("Record fields", createFieldGrid(factFields)));
  appendIf(fragment, createListSection("Look summary", lens.lookSummary ? [lens.lookSummary] : []));
  appendIf(fragment, createListSection("Series history", lens.seriesHistory));
  appendIf(fragment, createFocalLengthSpecsSection(lens.focalLengthSpecs));
  appendIf(fragment, createListSection("Format coverage notes", lens.formatCoverageNotes));
  appendIf(fragment, createListSection("Close focus", lens.closeFocus));
  appendIf(fragment, createListSection("Characteristics", lens.characteristics));
  appendIf(fragment, createListSection("Strengths", lens.strengths));
  appendIf(fragment, createListSection("Weaknesses", lens.weaknesses));
  appendIf(fragment, createListSection("Famous uses", lens.famousUses));
  appendIf(fragment, createYoutubeSection(lens.youtubeEmbeds));
  appendIf(fragment, createRelatedSection(lens));
  appendIf(fragment, createSourceSection(lens.sources));
  appendIf(fragment, createListSection("Curation notes", lens.curationNotes ? [lens.curationNotes] : []));
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
    li.textContent = formatListItem(item);
    list.append(li);
  });
  return createDetailSection(title, list);
}

function createFocalLengthSpecsSection(specs) {
  if (!hasValue(specs)) return null;

  const wrapper = document.createElement("div");
  wrapper.className = "spec-table-wrap";
  wrapper.innerHTML = `
    <table class="spec-table">
      <thead>
        <tr>
          <th>Focal length</th>
          <th>Series</th>
          <th>Max aperture</th>
          <th>Close focus</th>
          <th>Coverage</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const body = wrapper.querySelector("tbody");
  specs.forEach((spec) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(spec.focalLength)}</td>
      <td>${escapeHtml(spec.series)}</td>
      <td>${escapeHtml(spec.maxAperture)}</td>
      <td>${escapeHtml(spec.closeFocus)}</td>
      <td>${escapeHtml(spec.coverage)}</td>
      <td>${escapeHtml(spec.notes)}</td>
    `;
    body.append(row);
  });

  return createDetailSection("Focal length specs", wrapper);
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

function exportJson() {
  const payload = {
    schemaVersion: "1.0",
    project: "LensWiki",
    exportedAt: new Date().toISOString(),
    source: "Generated from JSON files discovered in data/lenses/ through the GitHub Contents API.",
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
    lens.id,
    lens.slug,
    lens.fileName,
    lens.name,
    lens.manufacturer,
    lens.designer,
    lens.cardLabel,
    lens.timelineCategory,
    lens.country,
    lens.factoryLocation,
    lens.coverage,
    lens.coating,
    lens.opticalFormula,
    lens.designFamily,
    lens.donorLens,
    lens.rehousingInfo,
    lens.publicSummary,
    lens.lookSummary,
    lens.notes,
    lens.curationNotes,
    lens.sourceFile,
    lens.type,
    lens.seriesHistory,
    lens.formatCoverageNotes,
    lens.closeFocus,
    lens.focalLengthSpecs,
    lens.characteristics,
    lens.strengths,
    lens.weaknesses,
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

function getPublicSummary(lens) {
  return lens.publicSummary || lens.cardLabel || lens.lookSummary || "";
}

function getCategory(lens) {
  return lens.timelineCategory || lens.cardLabel || lens.designFamily || lens.type[0] || "";
}

function formatArchiveMakerLine(lens) {
  return [lens.manufacturer, getCategory(lens)].filter(Boolean).join(" / ");
}

function formatYear(lens) {
  if (!lens.yearIntroduced) return "";
  return `${lens.yearApproximate ? "c. " : ""}${lens.yearIntroduced}`;
}

function formatValue(value) {
  if (Array.isArray(value)) return value.map(formatListItem).join(", ");
  if (value && typeof value === "object") return formatListItem(value);
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

function formatListItem(item) {
  if (!item || typeof item !== "object") return safeText(item);

  const preferredKeys = [
    "title",
    "series",
    "focalLength",
    "year",
    "role",
    "maxAperture",
    "closeFocus",
    "coverage",
    "confidence",
    "notes"
  ];

  return preferredKeys
    .filter((key) => hasValue(item[key]))
    .map((key) => `${labelFromKey(key)}: ${formatValue(item[key])}`)
    .join(" · ");
}

function labelFromKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
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
  if (Array.isArray(value)) return value.map((item) => normalizeArrayItem(item)).filter(Boolean);
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeArrayItem(item) {
  if (item && typeof item === "object") return item;
  return safeText(item);
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeImportance(value) {
  const importance = safeText(value).toLowerCase();
  return KNOWN_IMPORTANCE.includes(importance) ? importance : "";
}

function normalizeConfidence(value) {
  const confidence = safeText(value, "needs verification").toLowerCase();
  return KNOWN_CONFIDENCE.includes(confidence) ? confidence : "needs verification";
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

function slugify(value) {
  return safeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
