// ==================== AUTHENTICATION, REGISTRATION & RBAC NAVIGATION ====================

function switchAuthMode(mode) {
  const isLogin = mode === 'login';
  document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
  document.getElementById('signupForm').classList.toggle('hidden', isLogin);
  document.getElementById('authTabLogin').className = isLogin
    ? 'py-2.5 rounded-lg font-display font-bold text-xs uppercase btn-neon transition'
    : 'py-2.5 rounded-lg font-display font-bold text-xs uppercase text-slate-400 hover:text-white transition';
  document.getElementById('authTabSignup').className = !isLogin
    ? 'py-2.5 rounded-lg font-display font-bold text-xs uppercase btn-neon transition'
    : 'py-2.5 rounded-lg font-display font-bold text-xs uppercase text-slate-400 hover:text-white transition';
  document.getElementById('loginError').classList.add('hidden');
  document.getElementById('signupError').classList.add('hidden');
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const id = document.getElementById('regUserId').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const confirmPass = document.getElementById('regConfirmPassword').value;
  const errBox = document.getElementById('signupError');

  if (!email.includes('@') || !email.includes('.')) {
    errBox.textContent = 'Please enter a valid email address (e.g. player@gmail.com).';
    errBox.classList.remove('hidden');
    return;
  }
  if (password !== confirmPass) {
    errBox.textContent = 'Passwords do not match. Please re-enter the same password.';
    errBox.classList.remove('hidden');
    return;
  }
  if (state.users.some(u => u.id.toLowerCase() === id.toLowerCase() || (u.email && u.email.toLowerCase() === email))) {
    errBox.textContent = 'That Gamer ID or Email is already registered. Please Sign In instead.';
    errBox.classList.remove('hidden');
    return;
  }

  errBox.classList.add('hidden');
  const newUser = { id, email, password, name, role: 'gamer' };
  state.users.push(newUser);
  state.auditLogs.unshift({ time: nowStr(), actor: name, action: `Created Gamer account (${id} / ${email})` });
  saveAndBroadcast();
  enterRoleSession(newUser);
}

function handleLogin(e) {
  e.preventDefault();
  const loginInput = document.getElementById('loginId').value.trim();
  const pass = document.getElementById('loginPassword').value;
  const errBox = document.getElementById('loginError');

  const found = state.users.find(u =>
    (u.id.toLowerCase() === loginInput.toLowerCase() || (u.email && u.email.toLowerCase() === loginInput.toLowerCase())) &&
    u.password === pass
  );

  if (!found) {
    errBox.textContent = 'Invalid User ID / Email or Password.';
    errBox.classList.remove('hidden');
    return;
  }
  errBox.classList.add('hidden');
  enterRoleSession(found);
}

function enterRoleSession(user) {
  currentUser = user;
  const cfg = ROLE_CONFIG[user.role];
  activeTab = cfg.tabs[0].id;

  document.getElementById('page-login').classList.add('hidden');
  document.getElementById('page-workspace').classList.remove('hidden');
  document.getElementById('userControls').classList.remove('hidden');
  document.getElementById('userControls').classList.add('flex');
  document.getElementById('navUserName').textContent = user.name;
  document.getElementById('navUserRole').textContent = cfg.label;

  renderRoleNav();
  renderWorkspace();
  toast(`Welcome back, ${user.name}!`);
}

function logout() {
  currentUser = null;
  activeTab = '';
  document.getElementById('loginId').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('page-workspace').classList.add('hidden');
  document.getElementById('page-login').classList.remove('hidden');
  document.getElementById('userControls').classList.add('hidden');
  document.getElementById('roleNav').innerHTML = '';
  document.getElementById('mobileRoleNav').innerHTML = '';
  document.getElementById('mobileRoleNav').classList.add('hidden');
}

function renderRoleNav() {
  if (!currentUser) return;
  const tabs = ROLE_CONFIG[currentUser.role].tabs;
  const html = tabs.map(t => `
    <button type="button" onclick="switchTab('${t.id}')" class="nav-pill px-3.5 py-2 rounded-lg text-slate-300 hover:text-white transition ${activeTab === t.id ? 'active' : ''}">
      ${t.label}
    </button>
  `).join('');
  document.getElementById('roleNav').innerHTML = html;
  document.getElementById('mobileRoleNav').innerHTML = html;
  document.getElementById('mobileRoleNav').classList.remove('hidden');
}

function switchTab(tabId) {
  if (!currentUser) return;
  const allowed = ROLE_CONFIG[currentUser.role].tabs.some(t => t.id === tabId);
  if (!allowed) return;
  activeTab = tabId;
  renderRoleNav();
  renderWorkspace();
}

function verifyInvoice() {
  const code = document.getElementById('verifyInput').value.trim().toUpperCase();
  const box = document.getElementById('verifyResult');
  box.classList.remove('hidden');
  const inv = state.invoices[code];
  if (inv) {
    box.className = 'text-xs p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200';
    box.innerHTML = `<strong class="text-emerald-400">✓ VERIFIED RECEIPT (${code})</strong><br/>Gamer: ${inv.gamer} • Rig: ${inv.station} (${inv.game}) • Paid: ₹${inv.total} • Ref: <span class="font-mono-code">${inv.txnRef || inv.payMethod}</span>`;
  } else {
    box.className = 'text-xs p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200';
    box.innerHTML = `<strong class="text-rose-400">✕ Not Found:</strong> No approved invoice matches "${code}".`;
  }
}
