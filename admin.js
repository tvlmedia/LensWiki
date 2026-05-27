(() => {
  const els = {
    accessCard: document.querySelector("#adminAccessCard"),
    accessCopy: document.querySelector("#accessCopy"),
    accessKicker: document.querySelector("#accessKicker"),
    accessTitle: document.querySelector("#accessTitle"),
    configNotice: document.querySelector("#configNotice"),
    emailInput: document.querySelector("#emailInput"),
    loginButton: document.querySelector("#loginButton"),
    loginForm: document.querySelector("#loginForm"),
    logoutButton: document.querySelector("#logoutButton"),
    passwordInput: document.querySelector("#passwordInput"),
    sessionPanel: document.querySelector("#sessionPanel"),
    statusMessage: document.querySelector("#statusMessage"),
    userEmail: document.querySelector("#userEmail"),
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
      setLoginDisabled(true);
      showLoggedOut();
      return;
    }

    if (!window.supabase?.createClient) {
      showStatus("Supabase client could not load. Check your connection and CDN access.", "error");
      setLoginDisabled(true);
      return;
    }

    supabaseClient = window.supabase.createClient(config.url, config.anonKey);

    const { data } = await supabaseClient.auth.getSession();
    if (data?.session) {
      await restoreUser();
    } else {
      showLoggedOut();
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

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      showStatus(error.message, "error");
      setLoginDisabled(false);
      return;
    }

    await verifyAdminAccess(data.user);
    setLoginDisabled(false);
    els.passwordInput.value = "";
  }

  async function handleLogout() {
    clearStatus();
    await supabaseClient.auth.signOut();
    showLoggedOut();
  }

  async function restoreUser() {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data?.user) {
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

    showLoggedIn(user);
    showAccessState("checking", "Checking admin access...", "Looking for this user in LensWiki admins.");

    const { data, error } = await supabaseClient
      .from("lenswiki_admins")
      .select("user_id,email,role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      showAccessState(
        "denied",
        "Could not verify admin access.",
        `${error.message} Check the LensWiki migration and RLS policies.`
      );
      return;
    }

    if (data?.user_id) {
      showAccessState(
        "confirmed",
        "Admin access confirmed.",
        "Lens editor coming next."
      );
      return;
    }

    showAccessState(
      "denied",
      "You are logged in, but this account is not authorized for LensWiki admin.",
      "Ask a project admin to add your Supabase Auth user id to public.lenswiki_admins."
    );
  }

  function showLoggedIn(user) {
    els.loginForm.hidden = true;
    els.sessionPanel.hidden = false;
    els.userEmail.textContent = user.email || "Unknown email";
  }

  function showLoggedOut() {
    els.loginForm.hidden = false;
    els.sessionPanel.hidden = true;
    els.accessCard.hidden = true;
    els.userEmail.textContent = "";
    setLoginDisabled(isMissingConfig(config));
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
})();
