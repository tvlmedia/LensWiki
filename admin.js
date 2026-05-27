(() => {
  const els = {
    accessCard: document.querySelector("#adminAccessCard"),
    accessCopy: document.querySelector("#accessCopy"),
    accessKicker: document.querySelector("#accessKicker"),
    accessTitle: document.querySelector("#accessTitle"),
    adminView: document.querySelector("#adminView"),
    configNotice: document.querySelector("#configNotice"),
    dashboard: document.querySelector("#adminDashboard"),
    dashboardStatus: document.querySelector("#dashboardStatus"),
    emailInput: document.querySelector("#emailInput"),
    loginButton: document.querySelector("#loginButton"),
    loginForm: document.querySelector("#loginForm"),
    loginView: document.querySelector("#loginView"),
    logoutButton: document.querySelector("#logoutButton"),
    passwordInput: document.querySelector("#passwordInput"),
    recordsList: document.querySelector("#supabaseRecordsList"),
    statusMessage: document.querySelector("#statusMessage"),
    supabaseRecordCount: document.querySelector("#supabaseRecordCount"),
  };

  const config = {
    url: window.LENSWIKI_SUPABASE_URL || "",
    anonKey: window.LENSWIKI_SUPABASE_ANON_KEY || "",
  };

  let supabaseClient = null;

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    els.loginForm.addEventListener("submit", handleLogin);
    els.logoutButton.addEventListener("click", handleLogout);

    if (isMissingConfig(config)) {
      els.configNotice.hidden = false;
      els.configNotice.textContent = "Admin configuration missing.";
      showLoginView({ disabled: true });
      return;
    }

    if (!isValidSupabaseUrl(config.url)) {
      showStatus("Admin configuration is invalid.", "error");
      showLoginView({ disabled: true });
      return;
    }

    if (!window.supabase?.createClient) {
      showStatus("Admin service could not load. Check your connection and try again.", "error");
      showLoginView({ disabled: true });
      return;
    }

    supabaseClient = window.supabase.createClient(config.url, config.anonKey);

    const sessionResult = await safeSupabaseCall(() => supabaseClient.auth.getSession());
    if (sessionResult.error) {
      showStatus(getFriendlySupabaseError(sessionResult.error), "error");
      setLoginDisabled(false);
      showLoginView();
      return;
    }

    const { data } = sessionResult;
    if (data?.session) {
      await restoreUser();
    } else {
      showLoginView();
      clearStatus();
    }

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        verifyAdminAccess(session.user);
      } else {
        showLoginView();
      }
    });
  }

  async function handleLogin(event) {
    event.preventDefault();
    clearStatus();
    setLoginDisabled(true);

    const email = els.emailInput.value.trim();
    const password = els.passwordInput.value;

    const { data, error } = await safeSupabaseCall(() =>
      supabaseClient.auth.signInWithPassword({ email, password })
    );
    if (error) {
      showStatus(getFriendlySupabaseError(error), "error");
      setLoginDisabled(false);
      return;
    }

    await verifyAdminAccess(data.user);
    setLoginDisabled(false);
    els.passwordInput.value = "";
  }

  async function handleLogout() {
    clearStatus();
    await safeSupabaseCall(() => supabaseClient.auth.signOut());
    showLoginView();
  }

  async function restoreUser() {
    const { data, error } = await safeSupabaseCall(() => supabaseClient.auth.getUser());
    if (error) {
      showStatus(getFriendlySupabaseError(error), "error");
      showLoginView();
      return;
    }

    if (!data?.user) {
      showLoginView();
      return;
    }

    await verifyAdminAccess(data.user);
  }

  async function verifyAdminAccess(user) {
    if (!user) {
      showLoginView();
      return;
    }

    showAdminView();
    showAccessState("checking", "Checking admin access...", "Please wait while access is verified.");

    const { data, error } = await safeSupabaseCall(() =>
      supabaseClient
        .from("lenswiki_admins")
        .select("user_id,email,role")
        .eq("user_id", user.id)
        .maybeSingle()
    );

    if (error) {
      hideDashboard();
      showAccessState(
        "denied",
        "Could not verify admin access.",
        "Please try again or contact the site owner."
      );
      return;
    }

    if (data?.user_id) {
      showAccessState(
        "confirmed",
        "Admin access confirmed.",
        "Lens editor coming next."
      );
      await loadAdminDashboard();
      return;
    }

    hideDashboard();
    showAccessState(
      "denied",
      "You are logged in, but this account is not authorized for LensWiki admin.",
      "Contact the site owner if you need curator access."
    );
  }

  function showAdminView() {
    els.loginView.hidden = true;
    els.loginForm.hidden = true;
    els.adminView.hidden = false;
  }

  function showLoginView(options = {}) {
    const disabled = options.disabled ?? isMissingConfig(config);
    els.loginView.hidden = false;
    els.loginForm.hidden = false;
    els.adminView.hidden = true;
    els.accessCard.hidden = true;
    hideDashboard();
    setLoginDisabled(disabled);
  }

  async function loadAdminDashboard() {
    els.dashboard.hidden = false;
    els.supabaseRecordCount.textContent = "Loading...";
    els.dashboardStatus.textContent = "Loading lens records...";
    els.recordsList.hidden = true;
    els.recordsList.innerHTML = "";

    const { data, error, count } = await safeSupabaseCall(() =>
      supabaseClient
        .from("lenswiki_records")
        .select("name,manufacturer,status,updated_at", { count: "exact" })
        .order("updated_at", { ascending: false })
        .limit(10)
    );

    if (error) {
      els.supabaseRecordCount.textContent = "Unavailable";
      els.dashboardStatus.textContent = "Could not load lens records. Please try again or contact the site owner.";
      return;
    }

    const records = Array.isArray(data) ? data : [];
    const total = typeof count === "number" ? count : records.length;
    els.supabaseRecordCount.textContent = `${total} ${total === 1 ? "record" : "records"}`;

    if (records.length === 0) {
      els.dashboardStatus.textContent = "No lens records yet. Import existing JSON records next.";
      return;
    }

    els.dashboardStatus.textContent = `Showing ${records.length} recent ${records.length === 1 ? "record" : "records"}.`;
    els.recordsList.hidden = false;
    els.recordsList.innerHTML = `
      <div class="records-row records-heading" role="row">
        <span>Name</span>
        <span>Manufacturer</span>
        <span>Status</span>
        <span>Updated</span>
      </div>
      ${records.map(renderRecordRow).join("")}
    `;
  }

  function hideDashboard() {
    els.dashboard.hidden = true;
    els.supabaseRecordCount.textContent = "";
    els.dashboardStatus.textContent = "";
    els.recordsList.hidden = true;
    els.recordsList.innerHTML = "";
  }

  function showAccessState(state, title, copy) {
    els.accessCard.hidden = false;
    els.accessCard.dataset.state = state;
    els.accessKicker.textContent = state === "confirmed" ? "Admin session active" : "Access check";
    els.accessTitle.textContent = title;
    els.accessCopy.textContent = copy;
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

  function isMissingConfig(currentConfig) {
    return [currentConfig.url, currentConfig.anonKey].some((value) => {
      const normalized = String(value || "").trim();
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

  function getFriendlySupabaseError(error) {
    const message = String(error?.message || error || "Unknown Supabase error");
    if (message.toLowerCase().includes("failed to fetch") || error instanceof TypeError) {
      return "Could not reach the admin service. Check your connection or try again later.";
    }

    return message;
  }

  function renderRecordRow(record) {
    return `
      <div class="records-row" role="row">
        <span>${escapeHtml(record.name || "Untitled lens")}</span>
        <span>${escapeHtml(record.manufacturer || "-")}</span>
        <span>${escapeHtml(record.status || "draft")}</span>
        <span>${escapeHtml(formatDate(record.updated_at))}</span>
      </div>
    `;
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return entities[char];
    });
  }
})();
