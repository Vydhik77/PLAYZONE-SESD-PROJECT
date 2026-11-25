// ==================== STATE PERSISTENCE & MULTI-DEVICE SYNC ====================

function loadLocalState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && Array.isArray(s.stations) && Array.isArray(s.users)) return s;
  } catch (e) {}
  return initialData();
}

let state = loadLocalState();
let mqttClient = null;
let currentUser = null;
let activeTab = '';
let selectedGameFilter = 'All';
let bookingStationId = null;
let snackSessionId = null;
let payingSessionId = null;
let selectedPayMethod = 'Online UPI';
let uploadedScreenshotBase64 = '';

function initBackgroundSync() {
  try {
    mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
      clientId: CLIENT_ID,
      clean: true,
      reconnectPeriod: 3000
    });
    mqttClient.on('connect', () => {
      mqttClient.subscribe(SYNC_TOPIC, { qos: 1 });
    });
    mqttClient.on('message', (topic, payload) => {
      if (topic !== SYNC_TOPIC) return;
      try {
        const incoming = JSON.parse(payload.toString());
        if (incoming && incoming.updatedAt && incoming.updatedAt > (state.updatedAt || 0)) {
          state = incoming;
          localStorage.setItem(STORE_KEY, JSON.stringify(state));
          if (currentUser) {
            const freshUser = state.users.find(u => u.id === currentUser.id);
            if (freshUser) currentUser = freshUser;
            renderWorkspace();
          }
        }
      } catch (err) {}
    });
  } catch (e) {}
}

function saveAndBroadcast() {
  state.updatedAt = Date.now();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(SYNC_TOPIC, JSON.stringify(state), { qos: 1, retain: true });
  }
}

function resetSystem() {
  state = initialData();
  saveAndBroadcast();
  renderWorkspace();
  toast('All arena data reset!');
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(window._tt);
  window._tt = setTimeout(() => el.classList.add('hidden'), 3200);
}

function nowStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function copyPayText(text, label) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => toast(`${label} (${text}) copied!`));
  } else {
    toast(`${label}: ${text}`);
  }
}
