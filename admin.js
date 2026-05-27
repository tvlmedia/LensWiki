(() => {
  const NORMALIZED_ARRAY_FIELDS = new Set([
    "mounts",
    "focalLengths",
    "tStops",
    "characteristics",
    "type",
    "strengths",
    "weaknesses",
    "closeFocus",
    "sources",
    "famousUses",
    "focalLengthSpecs"
  ]);
  const REHOUSING_FIELD_KEYS = new Set([
    "donorLens",
    "rehousingInfo",
    "originalMount",
    "donorMount",
    "rehousingCompany",
    "rehousingGeneration",
    "rehousingNotes"
  ]);

  const LENS_FIELDS = [
    { key: "id", label: "Lens ID", type: "text", required: true },
    { key: "slug", label: "Slug", type: "text" },
    { key: "manufacturer", label: "Maker / brand", type: "text" },
    { key: "name", label: "Lens name", type: "text", required: true },
    { key: "yearIntroduced", label: "Year introduced", type: "number", required: true },
    { key: "yearApproximate", label: "Approximate year", type: "checkbox" },
    { key: "isRehoused", label: "Rehoused lens", type: "toggle" },
    { key: "status", label: "Publication status", type: "text" },
    { key: "importance", label: "Importance", type: "text" },
    { key: "confidence", label: "Confidence", type: "text" },
    { key: "timelineCategory", label: "Timeline category", type: "text" },
    { key: "cardLabel", label: "Short archive label", type: "text" },
    { key: "publicSummary", label: "Overview", type: "textarea" },
    { key: "lookSummary", label: "Look", type: "textarea" },
    { key: "productionYears", label: "Production years", type: "text" },
    { key: "country", label: "Country", type: "text" },
    { key: "type", label: "Type", type: "list" },
    { key: "characteristics", label: "Tags / character", type: "list" },
    { key: "coverage", label: "Coverage", type: "text" },
    { key: "mounts", label: "Mounts", type: "list" },
    { key: "focalLengths", label: "Focal lengths", type: "list" },
    { key: "tStops", label: "T-stops / F-stops", type: "list" },
    { key: "closeFocus", label: "Close focus", type: "list" },
    { key: "seriesHistory", label: "History / series history", type: "lines" },
    { key: "strengths", label: "Strengths", type: "lines" },
    { key: "weaknesses", label: "Weaknesses", type: "lines" },
    { key: "donorLens", label: "Donor lens", type: "text" },
    { key: "rehousingInfo", label: "Rehousing info", type: "textarea" },
    { key: "originalMount", label: "Original mount", type: "text" },
    { key: "donorMount", label: "Donor mount", type: "text" },
    { key: "rehousingCompany", label: "Rehousing company", type: "text" },
    { key: "rehousingGeneration", label: "Rehousing generation", type: "text" },
    { key: "rehousingNotes", label: "Rehousing notes", type: "textarea" },
    { key: "famousUses", label: "Known use", type: "structured" },
    { key: "sources", label: "Sources", type: "structured" },
    { key: "focalLengthSpecs", label: "Focal length specs", type: "structured" },
    { key: "notes", label: "Notes", type: "textarea" }
  ];

  const els = {
    accessCard: document.querySelector("#adminAccessCard"),
    accessCopy: document.querySelector("#accessCopy"),
    accessKicker: document.querySelector("#accessKicker"),
    accessTitle: document.querySelector("#accessTitle"),
    adminView: document.querySelector("#adminView"),
    configNotice: document.querySelector("#configNotice"),
    copyAllJsonButton: document.querySelector("#copyAllJsonButton"),
    copyFallback: document.querySelector("#adminCopyFallback"),
    copyTextarea: document.querySelector("#adminCopyTextarea"),
    dashboard: document.querySelector("#adminDashboard"),
    dashboardStatus: document.querySelector("#dashboardStatus"),
    emailInput: document.querySelector("#emailInput"),
    editorPanel: document.querySelector("#editorPanel"),
    importButton: document.querySelector("#importButton"),
    importFile: document.querySelector("#importFile"),
    importPanel: document.querySelector("#importPanel"),
    importPreviewButton: document.querySelector("#importPreviewButton"),
    importRunButton: document.querySelector("#importRunButton"),
    importStatus: document.querySelector("#importStatus"),
    importTextarea: document.querySelector("#importTextarea"),
    loginButton: document.querySelector("#loginButton"),
    loginForm: document.querySelector("#loginForm"),
    loginView: document.querySelector("#loginView"),
    logoutButton: document.querySelector("#logoutButton"),
    newLensButton: document.querySelector("#newLensButton"),
    passwordInput: document.querySelector("#passwordInput"),
    recordsList: document.querySelector("#supabaseRecordsList"),
    statusMessage: document.querySelector("#statusMessage"),
    supabaseRecordCount: document.querySelector("#supabaseRecordCount")
  };

  const config = {
    url: window.LENSWIKI_SUPABASE_URL || "",
    anonKey: window.LENSWIKI_SUPABASE_ANON_KEY || ""
  };

  const state = {
    client: null,
    currentUser: null,
    isAdmin: false,
    records: [],
    importRecords: [],
    editorDraft: null
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    bindEvents();

    if (isMissingConfig(config)) {
      els.configNotice.hidden = false;
      els.configNotice.textContent = "Admin configuration missing.";
      showLoginView({ disabled: true });
      return;
    }

    if (!isValidSupabaseUrl(config.url) || !window.supabase?.createClient) {
      showStatus("Admin service could not load. Please try again later.", "error");
      showLoginView({ disabled: true });
      return;
    }

    state.client = window.supabase.createClient(config.url, config.anonKey);

    const sessionResult = await safeSupabaseCall(() => state.client.auth.getSession());
    if (sessionResult.error) {
      showStatus("Could not restore admin session.", "error");
      showLoginView();
      return;
    }

    if (sessionResult.data?.session?.user) {
      await verifyAdminAccess(sessionResult.data.session.user);
    } else {
      showLoginView();
    }

    state.client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        verifyAdminAccess(session.user);
      } else {
        showLoginView();
      }
    });
  }

  function bindEvents() {
    els.loginForm.addEventListener("submit", handleLogin);
    els.logoutButton.addEventListener("click", handleLogout);
    els.recordsList.addEventListener("click", handleRecordListClick);
    els.copyAllJsonButton.addEventListener("click", copyAllLensJson);
    els.newLensButton.addEventListener("click", () => openLensEditor(createEmptyLens(), "new"));
    els.importButton.addEventListener("click", openImportPanel);
    els.editorPanel.addEventListener("submit", handleEditorSubmit);
    els.editorPanel.addEventListener("click", handleEditorClick);
    els.editorPanel.addEventListener("input", handleEditorInput);
    els.importPreviewButton.addEventListener("click", previewImport);
    els.importRunButton.addEventListener("click", runImport);
    els.importFile.addEventListener("change", handleImportFile);
    window.addEventListener("beforeunload", (event) => {
      if (!hasDirtyEditorDraft()) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  async function handleLogin(event) {
    event.preventDefault();
    clearStatus();
    setLoginDisabled(true);

    const email = els.emailInput.value.trim();
    const password = els.passwordInput.value;
    const { data, error } = await safeSupabaseCall(() =>
      state.client.auth.signInWithPassword({ email, password })
    );

    if (error || !data?.user) {
      showStatus(getFriendlyLoginError(error), "error");
      setLoginDisabled(false);
      return;
    }

    els.passwordInput.value = "";
    await verifyAdminAccess(data.user);
    setLoginDisabled(false);
  }

  async function handleLogout() {
    if (hasDirtyEditorDraft() && !confirm("Discard unsaved changes?")) return;
    if (hasDirtyEditorDraft()) clearCurrentEditorDraft();
    clearStatus();
    await safeSupabaseCall(() => state.client.auth.signOut());
    state.currentUser = null;
    state.isAdmin = false;
    state.records = [];
    state.importRecords = [];
    showLoginView();
  }

  async function verifyAdminAccess(user) {
    if (!user) {
      showLoginView();
      return;
    }

    showCheckingView();
    const { data, error } = await safeSupabaseCall(() =>
      state.client
        .from("lenswiki_admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()
    );

    if (error) {
      state.currentUser = null;
      state.isAdmin = false;
      showDeniedView("Could not verify admin access.");
      return;
    }

    if (!data?.user_id) {
      state.currentUser = user;
      state.isAdmin = false;
      showDeniedView("You do not have admin access.");
      return;
    }

    state.currentUser = user;
    state.isAdmin = true;
    showDashboardView();
    await loadAdminDashboard();
  }

  async function loadAdminDashboard() {
    if (!state.isAdmin) return;

    els.dashboard.hidden = false;
    els.supabaseRecordCount.textContent = "Loading...";
    els.dashboardStatus.textContent = "Loading lens records...";
    els.recordsList.hidden = true;
    els.recordsList.innerHTML = "";

    const { data, error, count } = await safeSupabaseCall(() =>
      state.client
        .from("lenswiki_records")
        .select("id,slug,name,manufacturer,year_introduced,status,confidence,data,updated_at", { count: "exact" })
        .order("updated_at", { ascending: false })
        .limit(200)
    );

    if (error) {
      els.supabaseRecordCount.textContent = "Unavailable";
      els.dashboardStatus.textContent = "Could not load lens records.";
      return;
    }

    state.records = Array.isArray(data) ? data : [];
    const total = typeof count === "number" ? count : state.records.length;
    els.supabaseRecordCount.textContent = `${total} ${total === 1 ? "record" : "records"}`;

    if (!state.records.length) {
      els.dashboardStatus.textContent = "No lens records yet. Use New lens or Import JSON records to begin.";
      return;
    }

    els.dashboardStatus.textContent = `Showing ${state.records.length} ${state.records.length === 1 ? "record" : "records"}.`;
    els.recordsList.hidden = false;
    els.recordsList.innerHTML = `
      <div class="records-row records-heading" role="row">
        <span>Name</span>
        <span>Maker</span>
        <span>Year</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      ${state.records.map(renderRecordRow).join("")}
    `;
  }

  function renderRecordRow(record) {
    const lens = lensFromRecord(record);
    const status = safeText(record.status) || safeText(lens.status) || "ready";
    const confidence = safeText(record.confidence) || safeText(lens.confidence);
    return `
      <div class="records-row" role="row">
        <span>${escapeHtml(lens.name || "Untitled lens")}</span>
        <span>${escapeHtml(lens.manufacturer || "-")}</span>
        <span>${escapeHtml(lens.yearIntroduced || "-")}</span>
        <span>${escapeHtml([status, confidence].filter(Boolean).join(" / "))}</span>
        <span class="row-actions">
          <button class="secondary-button mini" type="button" data-edit-record="${escapeHtml(record.id)}">Edit</button>
          <button class="secondary-button mini" type="button" data-copy-record="${escapeHtml(record.id)}">Copy JSON</button>
        </span>
      </div>
    `;
  }

  function handleRecordListClick(event) {
    const copyButton = event.target.closest("[data-copy-record]");
    if (copyButton) {
      const record = state.records.find((item) => item.id === copyButton.dataset.copyRecord);
      if (record) copyJsonPayload(lensFromRecord(record));
      return;
    }

    const editButton = event.target.closest("[data-edit-record]");
    if (!editButton) return;
    const record = state.records.find((item) => item.id === editButton.dataset.editRecord);
    if (!record) return;
    openLensEditor(lensFromRecord(record), "edit");
  }

  function openLensEditor(lens, mode) {
    const hadDirtyDraft = hasDirtyEditorDraft();
    if (hadDirtyDraft && !confirm("Discard unsaved changes?")) return;
    if (hadDirtyDraft) {
      clearCurrentEditorDraft();
    } else {
      state.editorDraft = null;
    }
    hideImportPanel();
    clearStatus();
    state.editorDraft = createEditorDraft(lens, mode);
    renderEditorForm();
    els.editorPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function createEditorDraft(lens, mode) {
    const lensId = safeText(lens.id) || "new-lens";
    const storageKey = mode === "new" ? "lenswiki-draft-new-lens" : `lenswiki-draft-${slugify(lensId)}`;
    const autosaved = readStoredDraft(storageKey);
    return {
      mode,
      storageKey,
      values: createDraftValues(lens),
      dirty: false,
      autosavedValues: autosaved?.values || null
    };
  }

  function renderEditorForm() {
    if (!state.editorDraft) return;
    const draft = state.editorDraft;
    const title = draft.mode === "new" ? "New lens" : "Edit lens";
    els.editorPanel.hidden = false;
    els.editorPanel.innerHTML = `
      <form class="lens-admin-form" id="lensAdminForm" data-mode="${escapeHtml(draft.mode)}">
        <div class="panel-head">
          <div>
            <p class="access-kicker">${escapeHtml(title)}</p>
            <h2>${escapeHtml(draft.values.name || "Lens record")}</h2>
            <p class="edit-dirty-status" data-admin-draft-status ${draft.dirty ? "" : "hidden"}>Unsaved changes</p>
          </div>
          <div class="panel-actions">
            <button class="primary-button" type="submit">${draft.mode === "new" ? "Create lens" : "Save changes"}</button>
            <button class="secondary-button" type="button" data-editor-action="copy-json">Copy JSON</button>
            <button class="secondary-button" type="button" data-editor-action="paste-json">Paste JSON</button>
            <button class="secondary-button" type="button" data-editor-action="cancel">Cancel</button>
          </div>
        </div>
        ${draft.autosavedValues ? `
          <div class="draft-restore admin-draft-restore">
            <p>Unsaved draft found. Restore draft?</p>
            <div>
              <button class="secondary-button mini" type="button" data-editor-action="restore-draft">Restore draft</button>
              <button class="secondary-button mini" type="button" data-editor-action="discard-draft">Discard draft</button>
            </div>
          </div>
        ` : ""}
        ${draft.jsonPatch?.open ? renderJsonPatchPanel(draft.jsonPatch) : ""}
        <div class="form-grid">
          ${LENS_FIELDS.filter((field) => shouldShowEditorField(draft, field)).map((field) => renderEditorField(draft, field)).join("")}
        </div>
      </form>
    `;
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
    const ignored = patchState.ignored?.length
      ? `<p class="json-patch-note">Ignored unknown fields: ${escapeHtml(patchState.ignored.join(", "))}</p>`
      : "";

    return `
      <section class="json-patch-panel">
        <div class="json-patch-heading">
          <div>
            <p class="access-kicker">Paste JSON</p>
            <h3>Apply JSON patch</h3>
          </div>
          <button class="secondary-button mini" type="button" data-editor-action="cancel-json-patch">Cancel</button>
        </div>
        <textarea data-json-patch-input rows="8" placeholder='"focalLengths": ["16mm", "20mm"]'>${escapeHtml(patchState.raw || "")}</textarea>
        ${patchState.error ? `<p class="json-patch-error">${escapeHtml(patchState.error)}</p>` : ""}
        ${ignored}
        ${previewRows}
        <div class="panel-actions">
          <button class="secondary-button" type="button" data-editor-action="preview-json-patch">Preview changes</button>
          <button class="primary-button" type="button" data-editor-action="apply-json-patch" ${patchState.preview?.length ? "" : "disabled"}>Apply changes</button>
        </div>
      </section>
    `;
  }

  function openEditorJsonPatchPanel() {
    if (!state.editorDraft) return;
    state.editorDraft.jsonPatch = {
      open: true,
      raw: state.editorDraft.jsonPatch?.raw || "",
      preview: [],
      ignored: [],
      error: ""
    };
    renderEditorForm();
  }

  function closeEditorJsonPatchPanel() {
    if (!state.editorDraft?.jsonPatch) return;
    state.editorDraft.jsonPatch = null;
    renderEditorForm();
  }

  function previewEditorJsonPatch() {
    if (!state.editorDraft?.jsonPatch) return;
    const parsed = parseJsonPatchInput(state.editorDraft.jsonPatch.raw);
    if (parsed.error) {
      state.editorDraft.jsonPatch.error = parsed.error;
      state.editorDraft.jsonPatch.preview = [];
      state.editorDraft.jsonPatch.ignored = [];
      renderEditorForm();
      return;
    }

    const prepared = prepareDraftPatch(parsed.value, state.editorDraft.values, LENS_FIELDS);
    state.editorDraft.jsonPatch.error = prepared.error;
    state.editorDraft.jsonPatch.preview = prepared.preview;
    state.editorDraft.jsonPatch.ignored = prepared.ignored;
    state.editorDraft.jsonPatch.patchValues = prepared.patchValues;
    renderEditorForm();
  }

  function applyEditorJsonPatch() {
    if (!state.editorDraft?.jsonPatch) return;
    if (!state.editorDraft.jsonPatch.preview?.length) {
      previewEditorJsonPatch();
      return;
    }

    Object.assign(state.editorDraft.values, state.editorDraft.jsonPatch.patchValues);
    state.editorDraft.dirty = true;
    state.editorDraft.jsonPatch = null;
    persistEditorDraft();
    renderEditorForm();
  }

  function renderEditorField(draft, field) {
    const value = draft.values[field.key] ?? "";
    const required = field.required ? "required" : "";
    if (field.type === "toggle") {
      const checked = Boolean(value);
      return `
        <fieldset class="form-field form-field-wide toggle-field">
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
        <label class="form-field checkbox-field">
          <input name="${escapeHtml(field.key)}" type="checkbox" ${value ? "checked" : ""}>
          <span>${escapeHtml(field.label)}</span>
        </label>
      `;
    }

    if (["textarea", "lines", "structured"].includes(field.type)) {
      const rows = field.type === "structured" ? 7 : 4;
      return `
        <label class="form-field form-field-wide">
          <span>${escapeHtml(field.label)}</span>
          <textarea name="${escapeHtml(field.key)}" rows="${rows}" ${required}>${escapeHtml(value)}</textarea>
          ${getFieldHint(field)}
        </label>
      `;
    }

    return `
      <label class="form-field">
        <span>${escapeHtml(field.label)}</span>
        <input name="${escapeHtml(field.key)}" type="${field.type === "number" ? "number" : "text"}" value="${escapeHtml(value)}" ${required}>
        ${getFieldHint(field)}
      </label>
    `;
  }

  function shouldShowEditorField(draft, field) {
    if (!REHOUSING_FIELD_KEYS.has(field.key)) return true;
    return Boolean(draft.values.isRehoused);
  }

  function getFieldHint(field) {
    if (field.type === "list") return "<small>Comma-separated values.</small>";
    if (field.type === "lines") return "<small>One item per line.</small>";
    if (field.type === "structured") return "<small>Use JSON for structured entries, or one item per line.</small>";
    if (field.key === "status") return "<small>Use ready or published for public archive visibility.</small>";
    return "";
  }

  function handleEditorClick(event) {
    if (event.target.closest('[data-editor-action="copy-json"]')) {
      if (state.editorDraft) {
        copyJsonPayload(buildLensFromDraft(state.editorDraft));
      }
    }

    if (event.target.closest('[data-editor-action="paste-json"]')) {
      openEditorJsonPatchPanel();
    }

    if (event.target.closest('[data-editor-action="preview-json-patch"]')) {
      previewEditorJsonPatch();
    }

    if (event.target.closest('[data-editor-action="apply-json-patch"]')) {
      applyEditorJsonPatch();
    }

    if (event.target.closest('[data-editor-action="cancel-json-patch"]')) {
      closeEditorJsonPatchPanel();
    }

    if (event.target.closest('[data-editor-action="cancel"]')) {
      if (hasDirtyEditorDraft() && !confirm("Discard unsaved changes?")) return;
      clearCurrentEditorDraft();
      closeEditor();
    }

    if (event.target.closest('[data-editor-action="restore-draft"]')) {
      restoreEditorDraft();
    }

    if (event.target.closest('[data-editor-action="discard-draft"]')) {
      discardEditorAutosave();
    }
  }

  function handleEditorInput(event) {
    if (event.target.matches("[data-json-patch-input]")) {
      if (state.editorDraft?.jsonPatch) {
        state.editorDraft.jsonPatch.raw = event.target.value;
        state.editorDraft.jsonPatch.error = "";
      }
      return;
    }

    if (!state.editorDraft || !event.target.closest("#lensAdminForm")) return;
    const fieldName = event.target.name;
    if (!fieldName) return;

    if (event.target.type === "checkbox") {
      state.editorDraft.values[fieldName] = event.target.checked;
    } else if (event.target.type === "radio" && fieldName === "isRehoused") {
      state.editorDraft.values[fieldName] = event.target.value === "true";
    } else {
      state.editorDraft.values[fieldName] = event.target.value;
    }
    state.editorDraft.dirty = true;

    const form = event.target.closest("form");
    if (form?.dataset.mode === "new") {
      if (event.target.matches('input[name="slug"], input[name="id"]')) {
        event.target.dataset.autogenerated = "false";
      }
      if (event.target.matches('input[name="name"], input[name="yearIntroduced"]')) {
        updateGeneratedNewLensFields(form);
      }
    }

    persistEditorDraft();
    if (fieldName === "isRehoused") {
      renderEditorForm();
    } else {
      updateEditorDraftStatus();
    }
  }

  function updateGeneratedNewLensFields(form) {
    const nameInput = form.elements.name;
    const yearInput = form.elements.yearIntroduced;
    const slugInput = form.elements.slug;
    const idInput = form.elements.id;
    if (!nameInput || !slugInput || !idInput) return;

    const generatedSlug = slugify(nameInput.value);
    if (!slugInput.value || slugInput.dataset.autogenerated === "true") {
      slugInput.value = generatedSlug;
      slugInput.dataset.autogenerated = "true";
      state.editorDraft.values.slug = generatedSlug;
    }

    if (!idInput.value || idInput.dataset.autogenerated === "true") {
      idInput.value = [yearInput?.value, slugInput.value].filter(Boolean).join("-");
      idInput.dataset.autogenerated = "true";
      state.editorDraft.values.id = idInput.value;
    }
  }

  async function handleEditorSubmit(event) {
    if (!event.target.matches("#lensAdminForm")) return;
    event.preventDefault();
    if (!state.isAdmin || !state.editorDraft) return;

    const form = event.target;
    const lens = buildLensFromDraft(state.editorDraft);
    const validationError = validateLensForSave(lens);
    if (validationError) {
      showStatus(validationError, "error");
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    setButtonBusy(submitButton, "Saving...");

    const { error } = await upsertLensRecords([lens]);
    restoreButton(submitButton);
    if (error) {
      showStatus("Could not save changes.", "error");
      return;
    }

    clearStoredDraft(state.editorDraft.storageKey);
    state.editorDraft.dirty = false;
    showStatus(form.dataset.mode === "new" ? "Lens created." : "Lens updated.", "success");
    closeEditor();
    await loadAdminDashboard();
  }

  function buildLensFromDraft(draft) {
    const lens = {};
    LENS_FIELDS.forEach((field) => {
      if (field.type === "checkbox" || field.type === "toggle") {
        lens[field.key] = Boolean(draft.values[field.key]);
        return;
      }
      lens[field.key] = parseFieldValue(safeText(draft.values[field.key]), field.type, field.key);
    });

    lens.slug = safeText(lens.slug) || slugify(lens.name);
    lens.id = safeText(lens.id) || [lens.yearIntroduced, lens.slug].filter(Boolean).join("-");
    lens.fileName = `${lens.id}.json`;
    lens.status = safeText(lens.status) || "ready";
    lens.confidence = safeText(lens.confidence) || "needs verification";
    return cleanLensArrayFields(lens);
  }

  function validateLensForSave(lens) {
    if (!safeText(lens.id)) return "Lens ID is required.";
    if (!safeText(lens.name)) return "Lens name is required.";
    const year = Number(lens.yearIntroduced);
    if (!Number.isFinite(year) || year <= 0) return "Year introduced is required.";
    return "";
  }

  function closeEditor() {
    els.editorPanel.hidden = true;
    els.editorPanel.innerHTML = "";
    state.editorDraft = null;
  }

  function openImportPanel() {
    const hadDirtyDraft = hasDirtyEditorDraft();
    if (hadDirtyDraft && !confirm("Discard unsaved changes?")) return;
    if (hadDirtyDraft) {
      clearCurrentEditorDraft();
    }
    closeEditor();
    clearStatus();
    els.importPanel.hidden = false;
    els.importStatus.textContent = "Paste JSON or choose a file, then preview the import.";
    els.importRunButton.disabled = true;
    state.importRecords = [];
    els.importPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function hideImportPanel() {
    els.importPanel.hidden = true;
    els.importStatus.textContent = "";
    state.importRecords = [];
    els.importRunButton.disabled = true;
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    els.importTextarea.value = await file.text();
    previewImport();
  }

  function previewImport() {
    try {
      const records = parseImportPayload(els.importTextarea.value);
      const invalid = records.find(validateLensForSave);
      if (invalid) {
        state.importRecords = [];
        els.importRunButton.disabled = true;
        els.importStatus.textContent = validateLensForSave(invalid);
        return;
      }

      state.importRecords = records.map(prepareImportedLens);
      els.importRunButton.disabled = !state.importRecords.length;
      els.importStatus.textContent = `${state.importRecords.length} ${state.importRecords.length === 1 ? "record" : "records"} ready to import.`;
    } catch (_error) {
      state.importRecords = [];
      els.importRunButton.disabled = true;
      els.importStatus.textContent = "Could not read that JSON. Check the formatting and try again.";
    }
  }

  async function runImport() {
    if (!state.isAdmin || !state.importRecords.length) return;
    setButtonBusy(els.importRunButton, "Importing...");

    const { error } = await upsertLensRecords(state.importRecords);
    restoreButton(els.importRunButton);
    if (error) {
      els.importStatus.textContent = "Could not import records.";
      return;
    }

    const count = state.importRecords.length;
    els.importStatus.textContent = `Import complete. ${count} ${count === 1 ? "record was" : "records were"} imported or updated.`;
    els.importRunButton.disabled = true;
    state.importRecords = [];
    await loadAdminDashboard();
  }

  function copyAllLensJson() {
    if (!state.isAdmin) return;
    copyJsonPayload(state.records.map(lensFromRecord));
  }

  async function copyJsonPayload(payload) {
    const json = JSON.stringify(payload, null, 2);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(json);
      hideCopyFallback();
      showTemporaryStatus("JSON copied.", "success");
    } catch (_error) {
      showCopyFallback(json);
      showTemporaryStatus("Clipboard blocked. Copy manually.", "error");
    }
  }

  function showCopyFallback(json) {
    els.copyFallback.hidden = false;
    els.copyTextarea.value = json;
    els.copyTextarea.focus();
    els.copyTextarea.select();
  }

  function hideCopyFallback() {
    els.copyFallback.hidden = true;
    els.copyTextarea.value = "";
  }

  function showTemporaryStatus(message, tone = "info") {
    showStatus(message, tone);
    window.clearTimeout(Number(els.statusMessage.dataset.timeoutId || 0));
    els.statusMessage.dataset.timeoutId = String(window.setTimeout(() => {
      if (els.statusMessage.textContent === message) {
        clearStatus();
      }
    }, 3200));
  }

  function parseImportPayload(text) {
    const payload = JSON.parse(text);
    let records = [];
    if (Array.isArray(payload)) {
      records = payload;
    } else if (payload && Array.isArray(payload.lenses)) {
      records = payload.lenses;
    } else if (payload && typeof payload === "object") {
      records = [payload];
    }
    return records.filter((record) => record && typeof record === "object" && !Array.isArray(record));
  }

  function prepareImportedLens(lens) {
    const prepared = { ...lens };
    prepared.slug = safeText(prepared.slug) || slugify(prepared.name || prepared.id);
    prepared.id = safeText(prepared.id) || [prepared.yearIntroduced, prepared.slug].filter(Boolean).join("-");
    prepared.fileName = safeText(prepared.fileName) || `${prepared.id}.json`;
    prepared.status = safeText(prepared.status) || "ready";
    prepared.confidence = safeText(prepared.confidence) || "needs verification";
    if (!hasOwn(prepared, "isRehoused")) {
      prepared.isRehoused = typeSuggestsRehoused(prepared.type);
    } else {
      prepared.isRehoused = parseBoolean(prepared.isRehoused);
    }
    return cleanLensArrayFields(prepared);
  }

  async function upsertLensRecords(lenses) {
    const rows = lenses.map((lens) => {
      const prepared = prepareImportedLens(lens);
      return {
        id: prepared.id,
        slug: prepared.slug,
        name: prepared.name,
        manufacturer: safeText(prepared.manufacturer) || null,
        year_introduced: prepared.yearIntroduced ? String(prepared.yearIntroduced) : null,
        status: prepared.status,
        confidence: safeText(prepared.confidence) || null,
        data: prepared,
        updated_at: new Date().toISOString(),
        updated_by: state.currentUser?.id || null
      };
    });

    return safeSupabaseCall(() =>
      state.client
        .from("lenswiki_records")
        .upsert(rows, { onConflict: "id" })
        .select("id")
    );
  }

  function lensFromRecord(record) {
    const data = record.data && typeof record.data === "object" && !Array.isArray(record.data)
      ? record.data
      : {};
    const id = safeText(data.id) || safeText(record.id);
    const slug = safeText(data.slug) || safeText(record.slug) || slugify(id);
    return {
      ...data,
      id,
      slug,
      name: safeText(data.name) || safeText(record.name),
      manufacturer: safeText(data.manufacturer) || safeText(record.manufacturer),
      yearIntroduced: data.yearIntroduced || record.year_introduced || "",
      isRehoused: hasOwn(data, "isRehoused") ? parseBoolean(data.isRehoused) : typeSuggestsRehoused(data.type),
      status: safeText(data.status) || safeText(record.status) || "ready",
      confidence: safeText(data.confidence) || safeText(record.confidence)
    };
  }

  function showCheckingView() {
    els.loginView.hidden = true;
    els.loginForm.hidden = true;
    els.adminView.hidden = false;
    els.accessCard.hidden = false;
    els.accessCard.dataset.state = "checking";
    els.accessKicker.textContent = "Access check";
    els.accessTitle.textContent = "Checking access...";
    els.accessCopy.textContent = "Please wait.";
    hideDashboard();
  }

  function showDashboardView() {
    els.loginView.hidden = true;
    els.loginForm.hidden = true;
    els.adminView.hidden = false;
    els.accessCard.hidden = false;
    els.accessCard.dataset.state = "confirmed";
    els.accessKicker.textContent = "Admin";
    els.accessTitle.textContent = "Access granted.";
    els.accessCopy.textContent = "Manage lens records.";
    els.dashboard.hidden = false;
  }

  function showDeniedView(message) {
    els.loginView.hidden = true;
    els.loginForm.hidden = true;
    els.adminView.hidden = false;
    els.accessCard.hidden = false;
    els.accessCard.dataset.state = "denied";
    els.accessKicker.textContent = "Access";
    els.accessTitle.textContent = message;
    els.accessCopy.textContent = "";
    hideDashboard();
  }

  function showLoginView(options = {}) {
    const disabled = options.disabled ?? isMissingConfig(config);
    els.loginView.hidden = false;
    els.loginForm.hidden = false;
    els.adminView.hidden = true;
    els.accessCard.hidden = true;
    hideDashboard();
    closeEditor();
    hideImportPanel();
    setLoginDisabled(disabled);
  }

  function hideDashboard() {
    els.dashboard.hidden = true;
    els.supabaseRecordCount.textContent = "";
    els.dashboardStatus.textContent = "";
    els.recordsList.hidden = true;
    els.recordsList.innerHTML = "";
  }

  function showStatus(message, tone = "info") {
    els.statusMessage.hidden = false;
    els.statusMessage.textContent = message;
    els.statusMessage.dataset.tone = tone;
  }

  function clearStatus() {
    els.statusMessage.hidden = true;
    els.statusMessage.textContent = "";
    delete els.statusMessage.dataset.tone;
  }

  function setLoginDisabled(disabled) {
    els.emailInput.disabled = disabled;
    els.passwordInput.disabled = disabled;
    els.loginButton.disabled = disabled;
  }

  function setButtonBusy(button, label) {
    if (!button) return;
    button.dataset.originalText = button.textContent;
    button.textContent = label;
    button.disabled = true;
  }

  function restoreButton(button) {
    if (!button) return;
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
    delete button.dataset.originalText;
  }

  function serializeField(value, type) {
    if (!hasValue(value)) return "";
    if (type === "list") return normalizeArrayField(value).map(formatListItem).join(", ");
    if (type === "lines") return normalizeArrayField(value).map(formatListItem).join("\n");
    if (type === "structured") {
      const items = asArray(value);
      if (items.some((item) => item && typeof item === "object")) {
        return JSON.stringify(items, null, 2);
      }
      return items.map(formatListItem).join("\n");
    }
    return String(value);
  }

  function parseFieldValue(value, type, key) {
    if (type === "number") {
      if (!value.trim()) return "";
      const number = Number(value);
      return Number.isFinite(number) ? number : "";
    }
    if (NORMALIZED_ARRAY_FIELDS.has(key)) {
      return normalizeArrayField(value, {
        fieldName: key,
        separator: type === "lines" ? "lines" : "",
        preserveObjects: type === "structured"
      });
    }
    if (type === "list") return splitCommaList(value);
    if (type === "lines") return splitLines(value);
    if (type === "structured") return parseStructuredValue(value, key);
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
        // Try the next supported shape.
      }
    }

    return { error: "Could not parse JSON. Check brackets, commas and quotes." };
  }

  function prepareDraftPatch(patchObject, currentValues, fields) {
    const fieldMap = new Map(fields.map((field) => [field.key, field]));
    const normalizedPatch = normalizeLensPatchObject(patchObject);
    const patchValues = {};
    const preview = [];
    const ignored = [];

    Object.entries(normalizedPatch).forEach(([key, value]) => {
      const field = fieldMap.get(key);
      if (!field) {
        ignored.push(key);
        return;
      }

      const nextValue = serializePatchValue(value, field);
      const currentValue = currentValues[field.key] ?? "";
      if (String(currentValue) === String(nextValue)) return;

      patchValues[field.key] = nextValue;
      preview.push({
        key: field.key,
        label: field.label,
        currentDisplay: formatPatchPreviewValue(currentValue),
        nextDisplay: formatPatchPreviewValue(nextValue)
      });
    });

    return {
      error: preview.length ? "" : "No changes to apply.",
      ignored,
      patchValues,
      preview
    };
  }

  function normalizeLensPatchObject(patchObject) {
    const normalized = { ...patchObject };
    if (!hasOwn(normalized, "isRehoused") && hasOwn(normalized, "type")) {
      const type = normalizeArrayField(normalized.type, { fieldName: "type" });
      if (typeSuggestsRehoused(type)) {
        normalized.isRehoused = true;
      }
    }
    return normalized;
  }

  function serializePatchValue(value, field) {
    if (field.type === "checkbox" || field.type === "toggle") return parseBoolean(value);
    if (field.type === "number") return hasValue(value) ? String(value) : "";
    if (NORMALIZED_ARRAY_FIELDS.has(field.key)) {
      const normalized = normalizeArrayField(value, {
        fieldName: field.key,
        separator: field.type === "lines" ? "lines" : "",
        preserveObjects: field.type === "structured"
      });
      return serializeField(normalized, field.type);
    }
    if (field.type === "structured") {
      const items = Array.isArray(value) ? value : [value];
      return JSON.stringify(items, null, 2);
    }
    if (Array.isArray(value)) return value.map(formatListItem).join(field.type === "lines" ? "\n" : ", ");
    if (value && typeof value === "object") return JSON.stringify(value, null, 2);
    return safeText(value);
  }

  function formatPatchPreviewValue(value) {
    const text = safeText(value);
    return text.length > 260 ? `${text.slice(0, 257).trim()}...` : text;
  }

  function parseStructuredValue(value, key) {
    if (!value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (_error) {
      return ["sources", "famousUses"].includes(key) ? splitLines(value) : splitLines(value);
    }
  }

  function createEmptyLens() {
    return {
      id: "",
      slug: "",
      name: "",
      manufacturer: "",
      yearIntroduced: "",
      yearApproximate: false,
      isRehoused: false,
      status: "ready",
      confidence: "needs verification",
      type: [],
      characteristics: []
    };
  }

  function createDraftValues(lens) {
    return LENS_FIELDS.reduce((values, field) => {
      values[field.key] = field.type === "checkbox" || field.type === "toggle"
        ? Boolean(lens[field.key])
        : serializeField(lens[field.key], field.type);
      return values;
    }, {});
  }

  function restoreEditorDraft() {
    if (!state.editorDraft?.autosavedValues) return;
    state.editorDraft.values = { ...state.editorDraft.values, ...state.editorDraft.autosavedValues };
    state.editorDraft.autosavedValues = null;
    state.editorDraft.dirty = true;
    persistEditorDraft();
    renderEditorForm();
  }

  function discardEditorAutosave() {
    if (!state.editorDraft) return;
    clearStoredDraft(state.editorDraft.storageKey);
    state.editorDraft.autosavedValues = null;
    renderEditorForm();
  }

  function persistEditorDraft() {
    if (!state.editorDraft) return;
    writeStoredDraft(state.editorDraft.storageKey, {
      mode: state.editorDraft.mode,
      values: state.editorDraft.values,
      savedAt: new Date().toISOString()
    });
  }

  function clearCurrentEditorDraft() {
    if (state.editorDraft?.storageKey) {
      clearStoredDraft(state.editorDraft.storageKey);
    }
    state.editorDraft = null;
  }

  function updateEditorDraftStatus() {
    const status = els.editorPanel.querySelector("[data-admin-draft-status]");
    if (status) status.hidden = !hasDirtyEditorDraft();
  }

  function hasDirtyEditorDraft() {
    return Boolean(state.editorDraft?.dirty);
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
      showStatus("Draft backup could not be saved in this browser.", "error");
    }
  }

  function clearStoredDraft(storageKey) {
    try {
      window.localStorage.removeItem(storageKey);
    } catch (_error) {
      // Ignore storage cleanup failures; the saved record remains authoritative.
    }
  }

  function isMissingConfig(currentConfig) {
    return [currentConfig.url, currentConfig.anonKey].some((value) => {
      const normalized = safeText(value);
      return !normalized || normalized.includes("YOUR_SUPABASE_");
    });
  }

  function isValidSupabaseUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && parsed.hostname.endsWith(".supabase.co");
    } catch (_error) {
      return false;
    }
  }

  async function safeSupabaseCall(callback) {
    try {
      return await callback();
    } catch (error) {
      return { data: null, error };
    }
  }

  function getFriendlyLoginError(error) {
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("failed to fetch") || error instanceof TypeError) {
      return "Could not reach the admin service. Check your connection and try again.";
    }
    return "Login failed. Check your email and password.";
  }

  function asArray(value) {
    if (Array.isArray(value)) return value.filter(hasValue);
    if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
    return [];
  }

  function splitCommaList(value) {
    return normalizeArrayField(value);
  }

  function splitLines(value) {
    return normalizeArrayField(value, { separator: "lines" });
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
        // Continue with forgiving cleanup for malformed previously saved values.
      }
    }

    const unwrapped = trimmed
      .replace(/^\[+/, "")
      .replace(/\]+$/, "")
      .replace(/,\s*$/g, "");

    const separator = options.separator === "lines" ? /\r?\n/ : /,|\r?\n/;
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
        const field = getLensField(fieldName);
        cleaned[fieldName] = normalizeArrayField(cleaned[fieldName], {
          fieldName,
          separator: field?.type === "lines" ? "lines" : "",
          preserveObjects: field?.type === "structured"
        });
      }
    });
    return cleaned;
  }

  function getLensField(fieldName) {
    return LENS_FIELDS.find((field) => field.key === fieldName);
  }

  function stripJsonPropertyPrefix(value) {
    return safeText(value).replace(/^\s*["']?[A-Za-z][A-Za-z0-9_-]*["']?\s*:\s*/u, "").trim();
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
    return /^["']?[A-Za-z][A-Za-z0-9_-]*["']?\s*:/u.test(text)
      || text === "["
      || text === "]"
      || isJsonSyntaxOnly(text)
      || /^\[/.test(text)
      || /\]$/.test(text);
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
    return Object.entries(item)
      .filter(([, value]) => hasValue(value))
      .map(([key, value]) => `${labelFromKey(key)}: ${Array.isArray(value) ? value.join(", ") : value}`)
      .join(" · ");
  }

  function labelFromKey(key) {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
  }

  function hasValue(value) {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== "";
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
    return normalizeArrayField(type, { fieldName: "type" }).some((item) => {
      const normalized = safeText(item).toLowerCase().replace(/[^a-z0-9]+/g, "");
      return normalized.includes("rehoused");
    });
  }

  function safeText(value, fallback = "") {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text || fallback;
  }

  function slugify(value) {
    return safeText(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };
      return entities[char];
    });
  }
})();
