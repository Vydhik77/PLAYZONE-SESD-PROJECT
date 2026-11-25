// ==================== BOOKINGS, SNACKS, PAYMENTS, RECEIPTS & REPAIRS ====================

function openBookModal(stationId, preselectedGame) {
  bookingStationId = stationId;
  const st = state.stations.find(s => s.id === stationId);
  if (!st || st.status !== 'Available') return;

  document.getElementById('bookModalTitle').textContent = `BOOK ${st.name.toUpperCase()} (${st.zone})`;
  const nameInput = document.getElementById('bookGamerName');
  if (currentUser.role === 'gamer') {
    nameInput.value = currentUser.name;
    nameInput.readOnly = true;
  } else {
    nameInput.value = '';
    nameInput.readOnly = false;
    nameInput.placeholder = 'Enter Walk-in Gamer Name';
  }

  const defaultGame = (preselectedGame && st.games.includes(preselectedGame)) ? preselectedGame : st.games[0];
  selectModalGame(defaultGame, st.games);

  document.getElementById('bookDuration').innerHTML = [1, 2, 3, 4].map(h =>
    `<option value="${h}">${h} Hour${h > 1 ? 's' : ''} — ₹${st.rate * h}</option>`
  ).join('');

  document.getElementById('bookingModal').classList.remove('hidden');
}

function selectModalGame(gameTitle, stationGames) {
  document.getElementById('bookSelectedGame').value = gameTitle;
  const st = state.stations.find(s => s.id === bookingStationId);
  const gamesList = stationGames || (st ? st.games : []);
  document.getElementById('bookGameCards').innerHTML = gamesList.map(g => {
    const active = g === gameTitle;
    const gObj = getGameObj(g);
    return `
      <button type="button" onclick="selectModalGame('${g}')" class="rounded-xl overflow-hidden border text-left transition ${active ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800 opacity-75 hover:opacity-100'}">
        <img src="${gObj.img}" data-fallback="${gObj.fallback}" onerror="this.onerror=null;this.src=this.dataset.fallback;" alt="${g}" class="w-full h-16 object-cover" />
        <div class="p-1.5 bg-[#070812] text-[11px] font-bold text-white truncate">${g}</div>
      </button>`;
  }).join('');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function confirmBooking() {
  const st = state.stations.find(s => s.id === bookingStationId);
  if (!st || st.status !== 'Available') return;

  const gamer = document.getElementById('bookGamerName').value.trim() || 'Walk-in Gamer';
  const game = document.getElementById('bookSelectedGame').value || st.games[0];
  const hours = parseInt(document.getElementById('bookDuration').value, 10) || 1;

  st.status = 'Occupied';
  state.sessions.push({
    id: 'SES-' + Math.floor(100 + Math.random() * 900),
    stationId: st.id,
    stationName: st.name,
    gamer,
    gamerId: currentUser.role === 'gamer' ? currentUser.id : 'walkin',
    game,
    rate: st.rate,
    hours,
    remainingSec: hours * 3600,
    foodCost: 0,
    foodItems: [],
    paymentPending: false
  });

  state.auditLogs.unshift({ time: nowStr(), actor: currentUser.name, action: `Booked ${st.id} (${game}) for ${gamer} (${hours} hr)` });
  saveAndBroadcast();
  closeModal('bookingModal');
  if (currentUser.role === 'gamer') switchTab('gamer-session');
  else switchTab('desk-timers');
  toast(`${st.name} booked for ${game}!`);
}

function openSnackModal(sessionId) {
  snackSessionId = sessionId;
  document.getElementById('snackGrid').innerHTML = SNACK_MENU.map(item => `
    <button type="button" onclick="addSnackItem('${item.name}', ${item.price})" class="glass-card rounded-xl overflow-hidden text-left group">
      <img src="${item.img}" data-fallback="${item.fallback}" onerror="this.onerror=null;this.src=this.dataset.fallback;" alt="${item.name}" class="w-full h-24 object-cover group-hover:scale-105 transition" />
      <div class="p-2.5 flex items-center justify-between">
        <span class="font-bold text-white text-xs truncate pr-1">${item.name}</span>
        <span class="font-mono-code text-cyan-400 font-bold shrink-0">+₹${item.price}</span>
      </div>
    </button>
  `).join('');
  document.getElementById('snackModal').classList.remove('hidden');
}

function addSnackItem(name, price) {
  const s = state.sessions.find(x => x.id === snackSessionId);
  if (!s) return;
  s.foodCost += price;
  s.foodItems.push(`${name} (₹${price})`);
  state.auditLogs.unshift({ time: nowStr(), actor: currentUser.name, action: `Added ${name} (₹${price}) to ${s.stationId}` });
  saveAndBroadcast();
  closeModal('snackModal');
  renderWorkspace();
  toast(`Added ${name} (₹${price})`);
}

function extendSession(sessionId) {
  const s = state.sessions.find(x => x.id === sessionId);
  if (!s) return;
  s.remainingSec += 3600;
  s.hours += 1;
  state.auditLogs.unshift({ time: nowStr(), actor: currentUser.name, action: `Extended ${s.stationId} by +1 Hour` });
  saveAndBroadcast();
  renderWorkspace();
  toast(`Extended ${s.stationId} by +1 Hour`);
}

function openPaymentModal(sessionId) {
  const s = state.sessions.find(x => x.id === sessionId);
  if (!s) return;
  payingSessionId = sessionId;
  uploadedScreenshotBase64 = '';
  document.getElementById('upiRefInput').value = '';
  document.getElementById('payScreenshotInput').value = '';
  document.getElementById('screenshotPreviewWrap').classList.add('hidden');
  document.getElementById('payErrorBox').classList.add('hidden');

  const stationFee = s.rate * s.hours;
  const total = stationFee + s.foodCost;

  document.getElementById('paySummaryBox').innerHTML = `
    <div class="flex justify-between text-slate-400"><span>Station &amp; Game:</span><span class="text-white font-semibold">${s.stationName} (${s.game})</span></div>
    <div class="flex justify-between text-slate-400"><span>Playtime (${s.hours} hr × ₹${s.rate}):</span><span class="font-mono-code text-white">₹${stationFee}</span></div>
    <div class="flex justify-between text-slate-400"><span>Cafe Snacks (${s.foodItems.length}):</span><span class="font-mono-code text-white">₹${s.foodCost}</span></div>
    <div class="flex justify-between border-t border-slate-800 pt-2 text-sm font-display font-bold text-cyan-400"><span>TOTAL PAYABLE:</span><span>₹${total}</span></div>
  `;

  selectPayMethod('Online UPI');
  document.getElementById('paymentModal').classList.remove('hidden');
}

function selectPayMethod(method) {
  selectedPayMethod = method;
  const isOnline = method === 'Online UPI';
  document.getElementById('payMethodOnlineBtn').className = isOnline
    ? 'p-2.5 rounded-xl border border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold text-center'
    : 'p-2.5 rounded-xl border border-slate-800 bg-[#070812] text-slate-400 font-bold text-center';
  document.getElementById('payMethodCashBtn').className = !isOnline
    ? 'p-2.5 rounded-xl border border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold text-center'
    : 'p-2.5 rounded-xl border border-slate-800 bg-[#070812] text-slate-400 font-bold text-center';
  document.getElementById('onlinePayDetailsBox').classList.toggle('hidden', !isOnline);
  document.getElementById('payErrorBox').classList.add('hidden');
}

function handleScreenshotUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxW = 680;
      const scale = img.width > maxW ? (maxW / img.width) : 1;
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      uploadedScreenshotBase64 = canvas.toDataURL('image/jpeg', 0.78);
      document.getElementById('screenshotPreviewImg').src = uploadedScreenshotBase64;
      document.getElementById('screenshotPreviewWrap').classList.remove('hidden');
      document.getElementById('payErrorBox').classList.add('hidden');
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

function isDuplicateUtr(utr) {
  const clean = utr.trim().toUpperCase();
  const inPending = state.pendingPayments.some(p => (p.txnRef || '').trim().toUpperCase() === clean);
  const inInvoices = Object.values(state.invoices).some(inv => (inv.txnRef || '').trim().toUpperCase() === clean);
  return inPending || inInvoices;
}

function submitSessionPayment() {
  const s = state.sessions.find(x => x.id === payingSessionId);
  if (!s) return;
  const errBox = document.getElementById('payErrorBox');

  let ref = 'CASH-DESK';
  if (selectedPayMethod === 'Online UPI') {
    const enteredRef = document.getElementById('upiRefInput').value.trim();
    if (enteredRef.length < 8) {
      errBox.textContent = 'Please enter a valid UPI Transaction / UTR Reference ID (minimum 8 characters, e.g. 12-digit UTR).';
      errBox.classList.remove('hidden');
      return;
    }
    if (isDuplicateUtr(enteredRef)) {
      errBox.textContent = `Duplicate Reference ID "${enteredRef}"! This transaction ID has already been submitted or verified.`;
      errBox.classList.remove('hidden');
      return;
    }
    if (!uploadedScreenshotBase64) {
      errBox.textContent = 'Please upload your payment screenshot for Desk Operator / Manager verification.';
      errBox.classList.remove('hidden');
      return;
    }
    ref = enteredRef.toUpperCase();
  }

  errBox.classList.add('hidden');
  const stationFee = s.rate * s.hours;
  const total = stationFee + s.foodCost;

  s.paymentPending = true;
  state.pendingPayments = state.pendingPayments.filter(p => p.sessionId !== s.id);
  state.pendingPayments.unshift({
    payId: 'PAY-' + Math.floor(100 + Math.random() * 899),
    sessionId: s.id,
    stationId: s.stationId,
    stationName: s.stationName,
    gamer: s.gamer,
    gamerId: s.gamerId,
    game: s.game,
    hours: s.hours,
    rate: s.rate,
    stationFee,
    foodCost: s.foodCost,
    total,
    payMethod: selectedPayMethod,
    txnRef: ref,
    screenshot: selectedPayMethod === 'Online UPI' ? uploadedScreenshotBase64 : '',
    submittedAt: nowStr()
  });

  state.auditLogs.unshift({ time: nowStr(), actor: s.gamer, action: `Submitted ${selectedPayMethod} payment (₹${total}, Ref: ${ref}) for ${s.stationId}` });
  saveAndBroadcast();
  closeModal('paymentModal');
  renderWorkspace();
  toast('Payment & screenshot submitted for verification!');
}

function openPendingScreenshot(payId) {
  const p = state.pendingPayments.find(x => x.payId === payId);
  if (!p || !p.screenshot) return;
  document.getElementById('proofViewerMeta').textContent = `${p.gamer} • ₹${p.total} • UTR Ref: ${p.txnRef}`;
  document.getElementById('proofViewerImg').src = p.screenshot;
  document.getElementById('proofViewerModal').classList.remove('hidden');
}

function openInvoiceScreenshot(invCode) {
  const inv = state.invoices[invCode];
  if (!inv || !inv.screenshot) return;
  document.getElementById('proofViewerMeta').textContent = `${inv.id} • ${inv.gamer} • ₹${inv.total} • UTR Ref: ${inv.txnRef}`;
  document.getElementById('proofViewerImg').src = inv.screenshot;
  document.getElementById('proofViewerModal').classList.remove('hidden');
}

function approveOrRejectPayment(payId, approve) {
  const idx = state.pendingPayments.findIndex(p => p.payId === payId);
  if (idx === -1) return;
  const p = state.pendingPayments[idx];
  state.pendingPayments.splice(idx, 1);

  const s = state.sessions.find(x => x.id === p.sessionId);
  const st = state.stations.find(x => x.id === p.stationId);

  if (approve) {
    const invCode = 'PZ-2026-' + Math.floor(1002 + Math.random() * 8990);
    state.invoices[invCode] = {
      id: invCode,
      gamer: p.gamer,
      gamerId: p.gamerId,
      station: p.stationName,
      game: p.game,
      hours: p.hours,
      rate: p.rate,
      stationFee: p.stationFee,
      foodCost: p.foodCost,
      total: p.total,
      payMethod: p.payMethod,
      txnRef: p.txnRef,
      screenshot: p.screenshot || '',
      date: '25 Nov 2026'
    };
    state.totalRevenue += p.total;
    state.sessions = state.sessions.filter(x => x.id !== p.sessionId);
    if (st) st.status = 'Available';
    state.auditLogs.unshift({ time: nowStr(), actor: currentUser.name, action: `Verified & approved ${p.payId} (Ref: ${p.txnRef}, ₹${p.total}) → Receipt ${invCode}` });
    saveAndBroadcast();
    renderWorkspace();
    openInvoiceById(invCode);
    toast(`Payment verified! Receipt ${invCode} issued.`);
  } else {
    if (s) s.paymentPending = false;
    state.auditLogs.unshift({ time: nowStr(), actor: currentUser.name, action: `Rejected payment ${p.payId} (Ref: ${p.txnRef}) for ${p.stationId}` });
    saveAndBroadcast();
    renderWorkspace();
    toast(`Payment ${p.payId} rejected — gamer notified to re-submit.`);
  }
}

function openInvoiceById(code) {
  const inv = state.invoices[code];
  if (!inv) return;
  document.getElementById('invCode').textContent = inv.id;
  document.getElementById('invDetails').innerHTML = `
    <div class="flex justify-between"><span class="text-slate-400">Gamer:</span><span class="font-semibold text-white">${inv.gamer}</span></div>
    <div class="flex justify-between"><span class="text-slate-400">Station &amp; Game:</span><span class="font-semibold text-white">${inv.station} (${inv.game})</span></div>
    <div class="flex justify-between"><span class="text-slate-400">Playtime (${inv.hours} hr × ₹${inv.rate}):</span><span class="font-mono-code text-white">₹${inv.stationFee}</span></div>
    <div class="flex justify-between"><span class="text-slate-400">Cafe Snacks:</span><span class="font-mono-code text-white">₹${inv.foodCost}</span></div>
    <div class="flex justify-between"><span class="text-slate-400">Payment Mode:</span><span class="font-mono-code text-emerald-400">${inv.payMethod}</span></div>
    <div class="flex justify-between"><span class="text-slate-400">UTR / Ref ID:</span><span class="font-mono-code text-cyan-300">${inv.txnRef || 'N/A'}</span></div>
    <div class="flex justify-between border-t border-slate-800 pt-2 text-base font-display font-bold text-cyan-400"><span>TOTAL PAID:</span><span>₹${inv.total}</span></div>
  `;
  document.getElementById('invoiceModal').classList.remove('hidden');
}

function submitDeskFaultReport(e) {
  e.preventDefault();
  const stationId = document.getElementById('faultStationId').value;
  const issue = document.getElementById('faultDesc').value.trim();
  const st = state.stations.find(s => s.id === stationId);
  if (!st || !issue) return;

  st.status = 'Maintenance';
  state.sessions = state.sessions.filter(s => s.stationId !== stationId);

  const ticketId = 'MT-' + Math.floor(100 + Math.random() * 899);
  state.tickets.unshift({
    id: ticketId,
    stationId: st.id,
    stationName: st.name,
    issue,
    reportedBy: currentUser.name,
    techNotes: '',
    cost: 0,
    stage: 'Awaiting Tech Diagnosis'
  });
  state.auditLogs.unshift({ time: nowStr(), actor: currentUser.name, action: `Reported fault on ${st.id} (${ticketId})` });
  saveAndBroadcast();
  renderWorkspace();
  toast(`Ticket ${ticketId} sent to Hardware Technician!`);
}

function submitTechEstimate(ticketId) {
  const t = state.tickets.find(x => x.id === ticketId);
  if (!t) return;
  const notes = document.getElementById('notes-' + ticketId).value.trim() || 'Component replacement needed';
  const cost = parseInt(document.getElementById('cost-' + ticketId).value, 10) || 500;
  t.techNotes = notes;
  t.cost = cost;
  t.stage = 'Pending Manager Approval';
  state.auditLogs.unshift({ time: nowStr(), actor: currentUser.name, action: `Submitted ₹${cost} repair estimate for ${ticketId}` });
  saveAndBroadcast();
  renderWorkspace();
  toast(`Estimate ₹${cost} sent to Cafe Manager!`);
}

function managerReviewTicket(ticketId, approve) {
  const t = state.tickets.find(x => x.id === ticketId);
  if (!t) return;
  t.stage = approve ? 'Approved - Ready for Repair' : 'Rejected by Manager';
  state.auditLogs.unshift({ time: nowStr(), actor: currentUser.name, action: `${approve ? 'Approved' : 'Rejected'} repair budget ₹${t.cost} for ${ticketId}` });
  saveAndBroadcast();
  renderWorkspace();
  toast(approve ? `Approved ${ticketId} — sent to Tech to unlock` : `Rejected ${ticketId}`);
}

function completeTechRepair(ticketId) {
  const t = state.tickets.find(x => x.id === ticketId);
  if (!t) return;
  t.stage = 'Completed & Unlocked';
  const st = state.stations.find(s => s.id === t.stationId);
  if (st) st.status = 'Available';
  state.auditLogs.unshift({ time: nowStr(), actor: currentUser.name, action: `Completed repair ${ticketId} & unlocked ${t.stationId}` });
  saveAndBroadcast();
  renderWorkspace();
  toast(`${t.stationName} fixed and back ONLINE!`);
}

function addNewStation(e) {
  e.preventDefault();
  const name = document.getElementById('newRigName').value.trim();
  const zone = document.getElementById('newRigZone').value;
  const rate = parseInt(document.getElementById('newRigRate').value, 10) || 150;
  if (!name) return;

  const id = 'RIG-' + (state.stations.length + 1);
  const defaultGames = zone === 'PS5 Lounge' ? ['FC 26', 'Cricket 26', 'Tekken 8']
                     : zone === 'Racing Sim' ? ['Forza Horizon 6', 'F1 25']
                     : zone === 'VR Booth' ? ['Beat Saber']
                     : ['GTA V', 'Valorant', 'CS2'];

  state.stations.push({ id, name, zone, specs: 'Pro Gaming Setup', rate, status: 'Available', games: defaultGames });
  state.auditLogs.unshift({ time: nowStr(), actor: currentUser.name, action: `Added new station ${name} (₹${rate}/hr)` });
  saveAndBroadcast();
  renderWorkspace();
  toast(`Added ${name} to arena!`);
}
