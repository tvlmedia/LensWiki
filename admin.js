(() => {
  const els = {
    accessCard: document.querySelector("#adminAccessCard"),
    accessCopy: document.querySelector("#accessCopy"),
    accessKicker: document.querySelector("#accessKicker"),
    accessTitle: document.querySelector("#accessTitle"),
    configNotice: document.querySelector("#configNotice"),
    dashboard: document.querySelector("#adminDashboard"),
    dashboardStatus: document.querySelector("#dashboardStatus"),
    emailInput: document.querySelector("#emailInput"),
    loginButton: document.querySelector("#loginButton"),
    loginForm: document.querySelector("#loginForm"),
    logoutButton: document.querySelector("#logoutButton"),
    passwordInput: document.querySelector("#passwordInput"),
    recordsList: document.querySelector("#supabaseRecordsList"),
    sessionPanel: document.querySelector("#sessionPanel"),
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
      els.configNotice.textContent = "Supabase config missing.";
      setLoginDisabled(true);
      showLoggedOut();
      return;
    }

    if (!isValidSupabaseUrl(config.url)) {
      showStatus("Supabase URL is invalid.", "error");
      setLoginDisabled(true);
      return;
    }

    if (!window.supabase?.createClient) {
      showStatus("Supabase client could not load. Check your connection and CDN access.", "error");
      setLoginDisabled(true);
      return;
    }

    supabaseClient = window.supabase.createClient(config.url, config.anonKey);

    const sessionResult = await safeSupabaseCall(() => supabaseClient.auth.getSession());
    if (sessionResult.error) {
      showStatus(getFriendlySupabaseError(sessionResult.error), "error");
      setLoginDisabled(false);
      showLoggedOut();
      return;
    }

    const { data } = sessionResult;
    if (data?.session) {
      await restoreUser();
    } else {
      showLoggedOut();
      clearStatus();
    }

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        verifyAdminAccess(session.user);
      } else {
        showLoggedOut();
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
    showLoggedOut();
  }

  async function restoreUser() {
    const { data, error } = await safeSupabaseCall(() => supabaseClient.auth.getUser());
    if (error) {
      showStatus(getFriendlySupabaseError(error), "error");
      showLoggedOut();
      return;
    }

    if (!data?.user) {
      showLoggedOut();
      return;
    }

    await verifyAdminAccess(data.user);
  }

  async function verifyAdminAccess(user) {
    if (!user) {
      showLoggedOut();
      return;
    }

    showLoggedIn();
    showAccessState("checking", "Checking admin access...", "Looking for this user in LensWiki admins.");

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
        `${getFriendlySupabaseError(error)} Check the LensWiki migration and RLS policies.`
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
      "Ask a project admin to add your Supabase Auth user id to public.lenswiki_admins."
    );
  }

  function showLoggedIn() {
    els.loginForm.hidden = true;
    els.sessionPanel.hidden = false;
  }

  function showLoggedOut() {
    els.loginForm.hidden = false;
    els.sessionPanel.hidden = true;
    els.accessCard.hidden = true;
    hideDashboard();
    setLoginDisabled(isMissingConfig(config));
  }

  async function loadAdminDashboard() {
    els.dashboard.hidden = false;
    els.supabaseRecordCount.textContent = "Loading...";
    els.dashboardStatus.textContent = "Loading lens records from Supabase...";
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
      els.dashboardStatus.textContent = `Could not load Supabase lens records. ${getFriendlySupabaseError(error)}`;
      return;
    }

    const records = Array.isArray(data) ? data : [];
    const total = typeof count === "number" ? count : records.length;
    els.supabaseRecordCount.textContent = `${total} ${total === 1 ? "record" : "records"}`;

    if (records.length === 0) {
      els.dashboardStatus.textContent = "No Supabase lens records yet. Import existing JSON records next.";
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
    els.accessKicker.textContent = state === "confirmed" ? "Access granted" : "Access check";
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
      return "Could not reach Supabase. Check project URL, publishable key, browser cache or Supabase project status.";
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
