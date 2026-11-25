// ==================== ROLE-BASED DASHBOARD RENDERING & LIVE TIMERS ====================

function fmtTime(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function renderPendingPaymentCards() {
  return state.pendingPayments.map(p => `
    <div class="glass-card p-5 rounded-xl border-cyan-500/40 space-y-3">
      <div class="flex justify-between items-start gap-3">
        <div class="space-y-1">
          <span class="font-mono-code text-xs text-cyan-400 font-bold">${p.payId} • ${p.stationName} (${p.game})</span>
          <h3 class="font-bold text-white text-base">Gamer: ${p.gamer}</h3>
          <div class="text-xs text-slate-300">Mode: <strong>${p.payMethod}</strong></div>
          <div class="text-xs text-slate-300">UTR / Ref ID: <span class="font-mono-code text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded">${p.txnRef}</span></div>
        </div>
        <div class="text-right">
          <div class="font-display text-2xl font-bold text-emerald-400">₹${p.total}</div>
          <div class="text-[10px] font-mono-code text-slate-400">${p.submittedAt || ''}</div>
        </div>
      </div>

      ${p.screenshot ? `
        <div class="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#070812] border border-slate-800">
          <div class="flex items-center gap-3">
            <img src="${p.screenshot}" alt="Payment Proof" class="w-16 h-14 rounded-lg object-cover border border-slate-700 cursor-pointer" onclick="openPendingScreenshot('${p.payId}')" />
            <div class="text-xs">
              <div class="font-semibold text-white">Payment Screenshot Attached</div>
              <div class="text-[11px] text-slate-400">Inspect UTR &amp; amount before approving</div>
            </div>
          </div>
          <button type="button" onclick="openPendingScreenshot('${p.payId}')" class="px-3 py-1.5 rounded-lg bg-violet-600/30 border border-violet-500/50 hover:bg-violet-600/50 text-violet-200 text-xs font-semibold shrink-0">
            View Photo
          </button>
        </div>
      ` : `
        <div class="p-2 rounded-lg bg-[#070812] border border-slate-800 text-[11px] text-slate-400">
          Cash at Desk payment — collect ₹${p.total} cash before approving.
        </div>
      `}

      <div class="flex gap-2 pt-1">
        <button type="button" onclick="approveOrRejectPayment('${p.payId}', true)" class="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs uppercase rounded-xl">Approve &amp; Issue Receipt</button>
        <button type="button" onclick="approveOrRejectPayment('${p.payId}', false)" class="px-4 py-2 bg-rose-950 border border-rose-500/40 text-rose-300 font-display font-bold text-xs uppercase rounded-xl">Reject</button>
      </div>
    </div>
  `).join('');
}

function renderWorkspace() {
  if (!currentUser) return;
  const container = document.getElementById('workspaceContent');

  if (currentUser.role === 'gamer') {
    const myInvoices = Object.values(state.invoices).filter(inv => inv.gamerId === currentUser.id || inv.gamer === currentUser.name);
    const mySessions = state.sessions.filter(s => s.gamerId === currentUser.id || s.gamer === currentUser.name);

    if (activeTab === 'gamer-home') {
      const lastPlayed = myInvoices.length ? myInvoices[myInvoices.length - 1] : null;
      const totalHours = myInvoices.reduce((acc, i) => acc + (i.hours || 1), 0);
      const totalSpent = myInvoices.reduce((acc, i) => acc + (i.total || 0), 0);

      const freq = {};
      myInvoices.forEach(i => { freq[i.game] = (freq[i.game] || 0) + 1; });
      const favGame = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || 'None yet';

      container.innerHTML = `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-xs font-mono-code text-cyan-400">@${currentUser.id} • ${currentUser.email || ''}</span>
              <h2 class="font-display text-2xl sm:text-3xl font-bold text-white mt-0.5">WELCOME BACK, ${currentUser.name.toUpperCase()}</h2>
            </div>
            <button type="button" onclick="switchTab('gamer-browse')" class="px-5 py-2.5 btn-neon font-display font-bold text-xs uppercase rounded-xl">
              + Pick a Game &amp; Book Rig
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="glass-card p-4 rounded-xl">
              <div class="text-xs text-slate-400">Recently Played</div>
              <div class="font-display text-lg font-bold text-cyan-400 mt-1 truncate">${lastPlayed ? lastPlayed.game : 'No Games Yet'}</div>
            </div>
            <div class="glass-card p-4 rounded-xl">
              <div class="text-xs text-slate-400">Favorite Title</div>
              <div class="font-display text-lg font-bold text-fuchsia-400 mt-1 truncate">${favGame}</div>
            </div>
            <div class="glass-card p-4 rounded-xl">
              <div class="text-xs text-slate-400">Hours Played</div>
              <div class="font-display text-lg font-bold text-white mt-1">${totalHours} Hrs</div>
            </div>
            <div class="glass-card p-4 rounded-xl">
              <div class="text-xs text-slate-400">Total Spent</div>
              <div class="font-display text-lg font-bold text-emerald-400 mt-1">₹${totalSpent}</div>
            </div>
          </div>

          ${lastPlayed ? (() => {
            const gObj = getGameObj(lastPlayed.game);
            return `
              <div class="glass-card rounded-2xl overflow-hidden grid md:grid-cols-12 border-violet-500/35">
                <img src="${gObj.img}" data-fallback="${gObj.fallback}" onerror="this.onerror=null;this.src=this.dataset.fallback;" alt="${lastPlayed.game}" class="md:col-span-5 w-full h-48 object-cover" />
                <div class="md:col-span-7 p-5 flex flex-col justify-between">
                  <div>
                    <span class="text-[10px] font-mono-code uppercase px-2.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">RECENTLY PLAYED</span>
                    <h3 class="font-display text-2xl font-bold text-white mt-2">${lastPlayed.game}</h3>
                    <p class="text-xs text-slate-300 mt-1">Last played on <strong>${lastPlayed.station}</strong> • ${lastPlayed.hours} Hr(s) • Paid ₹${lastPlayed.total} (${lastPlayed.date})</p>
                  </div>
                  <div class="flex flex-wrap gap-2 mt-4">
                    <button type="button" onclick="quickPlayAgain('${lastPlayed.game}')" class="px-4 py-2 btn-neon font-display font-bold text-xs uppercase rounded-xl">
                      ▶ Play ${lastPlayed.game} Again
                    </button>
                    <button type="button" onclick="openInvoiceById('${lastPlayed.id}')" class="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs text-white rounded-xl">
                      View Receipt (${lastPlayed.id})
                    </button>
                  </div>
                </div>
              </div>`;
          })() : `
            <div class="glass-card p-8 rounded-2xl text-center space-y-3">
              <div class="font-display text-base font-bold text-white">READY FOR YOUR FIRST MATCH?</div>
              <p class="text-xs text-slate-400">Your recently played games, hours, and verified receipts will appear here automatically.</p>
              <button type="button" onclick="switchTab('gamer-browse')" class="px-5 py-2.5 btn-neon font-display font-bold text-xs uppercase rounded-xl">Browse Games &amp; Rigs →</button>
            </div>
          `}

          <div>
            <h3 class="font-display text-base font-bold text-white mb-3">RECENT SESSIONS &amp; VERIFIED RECEIPTS</h3>
            <div class="grid sm:grid-cols-2 gap-4">
              ${myInvoices.length ? myInvoices.slice().reverse().map(inv => {
                const gObj = getGameObj(inv.game);
                return `
                  <div class="glass-card p-4 rounded-xl flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <img src="${gObj.img}" data-fallback="${gObj.fallback}" onerror="this.onerror=null;this.src=this.dataset.fallback;" alt="${inv.game}" class="w-16 h-12 rounded-lg object-cover shrink-0" />
                      <div>
                        <div class="font-mono-code text-[11px] text-cyan-400 font-bold">${inv.id}</div>
                        <div class="text-sm font-bold text-white">${inv.game} • ${inv.station}</div>
                        <div class="text-xs text-slate-400">₹${inv.total} • ${inv.date}</div>
                      </div>
                    </div>
                    <button type="button" onclick="openInvoiceById('${inv.id}')" class="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs text-white rounded-lg shrink-0">Receipt</button>
                  </div>`;
              }).join('') : '<p class="text-xs text-slate-500">No completed sessions yet.</p>'}
            </div>
          </div>
        </div>`;
    } else if (activeTab === 'gamer-browse') {
      const filteredStations = selectedGameFilter === 'All'
        ? state.stations
        : state.stations.filter(s => s.games.includes(selectedGameFilter));

      container.innerHTML = `
        <div class="space-y-6">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div>
                <h2 class="font-display text-xl font-bold text-white">1. CHOOSE YOUR GAME</h2>
                <p class="text-xs text-slate-400">Tap any game cover to filter compatible PC, PS5, Racing Sim, or VR rigs.</p>
              </div>
              ${selectedGameFilter !== 'All' ? `<button type="button" onclick="setGameFilter('All')" class="text-xs text-cyan-400 underline">Show All Games</button>` : ''}
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              ${GAME_CATALOG.map(g => {
                const active = selectedGameFilter === g.title;
                return `
                  <button type="button" onclick="setGameFilter('${active ? 'All' : g.title}')" class="glass-card rounded-xl overflow-hidden text-left group ${active ? 'ring-2 ring-cyan-400 border-cyan-400' : ''}">
                    <img src="${g.img}" data-fallback="${g.fallback}" onerror="this.onerror=null;this.src=this.dataset.fallback;" alt="${g.title}" class="w-full h-24 object-cover group-hover:scale-105 transition" />
                    <div class="p-2.5">
                      <div class="font-bold text-xs text-white truncate">${g.title}</div>
                      <div class="text-[10px] font-mono-code text-violet-400 mt-0.5">${g.zone}</div>
                    </div>
                  </button>`;
              }).join('')}
            </div>
          </div>

          <div>
            <h2 class="font-display text-xl font-bold text-white mb-3">2. SELECT AVAILABLE STATION ${selectedGameFilter !== 'All' ? `FOR ${selectedGameFilter.toUpperCase()}` : ''}</h2>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${filteredStations.map(s => `
                <div class="glass-card p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-xs font-mono-code text-cyan-400 font-bold">${s.id} • ${s.zone}</span>
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'Available' ? 'bg-emerald-500/15 text-emerald-400' : s.status === 'Occupied' ? 'bg-violet-500/15 text-violet-300' : 'bg-rose-500/15 text-rose-400'}">${s.status}</span>
                    </div>
                    <h3 class="font-display font-bold text-white text-lg">${s.name}</h3>
                    <p class="text-xs text-slate-400 mt-0.5">${s.specs}</p>
                    <div class="flex flex-wrap gap-1.5 mt-3">
                      ${s.games.map(g => `<span class="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#070812] border border-slate-800 text-slate-300">${g}</span>`).join('')}
                    </div>
                  </div>
                  <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span class="font-display font-bold text-white text-base">₹${s.rate}<span class="text-xs font-sans font-normal text-slate-500">/hr</span></span>
                    ${s.status === 'Available'
                      ? `<button type="button" onclick="openBookModal('${s.id}', '${selectedGameFilter !== 'All' ? selectedGameFilter : s.games[0]}')" class="px-4 py-2 btn-neon font-display font-bold text-xs uppercase rounded-xl">Book Rig</button>`
                      : `<span class="text-xs text-slate-500">${s.status}</span>`}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="space-y-6">
          <h2 class="font-display text-xl font-bold text-white">ACTIVE SESSION &amp; PAYMENT</h2>
          ${mySessions.length ? mySessions.map(s => {
            const gObj = getGameObj(s.game);
            return `
              <div class="glass-card rounded-2xl overflow-hidden grid md:grid-cols-12 border-violet-500/35">
                <img src="${gObj.img}" data-fallback="${gObj.fallback}" onerror="this.onerror=null;this.src=this.dataset.fallback;" alt="${s.game}" class="md:col-span-4 w-full h-44 object-cover" />
                <div class="md:col-span-8 p-5 flex flex-col justify-between gap-4">
                  <div class="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <div class="text-xs font-mono-code text-cyan-400">${s.stationId} • ${s.stationName}</div>
                      <h3 class="font-display font-bold text-xl text-white">Playing: ${s.game}</h3>
                      <p class="text-xs text-slate-400 mt-1">Playtime: ${s.hours} hr (₹${s.rate * s.hours}) + Snacks: ₹${s.foodCost} = <strong class="text-white">₹${s.rate * s.hours + s.foodCost}</strong></p>
                    </div>
                    <span id="timer-${s.id}" class="px-3.5 py-2 rounded-xl bg-[#070812] border border-emerald-500/40 text-emerald-400 font-mono-code text-base font-bold">${fmtTime(s.remainingSec)}</span>
                  </div>

                  ${s.paymentPending ? `
                    <div class="p-3 rounded-xl bg-violet-500/15 border border-violet-500/40 text-xs text-violet-200">
                      ⏳ <strong>Payment &amp; Screenshot Submitted!</strong> Waiting for Desk Operator or Manager verification.
                    </div>
                  ` : `
                    <div class="flex flex-wrap gap-2">
                      <button type="button" onclick="extendSession('${s.id}')" class="px-3.5 py-2 rounded-xl border border-slate-700 hover:border-cyan-400 text-xs font-semibold text-slate-200">+1 Hr</button>
                      <button type="button" onclick="openSnackModal('${s.id}')" class="px-3.5 py-2 rounded-xl bg-slate-900 border border-violet-500/40 hover:bg-slate-800 text-violet-300 text-xs font-bold">+ Order Snacks</button>
                      <button type="button" onclick="openPaymentModal('${s.id}')" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs uppercase">End Session &amp; Pay</button>
                    </div>
                  `}
                </div>
              </div>`;
          }).join('') : `
            <div class="glass-card p-10 rounded-2xl text-center space-y-3">
              <p class="text-sm text-slate-400">No active session right now.</p>
              <button type="button" onclick="switchTab('gamer-browse')" class="px-5 py-2.5 btn-neon font-display font-bold text-xs uppercase rounded-xl">Pick a Game &amp; Book Rig →</button>
            </div>`}
        </div>`;
    }
  } else if (currentUser.role === 'desk') {
    if (activeTab === 'desk-timers') {
      container.innerHTML = `
        <div class="space-y-6">
          ${state.pendingPayments.length ? `
            <div class="space-y-3">
              <h2 class="font-display text-lg font-bold text-cyan-400">⏳ PENDING PAYMENT APPROVALS (${state.pendingPayments.length})</h2>
              <div class="grid md:grid-cols-2 gap-4">
                ${renderPendingPaymentCards()}
              </div>
            </div>
          ` : ''}

          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h2 class="font-display text-lg font-bold text-white">LIVE STATION TIMERS (${state.sessions.length})</h2>
              <button type="button" onclick="switchTab('desk-walkin')" class="px-4 py-2 btn-neon font-display font-bold text-xs uppercase rounded-xl">+ Walk-In Booking</button>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${state.sessions.length ? state.sessions.map(s => `
                <div class="glass-card p-5 rounded-xl space-y-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="text-xs font-mono-code text-cyan-400 font-bold">${s.stationId} • ${s.game}</div>
                      <h3 class="font-display font-bold text-white text-base">${s.gamer}</h3>
                    </div>
                    <span id="timer-${s.id}" class="px-2.5 py-1 rounded-lg bg-[#070812] border border-emerald-500/40 text-emerald-400 font-mono-code text-sm font-bold">${fmtTime(s.remainingSec)}</span>
                  </div>
                  <div class="bg-[#070812] p-3 rounded-xl text-xs space-y-1 border border-slate-800">
                    <div class="flex justify-between text-slate-400"><span>Playtime (${s.hours} hr × ₹${s.rate}):</span><span class="text-white font-mono-code">₹${s.rate * s.hours}</span></div>
                    <div class="flex justify-between text-slate-400"><span>Cafe Snacks:</span><span class="text-cyan-300 font-mono-code">₹${s.foodCost}</span></div>
                    <div class="flex justify-between border-t border-slate-800 pt-1 font-bold text-white"><span>Total Due:</span><span class="text-emerald-400 font-mono-code">₹${s.rate * s.hours + s.foodCost}</span></div>
                  </div>
                  ${s.paymentPending
                    ? `<div class="text-center text-xs text-cyan-300 bg-cyan-500/10 py-2 rounded-lg border border-cyan-500/30">Payment submitted — verify above</div>`
                    : `<div class="grid grid-cols-3 gap-2">
                        <button type="button" onclick="extendSession('${s.id}')" class="py-2 text-xs font-mono-code border border-slate-700 hover:border-cyan-400 rounded-lg text-slate-200">+1 Hr</button>
                        <button type="button" onclick="openSnackModal('${s.id}')" class="py-2 text-xs font-mono-code border border-violet-500/40 text-violet-300 rounded-lg">+ Snack</button>
                        <button type="button" onclick="openPaymentModal('${s.id}')" class="py-2 text-xs font-display font-bold bg-emerald-500 text-slate-950 rounded-lg">Collect Bill</button>
                      </div>`}
                </div>
              `).join('') : `
                <div class="col-span-3 glass-card p-10 rounded-xl text-center space-y-3">
                  <p class="text-sm text-slate-400">No active sessions right now.</p>
                  <button type="button" onclick="switchTab('desk-walkin')" class="px-4 py-2 btn-neon font-display font-bold text-xs uppercase rounded-xl">Assign Walk-In Gamer →</button>
                </div>`}
            </div>
          </div>
        </div>`;
    } else if (activeTab === 'desk-walkin') {
      container.innerHTML = `
        <div class="space-y-4">
          <h2 class="font-display text-xl font-bold text-white">WALK-IN STATION BOOKING</h2>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${state.stations.map(s => `
              <div class="glass-card p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-mono-code text-cyan-400">${s.id}</span>
                    <span class="text-[11px] font-bold ${s.status === 'Available' ? 'text-emerald-400' : 'text-rose-400'}">${s.status}</span>
                  </div>
                  <h3 class="font-display font-bold text-lg text-white">${s.name}</h3>
                  <p class="text-xs text-slate-400 mt-1">${s.specs} • ₹${s.rate}/hr</p>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                  ${s.status === 'Available'
                    ? `<button type="button" onclick="openBookModal('${s.id}', '${s.games[0]}')" class="px-4 py-2 btn-neon font-display font-bold text-xs uppercase rounded-xl">Assign Gamer</button>`
                    : `<span class="text-xs text-slate-500">Unavailable</span>`}
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
    } else if (activeTab === 'desk-report') {
      const activeRigs = state.stations.filter(s => s.status !== 'Maintenance');
      container.innerHTML = `
        <div class="max-w-lg glass-card p-6 rounded-2xl space-y-4">
          <h2 class="font-display text-lg font-bold text-rose-400">REPORT FAULTY HARDWARE (STAGE 1)</h2>
          <p class="text-xs text-slate-400">Locks the station immediately and sends a ticket to the Hardware Technician.</p>
          <form onsubmit="submitDeskFaultReport(event)" class="space-y-3 text-xs">
            <div>
              <label class="block font-mono-code text-slate-400 mb-1">SELECT STATION</label>
              <select id="faultStationId" class="w-full px-3 py-2.5 bg-[#070812] border border-slate-700 rounded-xl text-white">
                ${activeRigs.map(s => `<option value="${s.id}">${s.id} — ${s.name} (${s.status})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-mono-code text-slate-400 mb-1">HARDWARE ISSUE</label>
              <input id="faultDesc" type="text" required placeholder="e.g. Controller stick drift / Monitor flicker" class="w-full px-3 py-2.5 bg-[#070812] border border-slate-700 rounded-xl text-white" />
            </div>
            <button type="submit" class="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-xs uppercase rounded-xl">Lock Station &amp; Send to Tech</button>
          </form>
        </div>`;
    }
  } else if (currentUser.role === 'tech') {
    container.innerHTML = `
      <div class="space-y-4">
        <div>
          <h2 class="font-display text-xl font-bold text-white">HARDWARE TECHNICIAN REPAIR QUEUE</h2>
          <p class="text-xs text-slate-400">Diagnose reported stations, submit repair cost estimates to the Manager, and unlock rigs once approved.</p>
        </div>
        ${state.tickets.length ? state.tickets.map(t => `
          <div class="glass-card p-5 rounded-xl space-y-3">
            <div class="flex flex-wrap justify-between items-center gap-2">
              <div>
                <span class="font-mono-code text-xs text-cyan-400 font-bold">${t.id} • ${t.stationName} (${t.stationId})</span>
                <h3 class="font-bold text-white text-sm mt-0.5">${t.issue}</h3>
                <p class="text-xs text-slate-400">Reported by: ${t.reportedBy}</p>
              </div>
              <span class="px-3 py-1 rounded-full text-[11px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">${t.stage}</span>
            </div>

            ${(t.stage === 'Awaiting Tech Diagnosis' || t.stage === 'Rejected by Manager') ? `
              <div class="grid sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
                <input id="notes-${t.id}" type="text" placeholder="Diagnosis & parts needed" value="${t.techNotes}" class="px-3 py-2 bg-[#070812] border border-slate-700 rounded-xl text-white" />
                <input id="cost-${t.id}" type="number" placeholder="Est. Cost (₹)" value="${t.cost || 750}" class="px-3 py-2 bg-[#070812] border border-slate-700 rounded-xl text-white font-mono-code" />
                <button type="button" onclick="submitTechEstimate('${t.id}')" class="py-2 btn-neon font-display font-bold text-xs uppercase rounded-xl">Send Estimate to Manager</button>
              </div>
            ` : t.stage === 'Approved - Ready for Repair' ? `
              <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span class="text-emerald-400">Manager approved ₹${t.cost} (${t.techNotes})</span>
                <button type="button" onclick="completeTechRepair('${t.id}')" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs uppercase rounded-xl">Mark Fixed &amp; Unlock Rig</button>
              </div>
            ` : `
              <div class="text-xs text-slate-400 pt-2 border-t border-slate-800">
                Diagnosis: ${t.techNotes || 'Pending'} • Cost: ₹${t.cost}
              </div>
            `}
          </div>
        `).join('') : `
          <div class="glass-card p-8 rounded-xl text-center text-xs text-slate-400">
            No hardware maintenance tickets right now.
          </div>`}
      </div>`;
  } else if (currentUser.role === 'manager') {
    if (activeTab === 'mgr-overview') {
      const avail = state.stations.filter(s => s.status === 'Available').length;
      const pendingRepairs = state.tickets.filter(t => t.stage === 'Pending Manager Approval');

      container.innerHTML = `
        <div class="space-y-6">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="glass-card p-4 rounded-xl border-l-4 border-l-emerald-400">
              <div class="text-xs text-slate-400">Available Rigs</div>
              <div class="font-display text-2xl font-bold text-emerald-400 mt-1">${avail} / ${state.stations.length}</div>
            </div>
            <div class="glass-card p-4 rounded-xl border-l-4 border-l-cyan-400">
              <div class="text-xs text-slate-400">Active Sessions</div>
              <div class="font-display text-2xl font-bold text-cyan-400 mt-1">${state.sessions.length}</div>
            </div>
            <div class="glass-card p-4 rounded-xl border-l-4 border-l-fuchsia-400">
              <div class="text-xs text-slate-400">Pending Approvals</div>
              <div class="font-display text-2xl font-bold text-fuchsia-400 mt-1">${state.pendingPayments.length + pendingRepairs.length}</div>
            </div>
            <div class="glass-card p-4 rounded-xl border-l-4 border-l-violet-400">
              <div class="text-xs text-slate-400">Approved Revenue</div>
              <div class="font-display text-2xl font-bold text-white mt-1">₹${state.totalRevenue}</div>
            </div>
          </div>

          <div class="space-y-3">
            <h2 class="font-display text-lg font-bold text-cyan-400">ONLINE &amp; CASH PAYMENT APPROVALS (${state.pendingPayments.length})</h2>
            ${state.pendingPayments.length ? `<div class="grid md:grid-cols-2 gap-4">${renderPendingPaymentCards()}</div>` : '<div class="glass-card p-5 rounded-xl text-xs text-slate-400">No payments awaiting approval.</div>'}
          </div>

          <div class="space-y-3">
            <h2 class="font-display text-lg font-bold text-white">ACTIVE ARENA SESSIONS (${state.sessions.length})</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${state.sessions.length ? state.sessions.map(s => {
                const gObj = getGameObj(s.game);
                return `
                  <div class="glass-card p-4 rounded-xl flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <img src="${gObj.img}" data-fallback="${gObj.fallback}" onerror="this.onerror=null;this.src=this.dataset.fallback;" alt="${s.game}" class="w-14 h-12 rounded-lg object-cover shrink-0" />
                      <div>
                        <div class="font-mono-code text-xs text-cyan-400 font-bold">${s.stationId} • ${s.gamer}</div>
                        <div class="text-sm font-bold text-white">${s.game}</div>
                        <div class="text-xs text-slate-400">Bill: ₹${s.rate * s.hours + s.foodCost} ${s.paymentPending ? '(Payment Pending)' : ''}</div>
                      </div>
                    </div>
                    <span id="timer-${s.id}" class="font-mono-code text-xs font-bold text-emerald-400 bg-[#070812] px-2.5 py-1.5 rounded-lg border border-slate-800">${fmtTime(s.remainingSec)}</span>
                  </div>`;
              }).join('') : '<div class="col-span-3 glass-card p-5 rounded-xl text-xs text-slate-400">No active sessions running across the arena.</div>'}
            </div>
          </div>

          <div class="space-y-3">
            <h2 class="font-display text-lg font-bold text-white">HARDWARE REPAIR BUDGET APPROVALS (${pendingRepairs.length})</h2>
            ${pendingRepairs.length ? pendingRepairs.map(t => `
              <div class="glass-card p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="text-xs space-y-1">
                  <div class="font-mono-code text-violet-400 font-bold">${t.id} • ${t.stationName}</div>
                  <div class="text-sm font-bold text-white">${t.issue}</div>
                  <div class="text-slate-400">Tech Diagnosis: ${t.techNotes} • <strong class="text-cyan-300">Requested Budget: ₹${t.cost}</strong></div>
                </div>
                <div class="flex gap-2">
                  <button type="button" onclick="managerReviewTicket('${t.id}', true)" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs uppercase rounded-xl">Approve Budget</button>
                  <button type="button" onclick="managerReviewTicket('${t.id}', false)" class="px-4 py-2 bg-rose-950 border border-rose-500/40 text-rose-300 font-display font-bold text-xs uppercase rounded-xl">Reject</button>
                </div>
              </div>
            `).join('') : '<div class="glass-card p-5 rounded-xl text-xs text-slate-400">No repair budgets awaiting approval.</div>'}
          </div>
        </div>`;
    } else if (activeTab === 'mgr-rigs') {
      const gamers = state.users.filter(u => u.role === 'gamer');
      container.innerHTML = `
        <div class="space-y-6">
          <div class="grid lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 glass-card p-5 rounded-xl space-y-3 h-fit">
              <h3 class="font-display text-sm font-bold text-cyan-400">ADD NEW GAMING STATION</h3>
              <form onsubmit="addNewStation(event)" class="space-y-3 text-xs">
                <div>
                  <label class="block text-slate-400 mb-1">Station Name</label>
                  <input id="newRigName" type="text" required placeholder="e.g. RTX Ultra 04" class="w-full px-3 py-2 bg-[#070812] border border-slate-700 rounded-xl text-white" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Zone</label>
                  <select id="newRigZone" class="w-full px-3 py-2 bg-[#070812] border border-slate-700 rounded-xl text-white">
                    <option>PC Zone</option>
                    <option>PS5 Lounge</option>
                    <option>Racing Sim</option>
                    <option>VR Booth</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Hourly Rate (₹)</label>
                  <input id="newRigRate" type="number" value="180" required class="w-full px-3 py-2 bg-[#070812] border border-slate-700 rounded-xl text-white font-mono-code" />
                </div>
                <button type="submit" class="w-full py-2.5 btn-neon font-display font-bold text-xs uppercase rounded-xl">+ Add Station</button>
              </form>
              <button type="button" onclick="resetSystem()" class="w-full py-2 border border-rose-500/40 text-rose-400 text-xs rounded-xl hover:bg-rose-950/30">Reset All Arena Data</button>
            </div>
            <div class="lg:col-span-8 glass-card rounded-xl overflow-hidden">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#070812] text-slate-400 font-mono-code uppercase">
                  <tr><th class="px-4 py-3">ID</th><th class="px-4 py-3">Name</th><th class="px-4 py-3">Zone</th><th class="px-4 py-3">Rate</th><th class="px-4 py-3">Status</th></tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  ${state.stations.map(s => `
                    <tr>
                      <td class="px-4 py-3 font-mono-code text-cyan-400">${s.id}</td>
                      <td class="px-4 py-3 font-semibold text-white">${s.name}</td>
                      <td class="px-4 py-3 text-slate-400">${s.zone}</td>
                      <td class="px-4 py-3 font-mono-code text-white">₹${s.rate}/hr</td>
                      <td class="px-4 py-3 text-emerald-400">${s.status}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="glass-card rounded-xl overflow-hidden">
            <div class="p-4 border-b border-slate-800 font-display text-sm font-bold text-white">REGISTERED GAMER ACCOUNTS (${gamers.length})</div>
            <div class="divide-y divide-slate-800 text-xs">
              ${gamers.length ? gamers.map(g => `
                <div class="p-3.5 flex justify-between items-center">
                  <div><strong class="text-white">${g.name}</strong> <span class="font-mono-code text-cyan-400">(@${g.id})</span> • <span class="text-slate-400">${g.email}</span></div>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold">Active</span>
                </div>
              `).join('') : '<div class="p-4 text-slate-500">No gamer accounts registered yet.</div>'}
            </div>
          </div>
        </div>`;
    } else if (activeTab === 'mgr-logs') {
      const allInvs = Object.values(state.invoices);
      container.innerHTML = `
        <div class="grid lg:grid-cols-2 gap-6">
          <div class="glass-card rounded-xl overflow-hidden">
            <div class="p-4 border-b border-slate-800 font-display text-sm font-bold text-cyan-400">APPROVED RECEIPTS (${allInvs.length})</div>
            <div class="divide-y divide-slate-800 text-xs">
              ${allInvs.map(inv => `
                <div class="p-3.5 flex justify-between items-center gap-3">
                  <div>
                    <span class="font-mono-code text-cyan-400 font-bold">${inv.id}</span> • <span class="text-white font-semibold">${inv.gamer}</span>
                    <div class="text-slate-400">${inv.station} (${inv.game}) — ₹${inv.total} • UTR: <span class="font-mono-code text-slate-300">${inv.txnRef || 'N/A'}</span></div>
                  </div>
                  <div class="flex gap-1.5 shrink-0">
                    ${inv.screenshot ? `<button type="button" onclick="openInvoiceScreenshot('${inv.id}')" class="px-2.5 py-1 bg-violet-600/30 border border-violet-500/40 rounded text-violet-200">Photo</button>` : ''}
                    <button type="button" onclick="openInvoiceById('${inv.id}')" class="px-3 py-1 bg-slate-900 border border-slate-700 hover:border-cyan-400 rounded text-white">Receipt</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="glass-card rounded-xl overflow-hidden">
            <div class="p-4 border-b border-slate-800 font-display text-sm font-bold text-violet-400">SYSTEM AUDIT LOGS</div>
            <div class="divide-y divide-slate-800 text-xs max-h-96 overflow-y-auto">
              ${state.auditLogs.map(l => `
                <div class="p-3.5 flex justify-between gap-4">
                  <div><strong class="text-cyan-300">${l.actor}:</strong> <span class="text-slate-300">${l.action}</span></div>
                  <span class="font-mono-code text-slate-500 shrink-0">${l.time}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>`;
    }
  }
}

function setGameFilter(game) {
  selectedGameFilter = game;
  renderWorkspace();
}

function quickPlayAgain(gameTitle) {
  selectedGameFilter = gameTitle;
  switchTab('gamer-browse');
}

setInterval(() => {
  state.sessions.forEach(s => {
    if (s.remainingSec > 0) {
      s.remainingSec--;
      const el = document.getElementById('timer-' + s.id);
      if (el) el.textContent = fmtTime(s.remainingSec);
    }
  });
}, 1000);

initBackgroundSync();
