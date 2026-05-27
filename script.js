const GITHUB_LENSES_API = "https://api.github.com/repos/tvlmedia/LensWiki/contents/data/lenses?ref=main";
const LIBRARY_LOAD_ERROR = "Could not load LensWiki records. Try refreshing the page.";

const IMPORTANCE_ORDER = {
  legendary: 0,
  important: 1,
  niche: 2,
  obscure: 3,
  experimental: 4,
  "": 9
};

const KNOWN_IMPORTANCE = ["legendary", "important", "niche", "obscure", "experimental"];
const KNOWN_CONFIDENCE = ["verified", "high", "medium-high", "medium", "needs verification"];
const TYPE_FILTERS = [
  { value: "prime", label: "Prime", terms: ["prime"] },
  { value: "zoom", label: "Zoom", terms: ["zoom"] },
  { value: "anamorphic", label: "Anamorphic", terms: ["anamorphic"] },
  { value: "spherical", label: "Spherical", terms: ["spherical"] },
  { value: "rehoused", label: "Rehoused", terms: ["rehoused", "rehousing", "rehoused cine", "rehoused-cine"] },
  { value: "vintage", label: "Vintage", terms: ["vintage"] },
  { value: "modern", label: "Modern", terms: ["modern"] },
  { value: "still-lens-derived", label: "Still-lens-derived", terms: ["stills-derived", "still-derived", "still lens derived", "still-lens-derived", "stills derived"] },
  { value: "prototype", label: "Prototype", terms: ["prototype"] },
  { value: "specialty", label: "Specialty", terms: ["specialty", "special", "character-lens", "character lens"] }
];
const FORMAT_FILTERS = [
  { value: "16mm-super-16", label: "16mm / Super 16", terms: ["16mm", "super 16", "s16"] },
  { value: "super-35", label: "Super 35", terms: ["super35", "super 35", "s35", "35mm motion-picture", "35mm motion picture"] },
  { value: "full-frame", label: "Full Frame", terms: ["full frame", "full-frame", "ff", "stills-derived", "still lens derived"] },
  { value: "65mm-large-format", label: "65mm / Large Format", terms: ["65mm", "large format", "large-format", "lf", "alexa 65", "vistavision"] }
];
const NORMALIZED_ARRAY_FIELDS = new Set([
  "mounts",
  "focalLengths",
  "tStops",
  "formatCoverageNotes",
  "characteristics",
  "type",
  "strengths",
  "weaknesses",
  "closeFocus",
  "sampleFootage",
  "youtubeEmbeds",
  "sources",
  "famousUses",
  "focalLengthSpecs"
]);
const FOCAL_LENGTH_SPECS_FIELDS = [
  "focalLengthSpecs",
  "focalLengthData",
  "focalLengthsData",
  "focalLengthTable"
];
const VIDEO_SAMPLE_FIELDS = [
  "sampleFootage",
  "sampleVideos",
  "youtubeEmbeds",
  "videos",
  "media",
  "links",
  "youtubeSamples",
  "videoSamples",
  "videoLinks",
  "sampleFootageLinks",
  "footageSamples"
];
const COMMA_ARRAY_FIELDS = new Set(["mounts", "focalLengths", "tStops", "type"]);
const LINE_ARRAY_FIELDS = new Set(["strengths", "weaknesses", "characteristics", "closeFocus", "formatCoverageNotes"]);
const REHOUSING_FIELD_KEYS = new Set([
  "donorLens",
  "rehousingInfo",
  "originalMount",
  "donorMount",
  "rehousingCompany",
  "rehousingGeneration",
  "rehousingNotes",
  "donorProductionYearsByLens"
]);
const ADMIN_EDIT_FIELDS = [
  { key: "manufacturer", label: "Maker / brand", type: "text" },
  { key: "name", label: "Lens name", type: "text" },
  { key: "yearIntroduced", label: "Year introduced", type: "number" },
  { key: "yearApproximate", label: "Approximate year", type: "checkbox" },
  { key: "isRehoused", label: "Rehoused lens", type: "toggle" },
  { key: "status", label: "Publication status", type: "text" },
  { key: "importance", label: "Importance", type: "text" },
  { key: "confidence", label: "Confidence", type: "text" },
  { key: "timelineCategory", label: "Timeline category", type: "text" },
  { key: "cardLabel", label: "Short archive label", type: "text" },
  { key: "publicSummary", label: "Overview text", type: "textarea" },
  { key: "lookSummary", label: "Look text", type: "textarea" },
  { key: "cineflaresAvailable", label: "CineFlares available?", type: "toggle" },
  { key: "cineflaresUrl", label: "CineFlares URL", type: "text" },
  { key: "productionYears", label: "Production years", type: "text" },
  { key: "country", label: "Country", type: "text" },
  { key: "factoryLocation", label: "Factory / location", type: "text" },
  { key: "type", label: "Type", type: "list" },
  { key: "characteristics", label: "Tags / character", type: "lines" },
  { key: "coverage", label: "Coverage", type: "text" },
  { key: "formatCoverageNotes", label: "Format coverage notes", type: "lines" },
  { key: "mounts", label: "Mounts", type: "list" },
  { key: "focalLengths", label: "Focal lengths", type: "list" },
  { key: "tStops", label: "T-stops / F-stops", type: "list" },
  { key: "closeFocus", label: "Close focus", type: "lines" },
  { key: "strengths", label: "Strengths", type: "lines" },
  { key: "weaknesses", label: "Weaknesses", type: "lines" },
  { key: "seriesHistory", label: "History / series history", type: "lines" },
  { key: "rehousingInfo", label: "Rehousing info", type: "textarea" },
  { key: "donorLens", label: "Donor lens", type: "text" },
  { key: "originalMount", label: "Original mount", type: "text" },
  { key: "donorMount", label: "Donor mount", type: "text" },
  { key: "rehousingCompany", label: "Rehousing company", type: "text" },
  { key: "rehousingGeneration", label: "Rehousing generation", type: "text" },
  { key: "rehousingNotes", label: "Rehousing notes", type: "textarea" },
  { key: "donorProductionYearsByLens", label: "Donor glass production years", type: "object" },
  { key: "famousUses", label: "Known use", type: "structured" },
  { key: "sampleFootage", label: "Sample footage", type: "structured" },
  { key: "youtubeEmbeds", label: "YouTube sample links", type: "lines" },
  { key: "relatedLensIds", label: "Related lens IDs", type: "list" },
  { key: "sources", label: "Sources", type: "structured" },
  { key: "notes", label: "Notes", type: "textarea" },
  { key: "curationNotes", label: "Confidence notes", type: "textarea" },
  { key: "focalLengthSpecs", label: "Focal length specs", type: "structured" }
];

const state = {
  lenses: [],
  filters: {
    search: "",
    era: "all",
    manufacturer: "all",
    type: [],
    format: [],
    importance: "all",
    tag: "all",
    lineage: "all",
    rehousedOnly: false
  },
  mode: "cards",
  activeQuickChip: "",
  unitSystem: "metric",
  activeLensId: "",
  editingLensId: "",
  editDraft: null,
  drawerMessage: null,
  admin: {
    client: null,
    isAdmin: false,
    checking: false
  },
  loadError: "",
  libraryStatus: {
    discoveredJsonFiles: 0,
    loadedFiles: 0,
    failedFiles: 0,
    importedRecords: 0,
    source: "json"
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
  loadUnitPreference();
  bindEvents();
  initAdminSession().catch(() => {
    state.admin.isAdmin = false;
  });

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
    "unitToggle",
    "quickChips",
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
    state.filters.rehousedOnly = false;
    state.activeQuickChip = getMatchingQuickChip(state.filters.search);
    renderArchive();
  });

  [
    ["eraFilter", "era"],
    ["manufacturerFilter", "manufacturer"],
    ["importanceFilter", "importance"],
    ["tagFilter", "tag"],
    ["lineageFilter", "lineage"]
  ].forEach(([elementId, filterKey]) => {
    els[elementId].addEventListener("change", (event) => {
      state.filters[filterKey] = event.target.value;
      renderArchive();
    });
  });

  [
    ["typeFilter", "type"],
    ["formatFilter", "format"]
  ].forEach(([elementId, filterKey]) => {
    els[elementId].addEventListener("change", (event) => {
      if (!event.target.matches('input[type="checkbox"]')) return;
      state.filters[filterKey] = getCheckedValues(els[elementId]);
      updateMultiSelectSummary(els[elementId], filterKey);
      renderArchive();
    });
  });

  els.clearFilters.addEventListener("click", clearFilters);

  els.unitToggle?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-unit]");
    if (!button) return;
    setUnitSystem(button.dataset.unit);
  });

  els.quickChips.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-query]");
    if (!chip) return;
    if (chip.dataset.typeFilter) {
      const activeKey = `type:${chip.dataset.typeFilter}`;
      const nextActive = state.activeQuickChip === activeKey ? "" : activeKey;
      state.filters.search = "";
      els.searchInput.value = "";
      state.filters.rehousedOnly = Boolean(nextActive);
      state.activeQuickChip = nextActive;
      renderArchive();
      return;
    }
    const query = chip.dataset.query || chip.textContent.trim();
    const normalizedQuery = normalizeSearchValue(query);
    const nextValue = state.activeQuickChip === normalizedQuery ? "" : query;
    state.filters.rehousedOnly = false;
    els.searchInput.value = nextValue;
    state.filters.search = normalizeSearchValue(nextValue);
    state.activeQuickChip = state.filters.search ? normalizedQuery : "";
    renderArchive();
  });

  els.scaleToggle.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scale]");
    if (!button) return;
    state.mode = button.dataset.scale;
    renderArchive();
  });

  if (els.exportJson) {
    els.exportJson.addEventListener("click", exportJson);
  }

  els.detailDrawer.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-drawer]")) {
      closeDrawer();
    }
  });

  els.drawerContent.addEventListener("click", handleDrawerAction);
  els.drawerContent.addEventListener("input", handleDrawerInput);
  els.drawerContent.addEventListener("submit", handleDrawerSubmit);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (!hasDirtyPublicDraft()) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

function loadUnitPreference() {
  try {
    const stored = window.localStorage.getItem("lenswiki-unit-system");
    if (stored === "imperial" || stored === "metric") {
      state.unitSystem = stored;
    }
  } catch (_error) {
    state.unitSystem = "metric";
  }
  updateUnitToggle();
}

function setUnitSystem(unitSystem) {
  if (!["metric", "imperial"].includes(unitSystem) || state.unitSystem === unitSystem) return;
  state.unitSystem = unitSystem;
  try {
    window.localStorage.setItem("lenswiki-unit-system", unitSystem);
  } catch (_error) {
    // Unit preference is optional; the UI still updates for this session.
  }
  updateUnitToggle();
  rerenderActiveLens();
}

function updateUnitToggle() {
  if (!els.unitToggle) return;
  els.unitToggle.querySelectorAll("[data-unit]").forEach((button) => {
    const active = button.dataset.unit === state.unitSystem;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

async function initAdminSession() {
  const client = getSupabaseClient();
  if (!client) return;

  const sessionResult = await safeSupabaseCall(() => client.auth.getSession());
  if (sessionResult.data?.session?.user) {
    await verifyLensWikiAdmin(sessionResult.data.session.user);
  }

  client.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      verifyLensWikiAdmin(session.user);
      return;
    }

    state.admin.isAdmin = false;
    rerenderActiveLens();
  });
}

function getSupabaseClient() {
  if (state.admin.client) return state.admin.client;
  const url = window.LENSWIKI_SUPABASE_URL || "";
  const anonKey = window.LENSWIKI_SUPABASE_ANON_KEY || "";
  if (!window.supabase?.createClient || isMissingSupabaseConfig(url, anonKey)) {
    return null;
  }

  state.admin.client = window.supabase.createClient(url, anonKey);
  return state.admin.client;
}

async function verifyLensWikiAdmin(user) {
  if (!state.admin.client || !user?.id) return false;
  state.admin.checking = true;

  const { data, error } = await safeSupabaseCall(() =>
    state.admin.client
      .from("lenswiki_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()
  );

  state.admin.isAdmin = !error && Boolean(data?.user_id);
  state.admin.checking = false;
  rerenderActiveLens();
  return state.admin.isAdmin;
}

async function safeSupabaseCall(callback) {
  try {
    return await callback();
  } catch (error) {
    return { data: null, error };
  }
}

function isMissingSupabaseConfig(url, anonKey) {
  return [url, anonKey].some((value) => {
    const normalized = safeText(value);
    return !normalized || normalized.includes("YOUR_SUPABASE_");
  });
}

async function loadLensLibrary() {
  const status = {
    discoveredJsonFiles: 0,
    loadedFiles: 0,
    failedFiles: 0,
    importedRecords: 0,
    source: "json"
  };

  const supabaseLenses = await loadSupabaseLensRecords();
  const supabaseById = new Map();
  supabaseLenses.forEach((lens) => {
    const fileName = safeText(lens.fileName) || `${safeText(lens.id, "lenswiki-record")}.json`;
    if (!isValidLens(lens, fileName)) return;
    supabaseById.set(lens.id, normalizeLens({ ...lens, _recordSource: "supabase" }, fileName));
  });

  if (supabaseById.size) {
    const lenses = Array.from(supabaseById.values()).sort(sortByYearThenImportance);
    status.loadedFiles = supabaseById.size;
    status.importedRecords = lenses.length;
    status.source = "supabase";
    return { lenses, status, error: "" };
  }

  let entries = [];
  let githubError = "";
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
    githubError = LIBRARY_LOAD_ERROR;
  }

  const lensesById = new Map();

  if (entries && !Array.isArray(entries)) {
    console.warn("LensWiki: GitHub directory listing was not an array.", entries);
    githubError = LIBRARY_LOAD_ERROR;
  }

  if (Array.isArray(entries)) {
    const jsonEntries = entries.filter((entry) => entry.type === "file" && entry.name.toLowerCase().endsWith(".json"));
    status.discoveredJsonFiles = jsonEntries.length;

    jsonEntries.forEach(validateFileName);

    const results = await Promise.all(jsonEntries.map(loadLensFile));

    results.forEach((result) => {
      if (result.failed) {
        status.failedFiles += 1;
        return;
      }

      status.loadedFiles += 1;
      result.lenses.forEach((lens) => {
        if (!isValidLens(lens, result.fileName)) return;
        warnIfIdDoesNotMatchFile(lens.id, result.fileName);
        const normalized = normalizeLens({ ...lens, _recordSource: "json" }, result.fileName);
        if (lensesById.has(normalized.id)) {
          console.warn(`LensWiki: duplicate lens id "${normalized.id}" in ${result.fileName}. Keeping the first record.`);
          return;
        }
        lensesById.set(normalized.id, normalized);
      });
    });
  }

  const lenses = Array.from(lensesById.values());
  lenses.sort(sortByYearThenImportance);
  status.importedRecords = lenses.length;
  return { lenses, status, error: lenses.length ? "" : githubError };
}

async function loadSupabaseLensRecords() {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await safeSupabaseCall(() =>
    client
      .from("lenswiki_records")
      .select("id,slug,name,manufacturer,year_introduced,status,confidence,data,updated_at")
      .in("status", ["ready", "published"])
      .order("year_introduced", { ascending: true })
  );

  if (error) {
    console.warn("LensWiki: could not load admin lens records.", error);
    return [];
  }

  return (Array.isArray(data) ? data : []).map(lensFromSupabaseRecord).filter(Boolean);
}

function lensFromSupabaseRecord(record) {
  if (!record || typeof record !== "object") return null;
  const data = record.data && typeof record.data === "object" && !Array.isArray(record.data)
    ? record.data
    : {};
  const id = safeText(data.id) || safeText(record.id);
  if (!id) return null;

  const slug = safeText(data.slug) || safeText(record.slug) || slugify(id);
  const yearIntroduced = numberOrNull(data.yearIntroduced) ?? numberOrNull(record.year_introduced);
  return {
    ...data,
    id,
    slug,
    fileName: safeText(data.fileName) || `${slug}.json`,
    name: safeText(data.name) || safeText(record.name),
    manufacturer: safeText(data.manufacturer) || safeText(record.manufacturer),
    yearIntroduced,
    status: safeText(data.status) || safeText(record.status),
    confidence: safeText(data.confidence) || safeText(record.confidence),
    _recordSource: "supabase",
    _supabaseUpdatedAt: safeText(record.updated_at)
  };
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
  const type = normalizeArrayField(lens.type, getArrayFieldOptions("type"));
  const hasExplicitRehousedFlag = hasOwn(lens, "isRehoused");
  const timelineCategory = safeText(lens.timelineCategory);
  const cardLabel = safeText(lens.cardLabel)
    || timelineCategory
    || safeText(lens.designFamily)
    || type[0]
    || "";

  return {
    ...lens,
    id: safeText(lens.id),
    slug: safeText(lens.slug) || slugify(lens.id),
    fileName: safeText(lens.fileName) || fileName,
    name: safeText(lens.name),
    manufacturer: safeText(lens.manufacturer),
    designer: safeText(lens.designer),
    yearIntroduced: numberOrNull(lens.yearIntroduced),
    yearApproximate: Boolean(lens.yearApproximate),
    status: safeText(lens.status),
    productionYears: safeText(lens.productionYears),
    country: safeText(lens.country),
    factoryLocation: safeText(lens.factoryLocation),
    type,
    isRehoused: hasExplicitRehousedFlag ? parseBoolean(lens.isRehoused) : typeSuggestsRehoused(type),
    _isRehousedExplicit: hasExplicitRehousedFlag,
    importance: normalizeImportance(lens.importance),
    timelineCategory,
    era: safeText(lens.era),
    lineage: safeText(lens.lineage),
    cardLabel,
    publicSummary: safeText(lens.publicSummary),
    coverage: safeText(lens.coverage),
    formatCoverageNotes: normalizeArrayField(lens.formatCoverageNotes, getArrayFieldOptions("formatCoverageNotes")),
    mounts: normalizeArrayField(lens.mounts, getArrayFieldOptions("mounts")),
    seriesHistory: asArray(lens.seriesHistory),
    focalLengths: normalizeArrayField(lens.focalLengths, getArrayFieldOptions("focalLengths")),
    tStops: normalizeArrayField(lens.tStops, getArrayFieldOptions("tStops")),
    closeFocus: normalizeArrayField(lens.closeFocus, getArrayFieldOptions("closeFocus")),
    focalLengthSpecs: normalizeFocalLengthSpecs(lens),
    opticalFormula: safeText(lens.opticalFormula),
    elements: numberOrNull(lens.elements),
    groups: numberOrNull(lens.groups),
    coating: safeText(lens.coating),
    designFamily: safeText(lens.designFamily),
    donorLens: safeText(lens.donorLens),
    rehousingInfo: safeText(lens.rehousingInfo),
    originalMount: safeText(lens.originalMount),
    donorMount: safeText(lens.donorMount),
    rehousingCompany: safeText(lens.rehousingCompany),
    rehousingGeneration: safeText(lens.rehousingGeneration),
    rehousingNotes: safeText(lens.rehousingNotes),
    donorProductionYearsByLens: normalizeDonorProductionYearsMap(lens.donorProductionYearsByLens),
    lookSummary: safeText(lens.lookSummary),
    cineflares: normalizeCineFlares(lens.cineflares),
    characteristics: normalizeArrayField(lens.characteristics, getArrayFieldOptions("characteristics")),
    strengths: normalizeArrayField(lens.strengths, getArrayFieldOptions("strengths")),
    weaknesses: normalizeArrayField(lens.weaknesses, getArrayFieldOptions("weaknesses")),
    famousUses: normalizeArrayField(lens.famousUses, { fieldName: "famousUses", preserveObjects: true }),
    sampleFootage: normalizeArrayField(lens.sampleFootage, { fieldName: "sampleFootage", preserveObjects: true }),
    youtubeEmbeds: normalizeYouTubeSamples(lens.youtubeEmbeds),
    videoSamples: getLensVideoSamples(lens),
    imageUrls: asArray(lens.imageUrls),
    relatedLensIds: asArray(lens.relatedLensIds),
    sources: normalizeArrayField(lens.sources, { fieldName: "sources", preserveObjects: true }),
    confidence: normalizeConfidence(lens.confidence),
    libraryStatus: safeText(lens.libraryStatus),
    curationNotes: safeText(lens.curationNotes),
    notes: safeText(lens.notes),
    _recordSource: safeText(lens._recordSource) || "json",
    _supabaseUpdatedAt: safeText(lens._supabaseUpdatedAt),
    sourceFile: fileName,
    searchText: JSON.stringify(lens).toLowerCase()
  };
}

function normalizeFocalLengthSpecs(lens) {
  const values = FOCAL_LENGTH_SPECS_FIELDS.map((fieldName) => lens[fieldName]).filter(hasValue);
  const value = values.find((candidate) => hasObjectRows(normalizeArrayField(candidate, { fieldName: "focalLengthSpecs", preserveObjects: true })))
    || values[0];
  return normalizeArrayField(value, { fieldName: "focalLengthSpecs", preserveObjects: true });
}

function hasObjectRows(value) {
  return Array.isArray(value) && value.some((item) => item && typeof item === "object" && !Array.isArray(item));
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
  populateMultiSelect(els.typeFilter, "All types", TYPE_FILTERS, state.filters.type);
  populateMultiSelect(els.formatFilter, "All formats", FORMAT_FILTERS, state.filters.format);
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
  const recordLabel = importedRecords === 1 ? "curated lens record" : "curated lens records";
  const failedText = failedFiles ? ` · ${failedFiles} could not be loaded` : "";
  els.libraryStatus.textContent = `${importedRecords} ${recordLabel} loaded${failedText}`;
  els.libraryStatus.classList.toggle("has-failures", failedFiles > 0 || Boolean(state.loadError));
}

function renderArchive() {
  const lenses = getFilteredLenses();
  renderDataStatus();
  renderModeButtons();
  renderQuickChips();
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
        <p>The archive is ready for curated lens records.</p>
      </div>
    `;
    return;
  }

  if (!lenses.length) {
    els.timelineViewport.innerHTML = '<div class="empty-state">No lenses found. Clear filters or adjust your search.</div>';
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
    els.dataStatus.textContent = `${state.libraryStatus.failedFiles} lens record could not be loaded. Valid records are still shown.`;
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

function renderQuickChips() {
  els.quickChips.querySelectorAll("[data-query]").forEach((chip) => {
    const query = chip.dataset.typeFilter
      ? `type:${chip.dataset.typeFilter}`
      : normalizeSearchValue(chip.dataset.query || chip.textContent);
    const active = query === state.activeQuickChip;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
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
    if (["type", "format"].includes(key)) {
      state.filters[key] = [];
    } else if (key === "search") {
      state.filters[key] = "";
    } else if (key === "rehousedOnly") {
      state.filters[key] = false;
    } else {
      state.filters[key] = "all";
    }
  });

  els.searchInput.value = "";
  state.activeQuickChip = "";
  [
    els.eraFilter,
    els.manufacturerFilter,
    els.importanceFilter,
    els.tagFilter,
    els.lineageFilter
  ].forEach((select) => {
    select.value = "all";
  });
  resetMultiSelect(els.typeFilter, "type");
  resetMultiSelect(els.formatFilter, "format");
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
      <span class="card-badges">
        ${lens.isRehoused ? '<span class="data-pill">Rehoused</span>' : ""}
        ${lens.importance ? `<span class="importance-pill ${escapeHtml(lens.importance)}">${escapeHtml(lens.importance)}</span>` : ""}
      </span>
    </div>
    <h3>${escapeHtml(lens.name)}</h3>
    ${lens.manufacturer ? `<p class="manufacturer">${escapeHtml(lens.manufacturer)}</p>` : ""}
    ${getCardLabel(lens) ? `<p class="card-label">${escapeHtml(getCardLabel(lens))}</p>` : ""}
    ${getPublicSummary(lens) ? `<p class="look-summary">${escapeHtml(getPublicSummary(lens))}</p>` : ""}
    ${getCardCoverage(lens) ? `<p class="card-coverage"><span>Format</span>${escapeHtml(getCardCoverage(lens))}</p>` : ""}
    ${lens.characteristics.length ? `<div class="chip-list">${renderTags(lens.characteristics, 3)}</div>` : ""}
    ${lens.confidence ? `<p class="source-status">Confidence: ${escapeHtml(lens.confidence)}</p>` : ""}
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
  if (hasDirtyPublicDraft() && !confirm("Discard unsaved changes?")) return;
  if (hasDirtyPublicDraft()) clearCurrentPublicDraft();
  const lens = state.lenses.find((item) => item.id === id);
  if (!lens) return;

  state.activeLensId = id;
  state.editingLensId = "";
  state.editDraft = null;
  state.drawerMessage = null;
  els.drawerContent.replaceChildren(renderLensDetails(lens));
  els.detailDrawer.classList.add("is-open");
  els.detailDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeDrawer() {
  if (hasDirtyPublicDraft() && !confirm("Discard unsaved changes?")) return;
  if (hasDirtyPublicDraft()) clearCurrentPublicDraft();
  els.detailDrawer.classList.remove("is-open");
  els.detailDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  state.activeLensId = "";
  state.editingLensId = "";
  state.editDraft = null;
  state.drawerMessage = null;
}

function rerenderActiveLens() {
  if (!state.activeLensId || els.detailDrawer.getAttribute("aria-hidden") === "true") return;
  const lens = state.lenses.find((item) => item.id === state.activeLensId);
  if (!lens) return;
  els.drawerContent.replaceChildren(
    state.editingLensId === lens.id && state.editDraft ? renderLensEditForm(lens) : renderLensDetails(lens)
  );
}

function handleDrawerAction(event) {
  const action = event.target.closest("[data-drawer-action]");
  if (!action) return;

  if (action.dataset.drawerAction === "edit-lens") {
    const lens = getActiveLens();
    if (!lens || !state.admin.isAdmin) return;
    startLensEdit(lens);
  }

  if (action.dataset.drawerAction === "copy-json") {
    copyActiveLensJson(action).catch(() => {
      showInlineCopyStatus(els.drawerContent, "Clipboard blocked. Copy manually.", "error");
    });
  }

  if (action.dataset.drawerAction === "paste-json") {
    openPublicJsonPatchPanel();
  }

  if (action.dataset.drawerAction === "preview-json-patch") {
    previewPublicJsonPatch();
  }

  if (action.dataset.drawerAction === "apply-json-patch") {
    applyPublicJsonPatch();
  }

  if (action.dataset.drawerAction === "cancel-json-patch") {
    closePublicJsonPatchPanel();
  }

  if (action.dataset.drawerAction === "cancel-edit") {
    if (hasDirtyPublicDraft() && !confirm("Discard unsaved changes?")) return;
    if (hasDirtyPublicDraft()) clearCurrentPublicDraft();
    state.editingLensId = "";
    state.editDraft = null;
    state.drawerMessage = null;
    rerenderActiveLens();
  }

  if (action.dataset.drawerAction === "restore-draft") {
    restorePublicAutosaveDraft();
  }

  if (action.dataset.drawerAction === "discard-draft") {
    discardPublicAutosaveDraft();
  }
}

function handleDrawerInput(event) {
  if (event.target.matches("[data-json-patch-input]")) {
    if (state.editDraft?.jsonPatch) {
      state.editDraft.jsonPatch.raw = event.target.value;
      state.editDraft.jsonPatch.error = "";
      state.editDraft.jsonPatch.preview = [];
      state.editDraft.jsonPatch.ignored = [];
      state.editDraft.jsonPatch.patchLens = null;
      state.editDraft.jsonPatch.typeSummary = [];
      state.editDraft.jsonPatch.warnings = [];
    }
    return;
  }

  if (!state.editDraft || !event.target.closest("#lensEditForm")) return;
  const fieldName = event.target.name;
  if (!fieldName) return;

  if (event.target.type === "checkbox") {
    state.editDraft.values[fieldName] = event.target.checked;
  } else if (event.target.type === "radio") {
    state.editDraft.values[fieldName] = event.target.value === "true";
  } else {
    state.editDraft.values[fieldName] = event.target.value;
  }
  state.editDraft.dirty = true;
  persistPublicDraft();
  if (fieldName === "isRehoused" || fieldName === "cineflaresAvailable") {
    rerenderActiveLens();
  } else {
    updatePublicDraftStatus();
  }
}

function handleDrawerSubmit(event) {
  if (!event.target.matches("#lensEditForm")) return;
  event.preventDefault();
  saveLensEdits(event.target).catch(() => {
    state.drawerMessage = { tone: "error", text: "Could not save lens. Please try again." };
    rerenderActiveLens();
  });
}

function getActiveLens() {
  return state.lenses.find((item) => item.id === state.activeLensId);
}

function startLensEdit(lens) {
  state.editingLensId = lens.id;
  state.editDraft = createPublicEditDraft(lens);
  state.drawerMessage = null;
  rerenderActiveLens();
}

function createPublicEditDraft(lens) {
  const storageKey = getPublicDraftStorageKey(lens.id);
  const autosaved = readStoredDraft(storageKey);
  const lensObject = autosaved?.lens && typeof autosaved.lens === "object"
    ? autosaved.lens
    : toExportLens(lens);
  return {
    lensId: lens.id,
    storageKey,
    lens: lensObject,
    values: createDraftValues(lensObject, ADMIN_EDIT_FIELDS),
    dirty: false,
    autosavedValues: autosaved?.values || null,
    autosavedLens: autosaved?.lens || null
  };
}

function renderLensDetails(lens) {
  const fragment = document.createDocumentFragment();
  const mountLabels = cleanMountsForDisplay(lens.mounts);
  const focalLengthSpecs = normalizeFocalLengthSpecs(lens);
  const hasFocalLengthSpecs = hasObjectRows(focalLengthSpecs);
  appendIf(fragment, createDrawerMessage());
  const header = document.createElement("header");
  header.className = "drawer-title";
  header.innerHTML = `
    ${lens.manufacturer ? `<p class="eyebrow">${escapeHtml(lens.manufacturer)}</p>` : ""}
    <h2 id="drawerTitle">${escapeHtml(lens.name)}</h2>
    <div class="drawer-meta">
      <span class="year-pill">${escapeHtml(formatYear(lens))}</span>
      ${lens.importance ? `<span class="importance-pill ${escapeHtml(lens.importance)}">${escapeHtml(lens.importance)}</span>` : ""}
      ${lens.isRehoused ? '<span class="data-pill">Rehoused</span>' : ""}
      ${shouldShowTitleConfidence(lens.confidence) ? `<span class="confidence subtle ${escapeHtml(confidenceClass(lens.confidence))}">${escapeHtml(lens.confidence)}</span>` : ""}
    </div>
    ${state.admin.isAdmin ? `
      <div class="admin-lens-actions">
        <button class="secondary-button small" type="button" data-drawer-action="edit-lens">Update lens</button>
        <button class="ghost-button small" type="button" data-drawer-action="copy-json">Copy JSON</button>
        <span class="copy-status" data-copy-status hidden></span>
      </div>
      <p class="admin-source-status">${escapeHtml(getAdminLensSourceText(lens))}</p>
    ` : ""}
  `;
  fragment.append(header);

  const factFields = [
    ["Year introduced", formatYear(lens)],
    ["Production years", lens.productionYears],
    ["Country", lens.country],
    ["Type", lens.type],
    ["Coverage", getKeySpecCoverage(lens)],
    ["Mounts", mountLabels.length ? createChipValue(mountLabels) : ""],
    ["Focal lengths", lens.focalLengths],
    ...(hasFocalLengthSpecs ? [] : [["T-stops / f-stops", lens.tStops]]),
    ["Timeline category", lens.timelineCategory]
  ];

  appendIf(fragment, createEditorialSection("Overview", getOverviewSummary(lens)));
  appendIf(fragment, createEditorialSection("Look", lens.lookSummary));
  appendIf(fragment, createCineFlaresSection(lens));
  appendIf(fragment, createYoutubeSection(lens));
  appendIf(fragment, createDetailSection("Key specs", createFieldGrid(factFields)));
  appendIf(fragment, createFocalLengthSpecsSection(focalLengthSpecs));
  appendIf(fragment, createListSection("Character", lens.characteristics));
  appendIf(fragment, createListSection("Strengths", lens.strengths));
  appendIf(fragment, createListSection("Weaknesses", lens.weaknesses));
  appendIf(fragment, createEditorialSection("History", lens.seriesHistory));
  appendIf(fragment, createRehousingSection(lens));
  appendIf(fragment, createKnownUseSection(lens.famousUses));
  appendIf(fragment, createRelatedSection(lens));
  appendIf(fragment, createSourcesAndNotesSection(lens));
  fragment.append(createCorrectionFeedbackSection(lens));

  return fragment;
}

function renderLensEditForm(lens) {
  if (!state.editDraft) {
    state.editDraft = createPublicEditDraft(lens);
  }
  const draft = state.editDraft;
  const form = document.createElement("form");
  form.className = "lens-edit-form";
  form.id = "lensEditForm";
  form.dataset.lensId = lens.id;
  form.innerHTML = `
    <header class="drawer-title edit-title">
      <p class="eyebrow">Update lens</p>
      <h2 id="drawerTitle">${escapeHtml(draft.values.name || lens.name)}</h2>
      <div class="admin-lens-actions">
        <button class="primary-button small" type="submit">Save changes</button>
        <button class="secondary-button small" type="button" data-drawer-action="copy-json">Copy JSON</button>
        <button class="secondary-button small" type="button" data-drawer-action="paste-json">Paste JSON</button>
        <button class="ghost-button small" type="button" data-drawer-action="cancel-edit">Cancel</button>
        <span class="copy-status" data-copy-status hidden></span>
      </div>
      <p class="admin-source-status">${escapeHtml(getAdminLensSourceText(lens))}</p>
      <p class="edit-dirty-status" data-draft-status ${draft.dirty ? "" : "hidden"}>Unsaved changes</p>
    </header>
    ${state.drawerMessage ? `
      <p class="drawer-message ${escapeHtml(state.drawerMessage.tone || "")}">${escapeHtml(state.drawerMessage.text)}</p>
    ` : ""}
    ${draft.autosavedValues ? `
      <div class="draft-restore">
        <p>Unsaved draft found. Restore draft?</p>
        <div>
          <button class="secondary-button small" type="button" data-drawer-action="restore-draft">Restore draft</button>
          <button class="ghost-button small" type="button" data-drawer-action="discard-draft">Discard draft</button>
        </div>
      </div>
    ` : ""}
    ${draft.jsonPatch?.open ? renderJsonPatchPanel(draft.jsonPatch) : ""}
    <div class="edit-grid">
      ${ADMIN_EDIT_FIELDS.filter((field) => shouldShowEditField(draft, field)).map((field) => renderEditField(draft, field)).join("")}
    </div>
  `;
  return form;
}

function getAdminLensSourceText(lens) {
  if (lens._recordSource === "supabase") {
    return "Source: Supabase";
  }
  return "Source: JSON fallback · Not yet saved to Supabase";
}

function renderJsonPatchPanel(patchState) {
  const previewRows = patchState.preview?.length ? `
    <div class="json-patch-preview">
      ${patchState.preview.map((change) => `
        <div class="json-patch-row">
          <strong>${escapeHtml(change.label)}</strong>
          <p><span>Current</span>${escapeHtml(change.currentDisplay || "-")}</p>
          <p><span>New</span>${escapeHtml(change.nextDisplay || "-")}</p>
        </div>
      `).join("")}
    </div>
  ` : "";
  const typeSummary = patchState.typeSummary?.length
    ? `<p class="json-patch-note">Detected field types: ${escapeHtml(patchState.typeSummary.join("; "))}</p>`
    : "";
  const warnings = patchState.warnings?.length
    ? `<p class="json-patch-error">${escapeHtml(patchState.warnings.join(" "))}</p>`
    : "";

  return `
    <section class="json-patch-panel">
      <div class="json-patch-heading">
        <div>
          <p class="eyebrow">Paste JSON</p>
          <h3>Apply JSON patch</h3>
        </div>
        <button class="ghost-button small" type="button" data-drawer-action="cancel-json-patch">Cancel</button>
      </div>
      <p class="json-patch-note">You can paste either a full lens JSON object or a partial patch. Nested objects and arrays are preserved.</p>
      <textarea data-json-patch-input rows="8" placeholder='"focalLengths": ["16mm", "20mm"]'>${escapeHtml(patchState.raw || "")}</textarea>
      ${patchState.error ? `<p class="json-patch-error">${escapeHtml(patchState.error)}</p>` : ""}
      ${warnings}
      ${typeSummary}
      ${previewRows}
      <div class="admin-lens-actions">
        <button class="secondary-button small" type="button" data-drawer-action="preview-json-patch">Preview changes</button>
        <button class="primary-button small" type="button" data-drawer-action="apply-json-patch">Apply changes</button>
      </div>
    </section>
  `;
}

function openPublicJsonPatchPanel() {
  if (!state.editDraft) return;
  state.editDraft.jsonPatch = {
    open: true,
    raw: state.editDraft.jsonPatch?.raw || "",
    preview: [],
    ignored: [],
    error: "",
    typeSummary: [],
    warnings: [],
    patchLens: null
  };
  rerenderActiveLens();
}

function closePublicJsonPatchPanel() {
  if (!state.editDraft?.jsonPatch) return;
  state.editDraft.jsonPatch = null;
  rerenderActiveLens();
}

function previewPublicJsonPatch() {
  if (!state.editDraft?.jsonPatch) return;
  evaluatePublicJsonPatch();
  rerenderActiveLens();
}

function evaluatePublicJsonPatch(options = {}) {
  const patchState = state.editDraft?.jsonPatch;
  if (!patchState) return false;

  const parsed = parseJsonPatchInput(patchState.raw);
  if (parsed.error) {
    patchState.error = parsed.error;
    patchState.preview = [];
    patchState.ignored = [];
    patchState.patchLens = null;
    patchState.typeSummary = [];
    patchState.warnings = [];
    return false;
  }

  const lens = getActiveLens();
  const currentLens = lens ? buildUpdatedLensFromDraft(lens, state.editDraft) : state.editDraft.lens;
  const prepared = prepareLensJsonPatch(parsed.value, currentLens);
  patchState.error = prepared.error === "No changes to apply."
    ? options.emptyMessage || "No changes found."
    : prepared.error;
  patchState.preview = prepared.preview;
  patchState.ignored = prepared.ignored;
  patchState.patchLens = prepared.patchLens;
  patchState.typeSummary = prepared.typeSummary;
  patchState.warnings = prepared.warnings;
  return Boolean(prepared.preview.length);
}

function applyPublicJsonPatch() {
  if (!state.editDraft?.jsonPatch) return;
  if (!evaluatePublicJsonPatch({ emptyMessage: "No supported changes found." })) {
    rerenderActiveLens();
    return;
  }

  const patchLens = state.editDraft.jsonPatch.patchLens;
  const warnings = state.editDraft.jsonPatch.warnings || [];
  const typeSummary = state.editDraft.jsonPatch.typeSummary || [];
  state.editDraft.lens = patchLens;
  state.editDraft.values = createDraftValues(patchLens, ADMIN_EDIT_FIELDS);
  state.editDraft.dirty = true;
  state.editDraft.jsonPatch = null;
  const detail = [
    typeSummary.length ? `Detected: ${typeSummary.join("; ")}.` : "",
    warnings.join(" ")
  ].filter(Boolean).join(" ");
  state.drawerMessage = {
    tone: "success",
    text: `Changes applied. Click Save changes to publish.${detail ? ` ${detail}` : ""}`
  };
  persistPublicDraft();
  rerenderActiveLens();
}

function renderEditField(draft, field) {
  const value = draft.values[field.key] ?? "";
  if (field.type === "toggle") {
    const checked = Boolean(value);
    return `
      <fieldset class="edit-field edit-field-wide toggle-field">
        <legend>${escapeHtml(field.label)}</legend>
        <div class="toggle-options">
          <label>
            <input name="${escapeHtml(field.key)}" type="radio" value="true" ${checked ? "checked" : ""}>
            <span>Yes</span>
          </label>
          <label>
            <input name="${escapeHtml(field.key)}" type="radio" value="false" ${!checked ? "checked" : ""}>
            <span>No</span>
          </label>
        </div>
      </fieldset>
    `;
  }

  if (field.type === "checkbox") {
    return `
      <label class="edit-field edit-field-checkbox">
        <input name="${escapeHtml(field.key)}" type="checkbox" ${value ? "checked" : ""}>
        <span>${escapeHtml(field.label)}</span>
      </label>
    `;
  }

  if (field.type === "textarea" || field.type === "lines" || field.type === "structured" || field.type === "object") {
    const rows = field.type === "structured" ? 8 : 4;
    return `
      <label class="edit-field ${field.type === "textarea" || field.type === "structured" || field.type === "object" ? "edit-field-wide" : ""}">
        <span>${escapeHtml(field.label)}</span>
        <textarea name="${escapeHtml(field.key)}" rows="${rows}">${escapeHtml(value)}</textarea>
        ${getEditHint(field)}
      </label>
    `;
  }

  return `
    <label class="edit-field">
      <span>${escapeHtml(field.label)}</span>
      <input name="${escapeHtml(field.key)}" type="${field.type === "number" ? "number" : "text"}" value="${escapeHtml(value)}">
      ${getEditHint(field)}
    </label>
  `;
}

function shouldShowEditField(draft, field) {
  if (field.key === "cineflaresUrl") return Boolean(draft.values.cineflaresAvailable);
  if (!REHOUSING_FIELD_KEYS.has(field.key)) return true;
  return Boolean(draft.values.isRehoused);
}

function getEditHint(field) {
  if (field.type === "list") {
    return '<small>Use comma-separated values.</small>';
  }
  if (field.type === "lines") {
    return '<small>Use one item per line.</small>';
  }
  if (field.type === "structured") {
    return '<small>Use JSON for structured entries, or one item per line for simple text.</small>';
  }
  if (field.type === "object") {
    return '<small>Use a JSON object, for example { "Lens name": "1967-1992" }.</small>';
  }
  return "";
}

function createDrawerMessage() {
  if (!state.drawerMessage) return null;
  const message = document.createElement("p");
  message.className = `drawer-message ${state.drawerMessage.tone || ""}`.trim();
  message.textContent = state.drawerMessage.text;
  return message;
}

async function saveLensEdits(form) {
  const lens = getActiveLens();
  if (!lens || !state.editDraft || !state.admin.isAdmin || !state.admin.client) return;

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";
  }

  const updatedLens = buildUpdatedLensFromDraft(lens, state.editDraft);
  const saveResult = await saveLensToSupabase(updatedLens);

  if (saveResult.error) {
    state.drawerMessage = { tone: "error", text: "Could not save lens. Please try again." };
    rerenderActiveLens();
    return;
  }

  const savedLens = saveResult.lens || updatedLens;
  const normalized = normalizeLens({ ...savedLens, _recordSource: "supabase" }, savedLens.fileName || lens.fileName || lens.sourceFile);
  replaceLens(normalized);
  state.activeLensId = normalized.id;
  state.editingLensId = "";
  clearStoredDraft(state.editDraft.storageKey);
  state.editDraft = null;
  state.drawerMessage = { tone: "success", text: "Saved and published to Supabase." };
  renderAll();
  rerenderActiveLens();
}

async function copyActiveLensJson(actionElement) {
  if (!state.admin.isAdmin) return;
  const lens = getActiveLens();
  if (!lens) return;

  const payload = state.editDraft && state.editingLensId === lens.id
    ? buildUpdatedLensFromDraft(lens, state.editDraft)
    : getCopyableLens(lens);
  const root = actionElement.closest("form") || els.drawerContent;
  await copyJsonPayload(payload, root);
}

function getCopyableLens(lens) {
  return toExportLens(lens);
}

async function copyJsonPayload(payload, root) {
  const json = JSON.stringify(payload, null, 2);
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard unavailable");
    }
    await navigator.clipboard.writeText(json);
    removeManualCopyFallback(root);
    showInlineCopyStatus(root, "JSON copied.");
  } catch (_error) {
    showManualCopyFallback(json, root);
    showInlineCopyStatus(root, "Clipboard blocked. Copy manually.", "error");
  }
}

function showInlineCopyStatus(root, message, tone = "success") {
  const status = root.querySelector("[data-copy-status]") || els.drawerContent.querySelector("[data-copy-status]");
  if (!status) return;

  status.hidden = false;
  status.textContent = message;
  status.dataset.tone = tone;
  window.clearTimeout(Number(status.dataset.timeoutId || 0));
  status.dataset.timeoutId = String(window.setTimeout(() => {
    status.hidden = true;
    status.textContent = "";
    delete status.dataset.tone;
    delete status.dataset.timeoutId;
  }, 3200));
}

function showManualCopyFallback(json, root) {
  removeManualCopyFallback(root);
  const fallback = document.createElement("div");
  fallback.className = "json-copy-fallback";
  fallback.dataset.jsonCopyFallback = "true";
  fallback.innerHTML = `
    <label>
      Copy manually
      <textarea readonly rows="8">${escapeHtml(json)}</textarea>
    </label>
  `;

  const anchor = root.querySelector(".drawer-title") || root.firstElementChild;
  if (anchor) {
    anchor.after(fallback);
  } else {
    root.prepend(fallback);
  }

  const textarea = fallback.querySelector("textarea");
  textarea.focus();
  textarea.select();
}

function removeManualCopyFallback(root) {
  root.querySelectorAll("[data-json-copy-fallback]").forEach((fallback) => fallback.remove());
}

async function saveLensToSupabase(lens) {
  const userResult = await safeSupabaseCall(() => state.admin.client.auth.getUser());
  const userId = userResult.data?.user?.id;
  if (userResult.error || !userId) {
    return { data: null, error: userResult.error || new Error("Admin session unavailable") };
  }

  const status = getPublishStatusForSave(lens.status);
  const storedLens = cleanLensArrayFields(toExportLens({ ...lens, status }));

  const result = await safeSupabaseCall(() =>
    state.admin.client
      .from("lenswiki_records")
      .upsert({
        id: storedLens.id,
        slug: storedLens.slug || slugify(storedLens.id),
        name: storedLens.name,
        manufacturer: storedLens.manufacturer || null,
        year_introduced: hasValue(storedLens.yearIntroduced) ? String(storedLens.yearIntroduced) : safeText(storedLens.year_introduced) || null,
        status,
        confidence: storedLens.confidence || null,
        data: storedLens,
        updated_at: new Date().toISOString(),
        updated_by: userId
      }, { onConflict: "id" })
      .select("id")
      .single()
  );
  return { ...result, lens: storedLens };
}

function getPublishStatusForSave(status) {
  const normalized = safeText(status).trim().toLowerCase();
  return normalized === "published" ? "published" : "ready";
}

function buildUpdatedLensFromDraft(lens, draft) {
  const updated = { ...(draft.lens && typeof draft.lens === "object" ? stripRuntimeLensFields(draft.lens) : toExportLens(lens)) };

  ADMIN_EDIT_FIELDS.forEach((field) => {
    if (field.key === "cineflaresAvailable" || field.key === "cineflaresUrl") return;

    if (field.type === "checkbox" || field.type === "toggle") {
      updated[field.key] = Boolean(draft.values[field.key]);
      return;
    }

    if (hasOwn(updated, field.key) && updated[field.key] === null && safeText(draft.values[field.key]) === "") {
      updated[field.key] = null;
      return;
    }

    const rawValue = safeText(draft.values[field.key]);
    updated[field.key] = parseEditValue(rawValue, field.type, field.key);
  });

  const existingCineflares = isPlainObject(updated.cineflares) ? updated.cineflares : {};
  updated.cineflares = {
    ...existingCineflares,
    available: Boolean(draft.values.cineflaresAvailable),
    url: draft.values.cineflaresAvailable
      ? safeText(draft.values.cineflaresUrl, "https://lenses.cineflares.com/")
      : ""
  };
  updated.id = safeText(updated.id) || lens.id;
  updated.slug = safeText(updated.slug) || lens.slug || slugify(updated.id);
  updated.fileName = safeText(updated.fileName) || lens.fileName || lens.sourceFile || `${updated.slug}.json`;
  return updated;
}

function restorePublicAutosaveDraft() {
  if (!state.editDraft?.autosavedValues && !state.editDraft?.autosavedLens) return;
  if (state.editDraft.autosavedLens && typeof state.editDraft.autosavedLens === "object") {
    state.editDraft.lens = state.editDraft.autosavedLens;
  }
  state.editDraft.values = {
    ...createDraftValues(state.editDraft.lens, ADMIN_EDIT_FIELDS),
    ...(state.editDraft.autosavedValues || {})
  };
  state.editDraft.autosavedValues = null;
  state.editDraft.autosavedLens = null;
  state.editDraft.dirty = true;
  persistPublicDraft();
  rerenderActiveLens();
}

function discardPublicAutosaveDraft() {
  if (!state.editDraft) return;
  clearStoredDraft(state.editDraft.storageKey);
  state.editDraft.autosavedValues = null;
  state.editDraft.autosavedLens = null;
  rerenderActiveLens();
}

function persistPublicDraft() {
  if (!state.editDraft) return;
  writeStoredDraft(state.editDraft.storageKey, {
    lensId: state.editDraft.lensId,
    lens: state.editDraft.lens,
    values: state.editDraft.values,
    savedAt: new Date().toISOString()
  });
}

function updatePublicDraftStatus() {
  const status = els.drawerContent.querySelector("[data-draft-status]");
  if (status) status.hidden = !hasDirtyPublicDraft();
}

function hasDirtyPublicDraft() {
  return Boolean(state.editDraft?.dirty);
}

function clearCurrentPublicDraft() {
  if (state.editDraft?.storageKey) {
    clearStoredDraft(state.editDraft.storageKey);
  }
  state.editDraft = null;
}

function getPublicDraftStorageKey(lensId) {
  return `lenswiki-draft-${slugify(lensId)}`;
}

function createDraftValues(lens, fields) {
  return fields.reduce((values, field) => {
    if (field.key === "cineflaresAvailable") {
      values[field.key] = Boolean(lens.cineflares?.available);
      return values;
    }

    if (field.key === "cineflaresUrl") {
      values[field.key] = lens.cineflares?.url || "https://lenses.cineflares.com/";
      return values;
    }

    values[field.key] = field.type === "checkbox" || field.type === "toggle"
      ? Boolean(lens[field.key])
      : serializeEditValue(lens[field.key], field.type, field.key);
    return values;
  }, {});
}

function readStoredDraft(storageKey) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && parsed.values ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function writeStoredDraft(storageKey, payload) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch (_error) {
    state.drawerMessage = { tone: "error", text: "Draft backup could not be saved in this browser." };
  }
}

function clearStoredDraft(storageKey) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch (_error) {
    // Ignore storage cleanup failures; the saved Supabase record is still authoritative.
  }
}

function replaceLens(updatedLens) {
  const index = state.lenses.findIndex((lens) => lens.id === updatedLens.id);
  if (index === -1) return;
  state.lenses.splice(index, 1, updatedLens);
  state.lenses.sort(sortByYearThenImportance);
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

function createEditorialSection(title, content) {
  if (!hasValue(content)) return null;

  const wrapper = document.createElement("div");
  wrapper.className = "editorial-block";
  toTextItems(content).forEach((item) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = formatListItem(item);
    wrapper.append(paragraph);
  });

  return createDetailSection(title, wrapper);
}

function createCineFlaresSection(lens) {
  if (!lens.cineflares?.available) return null;

  const section = document.createElement("section");
  section.className = "cineflares-cta";
  const url = lens.cineflares.url || "https://lenses.cineflares.com/";
  section.innerHTML = `
    <a class="secondary-button small" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
      Check flares
    </a>
  `;
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
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    if (isChipValue(value)) {
      description.append(createInlineChipList(value.items));
    } else {
      description.textContent = formatValue(value);
    }
    field.append(term, description);
    grid.append(field);
  });

  return grid;
}

function createChipValue(items) {
  return {
    renderAs: "chips",
    items: normalizeArrayField(items).filter(hasValue)
  };
}

function isChipValue(value) {
  return value && typeof value === "object" && value.renderAs === "chips" && hasValue(value.items);
}

function createInlineChipList(items) {
  const wrapper = document.createElement("div");
  wrapper.className = "inline-chip-list";
  normalizeArrayField(items).forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "tag";
    chip.textContent = item;
    wrapper.append(chip);
  });
  return wrapper;
}

function createListSection(title, items) {
  if (!hasValue(items)) return null;
  const list = document.createElement("ul");
  list.className = "list-block";
  toTextItems(items).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = formatListItem(item);
    list.append(li);
  });
  return createDetailSection(title, list);
}

function createRehousingSection(lens) {
  if (!shouldShowRehousingSection(lens)) return null;

  const wrapper = document.createElement("div");
  wrapper.className = "rehousing-block";

  appendIf(wrapper, createDonorGlassProductionYearsSection(lens));
  appendIf(wrapper, createOriginalOpticsYearsSection(lens));

  if (shouldShowRehousingInfo(lens)) {
    const mechanicalSection = document.createElement("div");
    mechanicalSection.className = "rehousing-subsection";
    mechanicalSection.innerHTML = "<h4>Mechanical rehousing</h4>";
    mechanicalSection.append(createParagraphBlock(getMechanicalRehousingText(lens)));
    wrapper.append(mechanicalSection);
  }

  const notes = getRehousingNotes(lens);
  if (hasValue(notes)) {
    const notesSection = document.createElement("div");
    notesSection.className = "rehousing-subsection";
    notesSection.innerHTML = "<h4>Notes</h4>";
    notesSection.append(createParagraphBlock(notes));
    wrapper.append(notesSection);
  }

  return createDetailSection("Rehousing", wrapper);
}

function createDonorGlassProductionYearsSection(lens) {
  const rows = getDonorGlassProductionYearRows(lens);
  if (!rows.length) return null;

  const section = document.createElement("div");
  section.className = "rehousing-subsection";
  section.innerHTML = "<h4>Donor glass production years</h4>";
  section.append(createDonorYearsTable(rows, "Production years"));
  return section;
}

function createOriginalOpticsYearsSection(lens) {
  const rows = getOriginalOpticsYearRows(lens);
  if (!rows.length) return null;

  const section = document.createElement("div");
  section.className = "rehousing-subsection";
  section.innerHTML = "<h4>Original optics years</h4>";
  section.append(createDonorYearsTable(rows, "Original production years"));
  return section;
}

function createDonorYearsTable(rows, yearsHeading) {
  const table = document.createElement("table");
  table.className = "donor-years-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Lens / donor</th>
        <th>${escapeHtml(yearsHeading)}</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const body = table.querySelector("tbody");
  rows.forEach((item) => {
    const row = document.createElement("tr");
    const lensCell = document.createElement("td");
    const yearsCell = document.createElement("td");
    lensCell.textContent = item.lens;
    yearsCell.textContent = item.years;
    row.append(lensCell, yearsCell);
    body.append(row);
  });

  return table;
}

function getDonorGlassProductionYearRows(lens) {
  return Object.entries(normalizeDonorProductionYearsMap(lens.donorProductionYearsByLens))
    .map(([donorLens, productionYears]) => ({
      lens: safeText(donorLens),
      years: safeText(productionYears)
    }))
    .filter((row) => row.lens && row.years);
}

function getOriginalOpticsYearRows(lens) {
  const seen = new Set();
  return normalizeFocalLengthSpecs(lens)
    .filter((row) => row && typeof row === "object" && !Array.isArray(row))
    .map((row) => ({
      lens: safeText(row.lens),
      years: safeText(row.donorProductionYears)
    }))
    .filter((row) => row.lens && row.years)
    .filter((row) => {
      const key = `${row.lens}::${row.years}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function hasOriginalOpticsYears(lens) {
  return getOriginalOpticsYearRows(lens).length > 0;
}

function hasDonorGlassProductionYears(lens) {
  return getDonorGlassProductionYearRows(lens).length > 0;
}

function createParagraphBlock(content) {
  const wrapper = document.createElement("div");
  wrapper.className = "editorial-block compact";
  toTextItems(content).forEach((item) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = formatListItem(item);
    wrapper.append(paragraph);
  });
  return wrapper;
}

function getMechanicalRehousingText(lens) {
  return [
    lens.rehousingCompany ? `Rehousing company: ${lens.rehousingCompany}` : "",
    lens.rehousingGeneration ? `Generation: ${lens.rehousingGeneration}` : "",
    lens.originalMount ? `Original mount: ${lens.originalMount}` : "",
    lens.donorMount ? `Donor mount: ${lens.donorMount}` : "",
    lens.rehousingInfo
  ].filter(hasValue);
}

function getRehousingNotes(lens) {
  return lens.rehousingNotes || "";
}

function createFocalLengthSpecsSection(specs) {
  if (!hasValue(specs)) return null;
  const rows = specs.filter((spec) => spec && typeof spec === "object" && !Array.isArray(spec));
  if (!rows.length) {
    return state.admin.isAdmin
      ? createDetailSection("Focal length data", createFormatWarning("Focal length data format needs cleanup."))
      : null;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "spec-table-wrap";
  wrapper.innerHTML = `
    <table class="spec-table">
      <thead>
        <tr>
          <th>Lens / donor</th>
          <th>Focal length</th>
          <th>Close focus</th>
          <th>Aperture</th>
          <th>Front Ø</th>
          <th>Format</th>
          <th>Mount</th>
          <th>Length</th>
          <th>Weight</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const body = wrapper.querySelector("tbody");
  rows.forEach((spec) => {
    const row = document.createElement("tr");
    const cells = [
      formatSpecLens(spec),
      formatSpecFocalLength(spec),
      formatSpecCloseFocus(spec),
      formatSpecAperture(spec),
      formatSpecFrontDiameter(spec),
      createSpecFormatCell(spec),
      formatSpecMount(spec),
      formatSpecLength(spec),
      formatSpecWeight(spec),
      formatSpecNotes(spec)
    ];
    cells.forEach((cell) => {
      const td = document.createElement("td");
      if (cell && typeof cell === "object" && cell.nodeType) {
        td.append(cell);
      } else {
        td.textContent = safeText(cell, "—") || "—";
      }
      row.append(td);
    });
    body.append(row);
  });

  return createDetailSection("Focal length data", wrapper);
}

function createFormatWarning(message) {
  const warning = document.createElement("p");
  warning.className = "detail-warning";
  warning.textContent = message;
  return warning;
}

function formatSpecNotes(spec) {
  return [spec.apertureRange ? `Range: ${spec.apertureRange}` : "", spec.notes || ""].filter(Boolean).join(" · ") || "—";
}

function formatSpecLens(spec) {
  return safeText(spec.lens || spec.donorLens || spec.series, "—") || "—";
}

function formatSpecFocalLength(spec) {
  if (hasValue(spec.focalLengthMm)) return `${formatSpecNumber(spec.focalLengthMm)}mm`;
  return safeText(spec.focalLength, "—") || "—";
}

function formatSpecCloseFocus(spec) {
  if (state.unitSystem === "imperial") {
    return safeText(spec.closeFocusFt || spec.closeFocusImperial || spec.closeFocus || spec.minimumMarkedObjectDistance, "—") || "—";
  }
  if (hasValue(spec.closeFocusM)) return `${formatSpecNumber(spec.closeFocusM)}m`;
  return safeText(spec.closeFocus || spec.closeFocusMetric || spec.minimumMarkedObjectDistance, "—") || "—";
}

function formatSpecAperture(spec) {
  return [spec.tStop || spec.maxAperture, spec.fStop].filter(hasValue).join(" / ") || "—";
}

function formatSpecFrontDiameter(spec) {
  if (hasValue(spec.frontDiameterMm)) return `${formatSpecNumber(spec.frontDiameterMm)}mm`;
  return safeText(spec.frontDiameter, "—") || "—";
}

function createSpecFormatCell(spec) {
  const formats = normalizeArrayField(spec.format || spec.coverage);
  if (!formats.length) return safeText(spec.coverage, "—") || "—";
  return createInlineChipList(formats);
}

function formatSpecMount(spec) {
  return safeText(spec.mount, "—") || "—";
}

function formatSpecLength(spec) {
  if (hasValue(spec.lengthMm)) return `${formatSpecNumber(spec.lengthMm)}mm`;
  return safeText(spec.length, "—") || "—";
}

function formatSpecWeight(spec) {
  if (hasValue(spec.weightKg)) return `${formatSpecNumber(spec.weightKg)}kg`;
  return safeText(spec.weight, "—") || "—";
}

function formatSpecNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return safeText(value);
  return Number.isInteger(number) ? String(number) : String(number).replace(/0+$/g, "").replace(/\.$/g, "");
}

function createYoutubeSection(lensOrSamples) {
  const samples = getLensVideoSamples(lensOrSamples);
  if (!samples.length) return null;

  const grid = document.createElement("div");
  grid.className = "youtube-grid";
  samples.forEach((sample, index) => {
    const card = document.createElement("a");
    card.className = "youtube-card";
    card.href = sample.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute("aria-label", sample.label ? `Play ${sample.label}` : `Play sample footage ${index + 1}`);

    const thumb = document.createElement("span");
    thumb.className = "youtube-thumb";
    const thumbnailUrls = [sample.thumbnailUrl, ...(sample.thumbnailFallbackUrls || [])].filter(Boolean);
    if (thumbnailUrls.length) {
      const image = document.createElement("img");
      image.src = thumbnailUrls[0];
      image.alt = "Sample footage thumbnail";
      image.loading = "lazy";
      image.dataset.fallbackIndex = "0";
      image.addEventListener("error", () => {
        const nextIndex = Number(image.dataset.fallbackIndex || 0) + 1;
        if (thumbnailUrls[nextIndex]) {
          image.dataset.fallbackIndex = String(nextIndex);
          image.src = thumbnailUrls[nextIndex];
          return;
        }
        thumb.classList.add("is-thumbnail-missing");
        image.remove();
      });
      thumb.append(image);
    } else {
      thumb.classList.add("is-thumbnail-missing");
    }
    const play = document.createElement("span");
    play.className = "youtube-play";
    play.setAttribute("aria-hidden", "true");
    play.textContent = "Play";
    thumb.append(play);

    card.append(thumb);
    if (sample.label || sample.platform) {
      const meta = document.createElement("span");
      meta.className = "youtube-meta";
      meta.innerHTML = `
        ${sample.label ? `<span class="youtube-label">${escapeHtml(sample.label)}</span>` : ""}
        ${sample.platform ? `<span class="youtube-platform">${escapeHtml(sample.platform)}</span>` : ""}
      `;
      card.append(meta);
    }

    grid.append(card);
  });

  return createDetailSection("Sample footage", grid);
}

function createKnownUseSection(items) {
  if (!hasValue(items)) return null;

  const grid = document.createElement("div");
  grid.className = "known-use-grid";

  toTextItems(items).forEach((item) => {
    const card = document.createElement("article");
    card.className = "known-use-card";

    if (item && typeof item === "object") {
      const heading = document.createElement("div");
      heading.className = "known-use-heading";

      const title = document.createElement("h4");
      title.textContent = safeText(item.title, "Untitled use");
      heading.append(title);

      if (hasValue(item.year)) {
        const year = document.createElement("span");
        year.className = "year-pill";
        year.textContent = safeText(item.year);
        heading.append(year);
      }

      if (shouldShowUseConfidence(item.confidence)) {
        const confidence = document.createElement("span");
        confidence.className = `confidence subtle ${confidenceClass(safeText(item.confidence))}`;
        confidence.textContent = safeText(item.confidence);
        heading.append(confidence);
      }

      card.append(heading);

      if (hasValue(item.role)) {
        const role = document.createElement("p");
        role.className = "known-use-role";
        role.textContent = formatValue(item.role);
        card.append(role);
      }

      if (hasValue(item.notes)) {
        const notes = document.createElement("p");
        notes.className = "known-use-notes";
        notes.textContent = formatValue(item.notes);
        card.append(notes);
      }
    } else {
      const paragraph = document.createElement("p");
      paragraph.className = "known-use-role";
      paragraph.textContent = formatListItem(item);
      card.append(paragraph);
    }

    grid.append(card);
  });

  return createDetailSection("Known use", grid);
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

function createSourcesAndNotesSection(lens) {
  const sources = lens.sources;
  const hasSources = hasValue(sources);
  const hasNotes = hasValue(lens.curationNotes) || hasValue(lens.notes);
  if (!hasSources && !hasNotes) return null;

  const wrapper = document.createElement("div");
  wrapper.className = "sources-notes";

  const sourceLinks = createSourceLinks(sources);
  if (sourceLinks) wrapper.append(sourceLinks);

  [lens.curationNotes, lens.notes].filter(hasValue).forEach((note) => {
    const noteBlock = document.createElement("div");
    noteBlock.className = "editorial-block source-note";
    toTextItems(note).forEach((item) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = formatListItem(item);
      noteBlock.append(paragraph);
    });
    wrapper.append(noteBlock);
  });

  return createDetailSection("Sources", wrapper);
}

function createSourceLinks(sources) {
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

  return wrapper.children.length ? wrapper : null;
}

function createCorrectionFeedbackSection(lens) {
  const section = document.createElement("section");
  section.className = "correction-panel";

  const details = document.createElement("details");
  details.innerHTML = `
    <summary>
      <span>
        <strong>Suggest a correction</strong>
        <small>Found something inaccurate or missing? Send a sourced note.</small>
      </span>
    </summary>
  `;

  const form = document.createElement("form");
  form.className = "correction-form";
  form.innerHTML = `
    <label>
      Your name/email <span>optional</span>
      <input name="reporter" type="text" autocomplete="name">
    </label>
    <label>
      What is wrong?
      <textarea name="issue" rows="4" required></textarea>
    </label>
    <label>
      Suggested correction
      <textarea name="correction" rows="4" required></textarea>
    </label>
    <label>
      Source/link <span>optional</span>
      <input name="source" type="text" inputmode="url">
    </label>
    <label class="review-check">
      <input name="review" type="checkbox" required>
      <span>I understand this will be reviewed before publication.</span>
    </label>
    <button class="secondary-button" type="submit">Open email draft</button>
    <p class="correction-status" aria-live="polite"></p>
  `;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const mailto = buildCorrectionMailto(lens, form);
    form.dataset.lastMailto = mailto;
    const status = form.querySelector(".correction-status");
    status.textContent = "Your email app should open with the correction details. Please send the email to submit it.";
    window.location.href = mailto;
  });

  details.append(form);
  section.append(details);
  return section;
}

function buildCorrectionMailto(lens, form) {
  const data = new FormData(form);
  const subject = `LensWiki correction: ${lens.name}`;
  const body = [
    `Lens name: ${lens.name}`,
    `Lens id: ${lens.id || ""}`,
    `Page URL: ${window.location.href}`,
    `Submitted at: ${new Date().toISOString()}`,
    "",
    `Reporter contact: ${safeText(data.get("reporter")) || "Not provided"}`,
    "",
    "What is wrong:",
    safeText(data.get("issue")),
    "",
    "Suggested correction:",
    safeText(data.get("correction")),
    "",
    `Source/link: ${safeText(data.get("source")) || "Not provided"}`
  ].join("\n");

  return `mailto:info@tvlmedia.nl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
  const {
    searchText,
    sourceFile,
    videoSamples,
    _isRehousedExplicit,
    _recordSource,
    _supabaseUpdatedAt,
    ...exportable
  } = lens;
  if (hasOwn(exportable, "donorProductionYearsByLens")) {
    if (exportable.donorProductionYearsByLens === null) {
      exportable.donorProductionYearsByLens = null;
    } else {
      const donorProductionYearsByLens = normalizeDonorProductionYearsMap(exportable.donorProductionYearsByLens);
      if (Object.keys(donorProductionYearsByLens).length) {
        exportable.donorProductionYearsByLens = donorProductionYearsByLens;
      } else {
        delete exportable.donorProductionYearsByLens;
      }
    }
  }
  return exportable;
}

function getFilteredLenses() {
  return state.lenses.filter((lens) => {
    const era = getDecade(lens.yearIntroduced);
    const haystack = buildSearchText(lens);
    const matchesSearch = !state.filters.search || haystack.includes(state.filters.search);
    const matchesEra = state.filters.era === "all" || era === state.filters.era;
    const matchesManufacturer = state.filters.manufacturer === "all" || lens.manufacturer === state.filters.manufacturer;
    const matchesType = matchesCuratedFilter(buildTypeFilterText(lens), state.filters.type, TYPE_FILTERS);
    const matchesFormat = matchesCuratedFilter(buildFormatFilterText(lens), state.filters.format, FORMAT_FILTERS);
    const matchesImportance = state.filters.importance === "all" || lens.importance === state.filters.importance;
    const matchesTag = state.filters.tag === "all" || lens.characteristics.includes(state.filters.tag);
    const matchesLineage = state.filters.lineage === "all" || lens.lineage === state.filters.lineage;
    const matchesRehousedOnly = !state.filters.rehousedOnly || lens.isRehoused === true;

    return matchesSearch && matchesEra && matchesManufacturer && matchesType && matchesFormat && matchesImportance && matchesTag && matchesLineage && matchesRehousedOnly;
  });
}

function matchesCuratedFilter(text, selectedValues, options) {
  if (!selectedValues.length) return true;
  const haystack = normalizeMatchText(text);

  return selectedValues.some((value) => {
    const option = options.find((item) => item.value === value);
    if (!option) return false;
    return option.terms.some((term) => matchTerm(haystack, term));
  });
}

function normalizeMatchText(value) {
  const spaced = safeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    spaced: ` ${spaced} `,
    compact: spaced.replace(/\s+/g, "")
  };
}

function matchTerm(haystack, term) {
  const normalized = normalizeMatchText(term);
  const token = normalized.spaced.trim();
  if (!token) return false;
  if (token === "full frame") {
    return hasPositivePhrase(haystack.spaced, token);
  }
  if (token.length <= 2) {
    return haystack.spaced.includes(` ${token} `);
  }
  return haystack.spaced.includes(` ${token} `) || haystack.compact.includes(normalized.compact);
}

function hasPositivePhrase(spacedText, phrase) {
  const words = spacedText.trim().split(/\s+/);
  const phraseWords = phrase.split(/\s+/);
  for (let index = 0; index <= words.length - phraseWords.length; index += 1) {
    const candidate = words.slice(index, index + phraseWords.length).join(" ");
    if (candidate !== phrase) continue;
    const previousWords = words.slice(Math.max(0, index - 3), index);
    if (previousWords.some((word) => ["not", "no", "non"].includes(word))) continue;
    return true;
  }
  return false;
}

function buildTypeFilterText(lens) {
  return [
    lens.type,
    lens.isRehoused ? "rehoused" : "",
    lens.characteristics,
    lens.timelineCategory,
    lens.cardLabel,
    lens.publicSummary,
    lens.lookSummary
  ].flat().filter(Boolean).join(" ");
}

function buildFormatFilterText(lens) {
  return [
    lens.coverage,
    lens.formatCoverageNotes,
    lens.type,
    lens.characteristics,
    lens.timelineCategory,
    lens.cardLabel,
    lens.publicSummary,
    lens.lookSummary
  ].flat().filter(Boolean).join(" ");
}

function buildSearchText(lens) {
  const text = [
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
    lens.isRehoused ? "rehoused" : "",
    lens.donorLens,
    lens.rehousingInfo,
    lens.originalMount,
    lens.donorMount,
    lens.rehousingCompany,
    lens.rehousingGeneration,
    lens.rehousingNotes,
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
  return `${text} ${text.replace(/[-/]/g, " ")}`;
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

function populateMultiSelect(container, allLabel, options, selectedValues) {
  const selected = new Set(selectedValues);
  const optionWrap = container.querySelector(".multi-select-options");
  optionWrap.innerHTML = "";

  options.forEach((option) => {
    const label = document.createElement("label");
    label.className = "multi-option";
    label.innerHTML = `
      <input type="checkbox" value="${escapeHtml(option.value)}">
      <span>${escapeHtml(option.label)}</span>
    `;
    label.querySelector("input").checked = selected.has(option.value);
    optionWrap.append(label);
  });

  container.dataset.allLabel = allLabel;
  updateMultiSelectSummary(container);
}

function getCheckedValues(container) {
  return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
}

function updateMultiSelectSummary(container) {
  const selectedLabels = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
    .map((input) => input.closest("label").querySelector("span").textContent);
  container.querySelector("summary span").textContent = selectedLabels.length ? selectedLabels.join(", ") : container.dataset.allLabel;
}

function resetMultiSelect(container, filterKey) {
  container.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.checked = false;
  });
  state.filters[filterKey] = [];
  updateMultiSelectSummary(container);
  container.open = false;
}

function getPublicSummary(lens) {
  return lens.publicSummary || lens.cardLabel || lens.lookSummary || "";
}

function getOverviewSummary(lens) {
  return lens.publicSummary || lens.cardLabel || "";
}

function getCategory(lens) {
  return lens.timelineCategory || lens.cardLabel || lens.designFamily || lens.type[0] || "";
}

function getCardLabel(lens) {
  return lens.cardLabel || lens.timelineCategory || lens.designFamily || lens.type[0] || "";
}

function getCardCoverage(lens) {
  const coverage = safeText(lens.coverage);
  if (!coverage) return "";
  return coverage.length > 74 ? `${coverage.slice(0, 71).trim()}...` : coverage;
}

function getKeySpecCoverage(lens) {
  if (lens.id === "2024-ironglass-soviet-mkii") {
    return "Rated as FF, with many focal lengths covering medium format.\nCheck the table below for exact coverage.";
  }

  return lens.coverage;
}

function shouldShowRehousingSection(lens) {
  if (lens.isRehoused === true) {
    return hasValue(lens.donorLens)
      || hasValue(lens.rehousingInfo)
      || hasValue(lens.originalMount)
      || hasValue(lens.donorMount)
      || hasValue(lens.rehousingCompany)
      || hasValue(lens.rehousingGeneration)
      || hasValue(lens.rehousingNotes)
      || hasDonorGlassProductionYears(lens)
      || hasOriginalOpticsYears(lens);
  }
  if (lens._isRehousedExplicit) return false;
  return (hasValue(lens.donorLens) || hasValue(lens.rehousingInfo) || hasDonorGlassProductionYears(lens) || hasOriginalOpticsYears(lens)) && hasRehousingEvidence(lens);
}

function shouldShowRehousingInfo(lens) {
  if (!shouldShowRehousingSection(lens)) return false;
  return hasValue(getMechanicalRehousingText(lens));
}

function hasRehousingEvidence(lens) {
  const rehousingEvidence = [
    lens.isRehoused ? "rehoused" : "",
    lens.rehousingInfo,
    lens.rehousingCompany,
    lens.rehousingGeneration,
    lens.lineage,
    lens.timelineCategory,
    lens.cardLabel,
    lens.type
  ].flat().filter(Boolean).join(" ").toLowerCase();

  return rehousingEvidence.includes("rehous");
}

function formatArchiveMakerLine(lens) {
  return [lens.manufacturer, getCategory(lens)].filter(Boolean).join(" / ");
}

function formatYear(lens) {
  if (!lens.yearIntroduced) return "";
  return `${lens.yearApproximate ? "c. " : ""}${lens.yearIntroduced}`;
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = safeText(value).toLowerCase();
  if (["true", "yes", "1", "on"].includes(normalized)) return true;
  if (["false", "no", "0", "off"].includes(normalized)) return false;
  return Boolean(value);
}

function typeSuggestsRehoused(type) {
  return normalizeArrayField(type, getArrayFieldOptions("type")).some((item) => {
    const normalized = normalizeMatchText(item);
    return normalized.compact.includes("rehoused") || normalized.compact.includes("rehousedcine");
  });
}

function shouldShowTitleConfidence(confidence) {
  return safeText(confidence).toLowerCase() === "needs verification";
}

function shouldShowUseConfidence(confidence) {
  const normalized = safeText(confidence).toLowerCase();
  return Boolean(normalized) && !["verified", "high"].includes(normalized);
}

function cleanMountsForDisplay(value) {
  const mounts = [];
  normalizeArrayField(value).forEach((item) => {
    const text = safeText(item);
    if (!text || isMountMechanismNote(text)) return;
    extractMountLabels(text).forEach((label) => {
      if (label && !mounts.some((existing) => existing.toLowerCase() === label.toLowerCase())) {
        mounts.push(label);
      }
    });
  });
  return mounts;
}

function isMountMechanismNote(value) {
  return /\b(adapter|custom|depending|mechanic|order|option|rehous|system|varies|verify)\b/i.test(value);
}

function extractMountLabels(value) {
  const text = safeText(value)
    .replace(/\bshimmable\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return [];

  const pieces = text.split(/\s*(?:\/|,|\bor\b|\band\b)\s*/i).map((piece) => piece.trim()).filter(Boolean);
  return pieces.map(normalizeMountLabel).filter(Boolean);
}

function normalizeMountLabel(value) {
  const text = safeText(value)
    .replace(/[-–—]?\s*mounts?$/i, "")
    .replace(/\bmounts?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";

  const knownMounts = [
    [/^(arri\s+)?pl$/i, "PL"],
    [/^lpl$/i, "LPL"],
    [/^(canon\s+)?ef$/i, "EF"],
    [/^(sony\s+)?e$/i, "E"],
    [/^(canon\s+)?rf$/i, "RF"],
    [/^(leica\s+)?l$/i, "L"],
    [/^(leica\s+)?m$/i, "Leica M"],
    [/^(leica\s+)?r$/i, "Leica R"],
    [/^m42$/i, "M42"],
    [/^m39$/i, "M39"],
    [/^(nikon\s+)?f$/i, "Nikon F"],
    [/^(canon\s+)?fd$/i, "Canon FD"],
    [/^bncr?$/i, "BNCR"],
    [/^b(?:\s*mount)?$/i, "B-mount"],
    [/^c(?:\s*mount)?$/i, "C-mount"],
    [/^d(?:\s*mount)?$/i, "D-mount"],
    [/^mft$/i, "MFT"],
    [/^oct[-\s]?18$/i, "OCT-18"],
    [/^oct[-\s]?19$/i, "OCT-19"],
    [/^panavision\s+pv$/i, "Panavision PV"],
    [/^pv$/i, "Panavision PV"],
    [/^arri\s+standard$/i, "ARRI Standard"],
    [/^arri\s+bayonet$/i, "ARRI Bayonet"]
  ];

  const known = knownMounts.find(([pattern]) => pattern.test(text));
  return known ? known[1] : text;
}

function formatValue(value) {
  if (isChipValue(value)) return value.items.map(formatListItem).join(", ");
  if (Array.isArray(value)) return value.map(formatListItem).join(", ");
  if (value && typeof value === "object") return formatListItem(value);
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

function serializeEditValue(value, type, key = "") {
  if (!hasValue(value)) return "";
  if (key === "youtubeEmbeds") {
    return normalizeYouTubeSamples(value).join("\n");
  }
  if (type === "list") {
    return normalizeArrayField(value, getArrayFieldOptions(key, type)).map(formatListItem).join(", ");
  }
  if (type === "lines") {
    return normalizeArrayField(value, getArrayFieldOptions(key, type)).map(formatListItem).join("\n");
  }
  if (type === "structured") {
    const items = asArray(value);
    if (items.some((item) => item && typeof item === "object")) {
      return JSON.stringify(items, null, 2);
    }
    return items.map(formatListItem).join("\n");
  }
  if (type === "object") {
    const normalized = normalizeDonorProductionYearsMap(value);
    return hasValue(Object.keys(normalized)) ? JSON.stringify(normalized, null, 2) : "";
  }
  return formatValue(value);
}

function parseEditValue(value, type, key) {
  if (type === "number") {
    return numberOrNull(value);
  }
  if (key === "youtubeEmbeds") {
    return normalizeYouTubeSamples(value);
  }
  if (NORMALIZED_ARRAY_FIELDS.has(key)) {
    return normalizeArrayField(value, getArrayFieldOptions(key, type));
  }
  if (type === "list") {
    return splitCommaList(value);
  }
  if (type === "lines") {
    return splitLines(value);
  }
  if (type === "structured") {
    return parseStructuredEditValue(value, key);
  }
  if (type === "object") {
    return parseObjectEditValue(value, key);
  }
  return value;
}

function parseJsonPatchInput(rawInput) {
  const raw = safeText(rawInput);
  if (!raw) {
    return { error: "Could not parse JSON. Check brackets, commas and quotes." };
  }

  const attempts = [raw];
  if (!raw.startsWith("{")) {
    attempts.push(`{${raw.replace(/,\s*$/g, "")}}`);
  }

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { value: parsed };
      }
    } catch (_error) {
      // Try the next shape.
    }
  }

  return { error: "Could not parse JSON. Check brackets, commas and quotes." };
}

function prepareLensJsonPatch(patchObject, currentLens) {
  const current = stripRuntimeLensFields(currentLens || {});
  const normalizedPatch = normalizePastedLensJson(patchObject);
  const patchLens = isLikelyFullLensJson(normalizedPatch)
    ? buildLensReplacement(current, normalizedPatch)
    : deepMergeJsonObject(current, normalizedPatch);
  const previewKeys = getJsonPatchPreviewKeys(current, patchLens, normalizedPatch);
  const preview = previewKeys
    .filter((key) => !jsonValuesEqual(current[key], patchLens[key]))
    .map((key) => ({
      key,
      label: getLensFieldLabel(key),
      currentDisplay: formatPatchPreviewValue(current[key]),
      nextDisplay: formatPatchPreviewValue(patchLens[key])
    }));
  const diagnostics = getJsonPatchDiagnostics(patchLens, normalizedPatch);

  return {
    error: preview.length ? "" : "No changes to apply.",
    ignored: [],
    patchLens,
    preview,
    typeSummary: diagnostics.typeSummary,
    warnings: diagnostics.warnings
  };
}

function normalizePastedLensJson(patchObject) {
  const normalized = stripRuntimeLensFields(cloneJsonValue(patchObject) || {});
  if (!hasOwn(normalized, "isRehoused") && hasOwn(normalized, "type")) {
    const type = normalizeArrayField(normalized.type, getArrayFieldOptions("type"));
    if (typeSuggestsRehoused(type)) {
      normalized.isRehoused = true;
    }
  }
  return normalized;
}

function isLikelyFullLensJson(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  const hasIdentity = hasValue(value.id) || hasValue(value.slug);
  if (hasIdentity && hasValue(value.name)) return true;
  if (hasIdentity && keys.length >= 4) return true;
  return hasValue(value.name) && hasValue(value.yearIntroduced) && keys.length >= 4;
}

function buildLensReplacement(currentLens, replacement) {
  const next = { ...stripRuntimeLensFields(replacement) };
  if (!hasValue(next.id)) next.id = currentLens.id;
  if (!hasValue(next.slug)) next.slug = currentLens.slug || slugify(next.id);
  if (!hasValue(next.fileName)) next.fileName = currentLens.fileName || (next.slug ? `${next.slug}.json` : "");
  return next;
}

function deepMergeJsonObject(base, patch) {
  const next = cloneJsonValue(base) || {};
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(next[key])) {
      next[key] = deepMergeJsonObject(next[key], value);
      return;
    }
    next[key] = cloneJsonValue(value);
  });
  return next;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cloneJsonValue(value) {
  if (value === undefined) return undefined;
  try {
    return structuredClone(value);
  } catch (_error) {
    return JSON.parse(JSON.stringify(value));
  }
}

function stripRuntimeLensFields(lens) {
  const {
    searchText,
    sourceFile,
    videoSamples,
    _isRehousedExplicit,
    _recordSource,
    _supabaseUpdatedAt,
    ...exportable
  } = cloneJsonValue(lens || {});
  return exportable;
}

function getJsonPatchPreviewKeys(currentLens, patchLens, patchObject) {
  const keys = isLikelyFullLensJson(patchObject)
    ? [...Object.keys(currentLens || {}), ...Object.keys(patchLens || {})]
    : Object.keys(patchObject || {});
  return Array.from(new Set(keys));
}

function jsonValuesEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function getLensFieldLabel(key) {
  const field = ADMIN_EDIT_FIELDS.find((item) => item.key === key);
  if (field) return field.label;
  return safeText(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getJsonPatchDiagnostics(lens, patchObject) {
  const typeSummary = [];
  const warnings = [];
  const fieldsToDescribe = Array.from(new Set([
    ...FOCAL_LENGTH_SPECS_FIELDS.filter((fieldName) => hasOwn(patchObject, fieldName)),
    ...["sampleFootage", "cineflares", "donorProductionYearsByLens"].filter((fieldName) => hasOwn(patchObject, fieldName))
  ]));

  fieldsToDescribe.forEach((fieldName) => {
    const value = fieldName === "focalLengthSpecs"
      ? lens.focalLengthSpecs
      : patchObject[fieldName];
    typeSummary.push(`${fieldName}: ${describeJsonValueType(value)}`);
  });

  const touchedFocalSpecs = FOCAL_LENGTH_SPECS_FIELDS.some((fieldName) => hasOwn(patchObject, fieldName));
  const specs = lens.focalLengthSpecs;
  if (touchedFocalSpecs && Array.isArray(specs) && specs.length && !hasObjectRows(specs)) {
    warnings.push("focalLengthSpecs is malformed: expected array of objects.");
  }

  if (hasOwn(patchObject, "sampleFootage") && !Array.isArray(patchObject.sampleFootage)) {
    warnings.push("sampleFootage is expected to be an array.");
  }

  if (
    hasOwn(patchObject, "donorProductionYearsByLens")
    && (!isPlainObject(patchObject.donorProductionYearsByLens))
  ) {
    warnings.push("donorProductionYearsByLens is expected to be an object.");
  }

  return { typeSummary, warnings };
}

function describeJsonValueType(value) {
  if (Array.isArray(value)) {
    const objectRows = value.filter((item) => item && typeof item === "object" && !Array.isArray(item)).length;
    return objectRows ? `array with ${objectRows} object row${objectRows === 1 ? "" : "s"}` : `array with ${value.length} item${value.length === 1 ? "" : "s"}`;
  }
  if (value === null) return "null";
  if (value && typeof value === "object") return "object";
  return typeof value;
}

function formatPatchPreviewValue(value) {
  let text = "";
  if (value === null) {
    text = "null";
  } else if (value && typeof value === "object") {
    try {
      text = JSON.stringify(value, null, 2);
    } catch (_error) {
      text = formatValue(value);
    }
  } else {
    text = safeText(value);
  }
  return text.length > 260 ? `${text.slice(0, 257).trim()}...` : text;
}

function parseStructuredEditValue(value, key) {
  if (!value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (_error) {
    if (["sources", "youtubeEmbeds", "relatedLensIds"].includes(key)) {
      return splitLines(value);
    }
    return splitLines(value);
  }
}

function parseObjectEditValue(value, key) {
  if (!safeText(value)) return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      if (key === "donorProductionYearsByLens") return normalizeDonorProductionYearsMap(parsed);
      return parsed;
    }
  } catch (_error) {
    // Keep object fields conservative: invalid JSON becomes an empty map.
  }
  return {};
}

function splitCommaList(value) {
  return normalizeArrayField(value, { separator: "commas" });
}

function splitLines(value) {
  return normalizeArrayField(value, { separator: "lines" });
}

function normalizeYouTubeSamples(value) {
  return getYouTubeSamples(value).map((sample) => sample.url);
}

function getLensVideoSamples(value) {
  if (!value) return [];

  if (Array.isArray(value) || typeof value === "string") {
    return getYouTubeSamples(value);
  }

  if (typeof value !== "object") return [];

  const samples = [];
  const seen = new Set();
  VIDEO_SAMPLE_FIELDS.forEach((fieldName) => {
    getYouTubeSamples(value[fieldName]).forEach((sample) => {
      const key = sample.id || sample.url;
      if (!key || seen.has(key)) return;
      seen.add(key);
      samples.push(sample);
    });
  });

  return samples;
}

function getYouTubeSamples(value) {
  const urls = [];
  const seen = new Set();
  normalizeArrayField(value, { fieldName: "youtubeEmbeds", separator: "lines", preserveObjects: true }).forEach((item) => {
    const sample = getYouTubeSample(item);
    const key = sample?.id || sample?.url;
    if (!sample || !key || seen.has(key)) return;
    seen.add(key);
    urls.push(sample);
  });
  return urls;
}

function getYouTubeSample(value) {
  let source = value;
  let label = "";
  let platform = "";
  let thumbnailUrl = "";
  if (value && typeof value === "object") {
    source = value.url
      || value.href
      || value.videoUrl
      || value.link
      || value.watchUrl
      || value.embedUrl
      || value.youtubeUrl
      || value.youtubeId
      || value.videoId
      || value.id
      || "";
    label = safeText(value.label || value.title || value.name);
    platform = safeText(value.platform || value.source || value.provider);
    thumbnailUrl = normalizeMediaUrl(value.thumbnailUrl || value.thumbnail || value.imageUrl || value.image || value.poster);
  }

  const raw = cleanArrayItem(source);
  if (!raw) return null;

  const iframeSrc = raw.match(/\bsrc=["']([^"']+)["']/i)?.[1];
  let text = normalizeMediaUrl(iframeSrc || raw);
  const id = extractYouTubeId(text);
  if (id) return buildYouTubeSample(id, { label, platform, thumbnailUrl, url: text });
  if (thumbnailUrl) return buildVideoSample(text, { label, platform, thumbnailUrl });
  return null;
}

function extractYouTubeId(value) {
  const text = normalizeMediaUrl(value);
  if (!text) return "";

  const plainId = text.match(/^[A-Za-z0-9_-]{11}$/)?.[0];
  if (plainId) return plainId;

  try {
    const url = new URL(text);
    const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
    const parts = url.pathname.split("/").filter(Boolean);
    if (host === "youtu.be") {
      return normalizeYouTubeId(parts[0] || "");
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.searchParams.has("v")) {
        return normalizeYouTubeId(url.searchParams.get("v") || "");
      }
      if (["embed", "shorts", "live"].includes(parts[0])) {
        return normalizeYouTubeId(parts[1] || "");
      }
    }
  } catch (_error) {
    const embeddedId = text.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/i)?.[1];
    return normalizeYouTubeId(embeddedId);
  }

  return "";
}

function normalizeYouTubeId(value) {
  return safeText(value).split(/[?&#/]/)[0].replace(/[^A-Za-z0-9_-]/g, "");
}

function normalizeMediaUrl(value) {
  let text = cleanArrayItem(value);
  if (!text) return "";
  if (text.startsWith("//")) {
    text = `https:${text}`;
  }
  if (/^(www\.|m\.)?youtube\.com|^youtu\.be|^img\.youtube\.com/i.test(text)) {
    text = `https://${text}`;
  }
  return text;
}

function buildYouTubeSample(id, options = {}) {
  const platform = options.platform || "YouTube";
  const generatedThumbnails = [
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
  ];
  const thumbnailUrls = options.thumbnailUrl
    ? [options.thumbnailUrl, ...generatedThumbnails]
    : generatedThumbnails;

  return {
    id,
    label: options.label || "",
    platform,
    url: options.url || `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube.com/embed/${id}`,
    thumbnailUrl: thumbnailUrls[0],
    thumbnailFallbackUrls: thumbnailUrls.slice(1)
  };
}

function buildVideoSample(url, options = {}) {
  return {
    id: url,
    label: options.label || "",
    platform: options.platform || "",
    url,
    embedUrl: "",
    thumbnailUrl: options.thumbnailUrl
  };
}

function getArrayFieldOptions(fieldName = "", fieldType = "") {
  return {
    fieldName,
    separator: getArrayFieldSeparator(fieldName, fieldType),
    preserveObjects: fieldType === "structured"
  };
}

function getArrayFieldSeparator(fieldName = "", fieldType = "") {
  if (fieldType === "lines" || LINE_ARRAY_FIELDS.has(fieldName)) return "lines";
  if (fieldType === "list" || COMMA_ARRAY_FIELDS.has(fieldName)) return "commas";
  return "";
}

function normalizeArrayField(value, options = {}) {
  if (Array.isArray(value)) {
    if (options.preserveObjects && value.some((item) => item && typeof item === "object")) {
      return value.map((item) => (item && typeof item === "object" ? item : cleanArrayItem(item))).filter(Boolean);
    }
    const rawItems = value.map((item) => (item && typeof item === "object" ? formatListItem(item) : safeText(item)));
    if (rawItems.some(hasJsonArraySyntaxArtifact)) {
      return normalizeArrayField(rawItems.join(", "), options);
    }
    return rawItems.map(cleanArrayItem).filter((item) => item && !isJsonSyntaxOnly(item));
  }

  const text = safeText(value);
  if (!text) return [];

  const trimmed = stripJsonPropertyPrefix(stripWrappingQuotes(text)
    .replace(/,\s*\]$/g, "]")
    .trim());

  const parsedObjectArray = parseObjectArraySnippet(trimmed, options.fieldName);
  if (parsedObjectArray) {
    return normalizeArrayField(parsedObjectArray, options);
  }

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return normalizeArrayField(parsed, options);
      }
    } catch (_error) {
      // Fall through to forgiving cleanup for previously saved malformed values.
    }
  }

  const unwrapped = trimmed
    .replace(/^\[+/, "")
    .replace(/\]+$/, "")
    .replace(/,\s*$/g, "");

  const separatorMode = options.separator || getArrayFieldSeparator(options.fieldName);
  const separator = separatorMode === "lines" ? /\r?\n/ : /,|\r?\n/;
  return unwrapped
    .split(separator)
    .map(cleanArrayItem)
    .filter(Boolean);
}

function cleanArrayItem(value) {
  if (value && typeof value === "object") return formatListItem(value);
  const cleaned = stripWrappingQuotes(stripJsonPropertyPrefix(safeText(value)
    .replace(/^\[+/, "")
    .replace(/\]+$/, "")
    .replace(/^\\?["']+/, "")
    .replace(/\\?["']+$/, "")
    .replace(/,\s*$/g, "")
    .trim()));
  return isJsonSyntaxOnly(cleaned) ? "" : cleaned;
}

function cleanLensArrayFields(lens) {
  const cleaned = { ...lens };
  NORMALIZED_ARRAY_FIELDS.forEach((fieldName) => {
    if (hasValue(cleaned[fieldName])) {
      if (fieldName === "youtubeEmbeds") {
        cleaned[fieldName] = normalizeYouTubeSamples(cleaned[fieldName]);
        return;
      }
      const field = getAdminEditField(fieldName);
      cleaned[fieldName] = normalizeArrayField(cleaned[fieldName], getArrayFieldOptions(fieldName, field?.type));
    }
  });
  return cleaned;
}

function getAdminEditField(fieldName) {
  return ADMIN_EDIT_FIELDS.find((field) => field.key === fieldName);
}

function stripJsonPropertyPrefix(value) {
  const text = safeText(value).trim();
  const match = text.match(/^\s*(?:"([A-Za-z][A-Za-z0-9_-]*)"|'([A-Za-z][A-Za-z0-9_-]*)'|([A-Za-z][A-Za-z0-9_-]*))\s*:\s*/u);
  if (!match) return text;

  const fieldName = match[1] || match[2] || match[3] || "";
  if (!isKnownLensFieldName(fieldName)) return text;

  return text.slice(match[0].length).trim();
}

function parseObjectArraySnippet(value, preferredFieldName = "") {
  const text = safeText(value);
  if (!text.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    if (preferredFieldName && Array.isArray(parsed[preferredFieldName])) return parsed[preferredFieldName];
    const firstArray = Object.values(parsed).find(Array.isArray);
    return firstArray || null;
  } catch (_error) {
    return null;
  }
}

function hasJsonArraySyntaxArtifact(value) {
  const text = safeText(value);
  return looksLikeJsonPropertyPrefix(text)
    || text === "["
    || text === "]"
    || isJsonSyntaxOnly(text)
    || /^\[/.test(text)
    || /\]$/.test(text);
}

function looksLikeJsonPropertyPrefix(value) {
  const text = safeText(value);
  const match = text.match(/^\s*(?:"([A-Za-z][A-Za-z0-9_-]*)"|'([A-Za-z][A-Za-z0-9_-]*)'|([A-Za-z][A-Za-z0-9_-]*))\s*:/u);
  const fieldName = match?.[1] || match?.[2] || match?.[3] || "";
  return Boolean(fieldName && isKnownLensFieldName(fieldName));
}

function isKnownLensFieldName(fieldName) {
  return NORMALIZED_ARRAY_FIELDS.has(fieldName)
    || VIDEO_SAMPLE_FIELDS.includes(fieldName)
    || ADMIN_EDIT_FIELDS.some((field) => field.key === fieldName);
}

function isJsonSyntaxOnly(value) {
  const text = stripWrappingQuotes(value);
  return Boolean(text) && /^[\[\]\{\}",:'\s,]+$/.test(text);
}

function stripWrappingQuotes(value) {
  let text = safeText(value).trim();
  while (
    text.length >= 2
    && ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))
  ) {
    text = text.slice(1, -1).trim();
  }
  return text.replace(/\\"/g, '"').replace(/\\'/g, "'");
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

function toTextItems(value) {
  if (Array.isArray(value)) return value.filter(hasValue);
  return hasValue(value) ? [value] : [];
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

function normalizeCineFlares(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { available: false, url: "" };
  }

  const available = parseBoolean(value.available);
  return {
    available,
    url: available ? safeText(value.url, "https://lenses.cineflares.com/") : safeText(value.url)
  };
}

function normalizeDonorProductionYearsMap(value) {
  let source = value;
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch (_error) {
      return {};
    }
  }
  if (!source || typeof source !== "object" || Array.isArray(source)) return {};

  return Object.entries(source).reduce((map, [donorLens, productionYears]) => {
    const lensName = safeText(donorLens);
    const years = safeText(productionYears);
    if (lensName && years) {
      map[lensName] = years;
    }
    return map;
  }, {});
}

function confidenceClass(confidence) {
  return confidence.replace(/\s+/g, "-");
}

function safeText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function normalizeSearchValue(value) {
  return safeText(value).toLowerCase();
}

function getMatchingQuickChip(searchValue) {
  if (!els.quickChips || !searchValue) return "";
  const match = Array.from(els.quickChips.querySelectorAll("[data-query]"))
    .find((chip) => normalizeSearchValue(chip.dataset.query || chip.textContent) === searchValue);
  return match ? normalizeSearchValue(match.dataset.query || match.textContent) : "";
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
  return getYouTubeSample(value)?.embedUrl || "";
}

function escapeHtml(value) {
  return safeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
