/**
 * Mobile Call Log Management System
 * Final-Year Professional Engineering Implementation
 * Data Structure: Array-Based Stack (LIFO: Last-In-First-Out)
 * DIT University - CSN102 Data Structure Project 8
 * Authors: Krishna Rustagi, Samaksh Raj, Rimesh Raj, Aditya Raj
 */

// DTMF & Telephony Sound Engine (Web Audio API)
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.dtmfFreqs = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
    };
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playDTMF(key) {
    if (!this.enabled) return;
    this.init();
    const freqs = this.dtmfFreqs[key] || [500, 700];
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];

    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.15);
    osc2.stop(this.ctx.currentTime + 0.15);
  }

  playPush() {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playPop() {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playPeek() {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1175, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }
}

// Array-Based Stack Implementation (C-Structure Equivalence)
class CallStack {
  constructor(maxSize = 50) {
    this.MAX = maxSize;
    this.calls = [];
    this.top = -1;
    this.loadState();
  }

  initStack() {
    this.top = -1;
    this.calls = [];
    this.saveState();
  }

  isFull() {
    return this.top === this.MAX - 1;
  }

  isEmpty() {
    return this.top === -1;
  }

  pushCall(callRecord) {
    if (this.isFull()) {
      return { success: false, message: 'Call log is FULL! (Stack Overflow, capacity = 50).' };
    }
    this.top++;
    if (!callRecord.timestamp) {
      callRecord.timestamp = this.formatDate(new Date());
    }
    this.calls[this.top] = { ...callRecord };
    this.saveState();
    return { success: true, message: 'Call record pushed to top of stack.', record: this.calls[this.top] };
  }

  popCall() {
    if (this.isEmpty()) {
      return { success: false, message: 'Call log is empty. (Stack Underflow, nothing to delete).' };
    }
    const deleted = this.calls[this.top];
    this.top--;
    this.saveState();
    return { success: true, message: 'Deleted recent call (pop)', record: deleted };
  }

  peekCall() {
    if (this.isEmpty()) {
      return { success: false, message: 'Call log is empty.' };
    }
    return { success: true, record: this.calls[this.top] };
  }

  viewCallLog() {
    if (this.isEmpty()) return [];
    // Traverse from top down to 0 (LIFO order: most recent call first)
    const log = [];
    for (let i = this.top; i >= 0; i--) {
      log.push({ ...this.calls[i], stackIndex: i });
    }
    return log;
  }

  formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  }

  saveState() {
    try {
      const data = {
        top: this.top,
        calls: this.calls.slice(0, this.top + 1)
      };
      localStorage.setItem('dit_call_log_stack_pro', JSON.stringify(data));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  loadState() {
    try {
      const raw = localStorage.getItem('dit_call_log_stack_pro');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.calls) && parsed.calls.length > 0) {
          this.calls = parsed.calls;
          this.top = parsed.top !== undefined ? parsed.top : parsed.calls.length - 1;
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load stack state:', e);
    }
    // Load large rich dataset by default so Mam has plenty of data to inspect!
    this.loadExtensiveDataset();
  }

  loadSampleRunData() {
    this.initStack();
    // 3 calls as executed in Sample Run 1 of PDF Page 12:
    this.pushCall({ number: '9876543210', type: 'Outgoing', duration: 120, timestamp: '01-09-2026' });
    this.pushCall({ number: '9123456780', type: 'Incoming', duration: 45,  timestamp: '01-09-2026' });
    this.pushCall({ number: '9988776655', type: 'Missed',   duration: 0,   timestamp: '01-09-2026' });
  }

  loadExtensiveDataset() {
    this.initStack();
    const dataset = [
      { number: '9876543210', type: 'Outgoing', duration: 120, timestamp: '01-09-2026' },
      { number: '9123456780', type: 'Incoming', duration: 45,  timestamp: '01-09-2026' },
      { number: '9988776655', type: 'Missed',   duration: 0,   timestamp: '01-09-2026' },
      { number: '1000025730', type: 'Incoming', duration: 340, timestamp: '02-09-2026' },
      { number: '1000026934', type: 'Outgoing', duration: 85,  timestamp: '02-09-2026' },
      { number: '1000026924', type: 'Incoming', duration: 210, timestamp: '03-09-2026' },
      { number: '9412055678', type: 'Missed',   duration: 0,   timestamp: '03-09-2026' },
      { number: '9897123456', type: 'Outgoing', duration: 520, timestamp: '04-09-2026' },
      { number: '9760123987', type: 'Incoming', duration: 15,  timestamp: '04-09-2026' },
      { number: '9837001122', type: 'Outgoing', duration: 95,  timestamp: '05-09-2026' },
      { number: '9456789012', type: 'Missed',   duration: 0,   timestamp: '05-09-2026' },
      { number: '9897654321', type: 'Incoming', duration: 180, timestamp: '06-09-2026' },
      { number: '9112233445', type: 'Outgoing', duration: 410, timestamp: '07-09-2026' },
      { number: '9634567890', type: 'Incoming', duration: 60,  timestamp: '08-09-2026' },
      { number: '9870987654', type: 'Missed',   duration: 0,   timestamp: '09-09-2026' },
      { number: '9837123789', type: 'Outgoing', duration: 135, timestamp: '10-09-2026' },
      { number: '9123456780', type: 'Incoming', duration: 90,  timestamp: '11-09-2026' },
      { number: '9876543210', type: 'Outgoing', duration: 240, timestamp: '12-09-2026' },
      { number: '9988776655', type: 'Incoming', duration: 310, timestamp: '13-09-2026' },
      { number: '1000024715', type: 'Outgoing', duration: 65,  timestamp: '14-09-2026' }
    ];
    dataset.forEach(c => this.pushCall(c));
  }
}

// Main Application Controller
class AppController {
  constructor() {
    this.sound = new AudioEngine();
    this.stack = new CallStack(50);
    this.currentDialNumber = '';
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.callTimerInterval = null;
    this.callSeconds = 0;
    this.currentActiveCaller = null;

    this.contactsBook = {
      '9876543210': 'Samaksh Raj',
      '9123456780': 'DIT HOD / Academic Dept',
      '9988776655': 'Krishna Rustagi (Lead)',
      '1000024715': 'Krishna Rustagi',
      '1000025730': 'Samaksh Raj',
      '1000026934': 'Rimesh Raj',
      '1000026924': 'Aditya Raj',
      '9412055678': 'Prof. Data Structures',
      '9897123456': 'Dr. CSN102 Faculty Evaluator',
      '9760123987': 'Mom',
      '9837001122': 'Amazon Courier Delivery',
      '9456789012': 'DIT Placement Cell',
      '9897654321': 'Project Lab Assistant',
      '9112233445': 'Emergency Services (112)',
      '9634567890': 'Library Information Desk',
      '9870987654': 'Hostel Warden Office',
      '9837123789': 'Class Representative (BTRAI)'
    };

    this.initElements();
    this.bindEvents();
    this.startLiveClock();
    this.renderAll();
    this.initTerminal();
  }

  initElements() {
    this.phoneTimeEl = document.getElementById('phoneTime');
    this.recentsListEl = document.getElementById('recentsList');
    this.dialDisplayEl = document.getElementById('dialNumberDisplay');
    this.stackTopBannerEl = document.getElementById('stackTopBanner');
    this.activeCallOverlay = document.getElementById('activeCallOverlay');
    this.activeCallerName = document.getElementById('activeCallerName');
    this.activeCallTimer = document.getElementById('activeCallTimer');
    this.incomingCallModal = document.getElementById('incomingCallModal');
    this.incomingCallerName = document.getElementById('incomingCallerName');
    this.tracerStepEl = document.getElementById('tracerStepText');

    // Visualizer Elements
    this.stackItemsStack = document.getElementById('stackItemsStack');
    this.hudTopPointer = document.getElementById('hudTopPointer');
    this.hudStackState = document.getElementById('hudStackState');
    this.metricTop = document.getElementById('metricTop');
    this.metricCount = document.getElementById('metricCount');
    this.metricPercent = document.getElementById('metricPercent');
    this.metricProgressFill = document.getElementById('metricProgressFill');

    // Terminal
    this.termBody = document.getElementById('termBody');
    this.termInput = document.getElementById('termInput');

    // Modals
    this.addCallModal = document.getElementById('addCallModal');
    this.vivaModal = document.getElementById('vivaModal');
    this.vercelModal = document.getElementById('vercelModal');
    this.shareModal = document.getElementById('shareModal');
    this.toastContainer = document.getElementById('toastContainer');
  }

  bindEvents() {
    // Sound Toggle
    document.getElementById('btnToggleAudio')?.addEventListener('click', (e) => {
      this.sound.enabled = !this.sound.enabled;
      const btn = e.currentTarget;
      btn.classList.toggle('btn-success', this.sound.enabled);
      btn.innerHTML = this.sound.enabled 
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> <span>Sound: ON</span>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg> <span>Sound: OFF</span>`;
      this.showToast(`Sound feedback ${this.sound.enabled ? 'Enabled' : 'Muted'}`, 'info');
    });

    // Main View Pills (Phone Simulator vs Stack Engine vs Analytics vs Viva)
    document.querySelectorAll('.view-pill-btn, .dock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.dataset.view;
        this.switchMainView(targetView);
      });
    });

    // Faculty Viva Mode Button
    document.getElementById('btnOpenViva')?.addEventListener('click', () => {
      this.openModal(this.vivaModal);
    });

    // Extensive Dataset Load Button
    document.getElementById('btnLoadExtensive')?.addEventListener('click', () => {
      this.stack.loadExtensiveDataset();
      this.renderAll();
      this.setTracerStep('Loaded 20 Real-World Call Records (Simulated semester history)');
      this.showToast('Loaded 20 realistic calls with varied durations & contacts!', 'success');
      this.logToTerminal('Loaded extensive dataset (20 calls). Stack top = ' + this.stack.top);
    });

    // Assignment 3-Call Sample Run Button
    document.getElementById('btnOpSample')?.addEventListener('click', () => {
      this.stack.loadSampleRunData();
      this.renderAll();
      this.setTracerStep('Loaded exact 3 calls from assignment report (Page 12)');
      this.showToast('Loaded Page 12 PDF Sample Run (3 calls)!', 'success');
      this.logToTerminal('Loaded Page 12 PDF Sample Run (3 calls).');
    });

    // Phone Recents Search Filter
    document.getElementById('phoneSearchInput')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderRecents();
    });

    // Phone Tabs (Recents vs Keypad)
    document.querySelectorAll('.phone-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.phone-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.phone-tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.tab;
        document.getElementById(`tab-${target}`).classList.add('active');
      });
    });

    // Recents Filter Pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeFilter = pill.dataset.filter;
        this.renderRecents();
      });
    });

    // Phone Keypad digits
    document.querySelectorAll('.key-btn').forEach(k => {
      k.addEventListener('click', () => {
        const val = k.dataset.key;
        if (this.currentDialNumber.length < 15) {
          this.currentDialNumber += val;
          this.sound.playDTMF(val);
          this.updateDialDisplay();
        }
      });
    });

    // Keypad backspace
    document.getElementById('btnBackspace')?.addEventListener('click', () => {
      this.currentDialNumber = this.currentDialNumber.slice(0, -1);
      this.updateDialDisplay();
    });

    // Place Call
    document.getElementById('btnCallTrigger')?.addEventListener('click', () => {
      const num = this.currentDialNumber.trim() || '9876543210';
      this.startOutgoingCall(num);
    });

    // End Call
    document.getElementById('btnEndCall')?.addEventListener('click', () => {
      this.endActiveCall();
    });

    // Incoming Call Simulator
    document.getElementById('btnSimulateIncoming')?.addEventListener('click', () => {
      this.triggerIncomingCall();
    });

    document.getElementById('btnAcceptIncoming')?.addEventListener('click', () => {
      this.acceptIncomingCall();
    });

    document.getElementById('btnDeclineIncoming')?.addEventListener('click', () => {
      this.declineIncomingCall();
    });

    // Stack Operations Hub
    document.getElementById('btnOpPush')?.addEventListener('click', () => {
      this.openAddCallModal();
    });

    document.getElementById('btnOpPop')?.addEventListener('click', () => {
      this.executePop();
    });

    document.getElementById('btnOpPeek')?.addEventListener('click', () => {
      this.executePeek();
    });

    document.getElementById('btnOpTraverse')?.addEventListener('click', () => {
      this.executeTraverse();
    });

    document.getElementById('btnOpReset')?.addEventListener('click', () => {
      if (confirm('Clear Stack? This executes initStack(&s) -> s.top = -1.')) {
        this.stack.initStack();
        this.renderAll();
        this.setTracerStep('initStack(&s): Reset s->top = -1 (Stack is now empty)');
        this.showToast('Stack cleared: top = -1', 'info');
        this.logToTerminal('Stack initialized. All calls wiped.');
      }
    });

    // Add Call Form Submit
    document.getElementById('addCallForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const num = document.getElementById('inputNumber').value.trim();
      const type = document.getElementById('inputType').value;
      const duration = parseInt(document.getElementById('inputDuration').value, 10) || 0;
      let timestamp = document.getElementById('inputTimestamp').value.trim();
      if (!timestamp) timestamp = this.stack.formatDate(new Date());

      this.setTracerStep(`pushCall(&s, c): s->top++; s->calls[${this.stack.top + 1}] = {"${num}", "${type}", ${duration}s};`);
      const res = this.stack.pushCall({ number: num, type, duration, timestamp });
      if (res.success) {
        this.sound.playPush();
        this.closeModal(this.addCallModal);
        this.renderAll();
        this.showToast(`Pushed call: ${num} (${type}) to top`, 'success');
        this.logToTerminal(`PUSH -> Number: ${num} | Type: ${type} | Duration: ${duration}s | Time: ${timestamp}`);
      } else {
        this.showToast(res.message, 'danger');
      }
    });

    // Modals Close
    document.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) this.closeModal(modal);
      });
    });

    // Vercel & Share Modals
    document.getElementById('btnVercelDeploy')?.addEventListener('click', () => this.openModal(this.vercelModal));
    document.getElementById('btnShareProject')?.addEventListener('click', () => this.openModal(this.shareModal));

    document.getElementById('btnCopyShareLink')?.addEventListener('click', () => {
      const url = window.location.href;
      navigator.clipboard?.writeText(url).then(() => {
        this.showToast('Copied live app URL to clipboard!', 'success');
      }).catch(() => {
        this.showToast('Link ready: ' + url, 'info');
      });
    });

    // CSV & JSON Exports
    document.getElementById('btnExportCSV')?.addEventListener('click', () => this.exportCSV());
    document.getElementById('btnExportJSON')?.addEventListener('click', () => this.exportJSON());

    // C View Tabs in bottom card
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content-view').forEach(v => v.style.display = 'none');
        btn.classList.add('active');
        const viewId = btn.dataset.view;
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.style.display = 'block';
      });
    });
  }

  switchMainView(targetView) {
    document.querySelectorAll('.view-pill-btn, .dock-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === targetView);
    });

    const phoneCol = document.getElementById('phoneSimulatorColumn');
    const engineCol = document.getElementById('engineWorkspaceColumn');
    const analyticsView = document.getElementById('viewAnalyticsStandalone');
    const vivaView = document.getElementById('viewVivaStandalone');

    // Reset visibility
    if (analyticsView) analyticsView.classList.remove('active');
    if (vivaView) vivaView.classList.remove('active');

    if (targetView === 'phone') {
      if (phoneCol) phoneCol.style.display = 'flex';
      if (engineCol) engineCol.style.display = 'none';
    } else if (targetView === 'stack') {
      if (phoneCol) phoneCol.style.display = 'none';
      if (engineCol) engineCol.style.display = 'flex';
    } else if (targetView === 'split') {
      if (phoneCol) phoneCol.style.display = 'flex';
      if (engineCol) engineCol.style.display = 'flex';
    } else if (targetView === 'analytics') {
      if (phoneCol) phoneCol.style.display = 'none';
      if (engineCol) engineCol.style.display = 'none';
      if (analyticsView) analyticsView.classList.add('active');
      this.renderAnalytics();
    } else if (targetView === 'viva') {
      if (phoneCol) phoneCol.style.display = 'none';
      if (engineCol) engineCol.style.display = 'none';
      if (vivaView) vivaView.classList.add('active');
    }
  }

  setTracerStep(msg) {
    if (this.tracerStepEl) {
      this.tracerStepEl.textContent = msg;
    }
  }

  startLiveClock() {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      if (this.phoneTimeEl) this.phoneTimeEl.textContent = `${hrs}:${mins}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  updateDialDisplay() {
    if (this.dialDisplayEl) {
      this.dialDisplayEl.textContent = this.currentDialNumber || ' ';
    }
  }

  // --- Call Simulation Engine ---
  startOutgoingCall(number) {
    this.currentActiveCaller = {
      number: number,
      type: 'Outgoing',
      name: this.getContactName(number)
    };
    this.currentDialNumber = '';
    this.updateDialDisplay();
    this.activeCallerName.textContent = this.currentActiveCaller.name || this.currentActiveCaller.number;
    this.activeCallOverlay.classList.add('open');
    document.querySelector('.dynamic-island')?.classList.add('calling');
    this.callSeconds = 0;
    this.activeCallTimer.textContent = '00:00';
    this.callTimerInterval = setInterval(() => {
      this.callSeconds++;
      const m = String(Math.floor(this.callSeconds / 60)).padStart(2, '0');
      const s = String(this.callSeconds % 60).padStart(2, '0');
      this.activeCallTimer.textContent = `${m}:${s}`;
    }, 1000);
  }

  endActiveCall() {
    if (this.callTimerInterval) {
      clearInterval(this.callTimerInterval);
      this.callTimerInterval = null;
    }
    this.activeCallOverlay.classList.remove('open');
    document.querySelector('.dynamic-island')?.classList.remove('calling');

    if (this.currentActiveCaller) {
      const callData = {
        number: this.currentActiveCaller.number,
        type: this.currentActiveCaller.type,
        duration: this.callSeconds,
        timestamp: this.stack.formatDate(new Date())
      };
      this.setTracerStep(`Call finished (${this.callSeconds}s). pushCall(&s, c): s->top=${this.stack.top + 1}`);
      const res = this.stack.pushCall(callData);
      if (res.success) {
        this.sound.playPush();
        this.renderAll();
        this.showToast(`Call ended (${this.callSeconds}s). Pushed to stack!`, 'success');
        this.logToTerminal(`PUSH -> Call ended: ${callData.number} | Duration: ${callData.duration}s`);
      }
    }
    this.currentActiveCaller = null;
  }

  triggerIncomingCall() {
    const list = Object.keys(this.contactsBook);
    const chosenNum = list[Math.floor(Math.random() * list.length)];
    const chosenName = this.contactsBook[chosenNum];
    this.currentActiveCaller = { name: chosenName, number: chosenNum, type: 'Incoming' };
    this.incomingCallerName.textContent = `${chosenName} (${chosenNum})`;
    this.incomingCallModal.classList.add('open');
    this.sound.playDTMF('5');
  }

  acceptIncomingCall() {
    this.incomingCallModal.classList.remove('open');
    this.activeCallerName.textContent = this.currentActiveCaller.name;
    this.activeCallOverlay.classList.add('open');
    document.querySelector('.dynamic-island')?.classList.add('calling');
    this.callSeconds = 0;
    this.activeCallTimer.textContent = '00:00';
    this.callTimerInterval = setInterval(() => {
      this.callSeconds++;
      const m = String(Math.floor(this.callSeconds / 60)).padStart(2, '0');
      const s = String(this.callSeconds % 60).padStart(2, '0');
      this.activeCallTimer.textContent = `${m}:${s}`;
    }, 1000);
  }

  declineIncomingCall() {
    this.incomingCallModal.classList.remove('open');
    if (this.currentActiveCaller) {
      const callData = {
        number: this.currentActiveCaller.number,
        type: 'Missed',
        duration: 0,
        timestamp: this.stack.formatDate(new Date())
      };
      this.setTracerStep(`Missed Call: pushCall(&s, c) -> type="Missed", duration=0`);
      this.stack.pushCall(callData);
      this.renderAll();
      this.showToast(`Missed call from ${this.currentActiveCaller.name} pushed to stack!`, 'danger');
      this.logToTerminal(`PUSH -> Missed Call: ${callData.number} (0s)`);
    }
    this.currentActiveCaller = null;
  }

  // --- Stack Core Operations Handlers ---
  executePop() {
    if (this.stack.isEmpty()) {
      this.setTracerStep('popCall(&s, &deleted): FAILED -> isEmpty(s) is TRUE (Underflow)');
      this.showToast('Call log is empty. Nothing to delete (Stack Underflow).', 'danger');
      this.logToTerminal('POP -> Error: Call log is empty. Underflow condition!');
      return;
    }
    const targetIdx = this.stack.top;
    this.setTracerStep(`popCall(&s, &deleted): *deleted = calls[${targetIdx}]; s->top-- (${targetIdx} -> ${targetIdx - 1});`);

    const topItemSlot = document.querySelector('.stack-slot.top-item');
    if (topItemSlot) topItemSlot.classList.add('pop-animate');
    this.sound.playPop();

    setTimeout(() => {
      const res = this.stack.popCall();
      if (res.success) {
        this.renderAll();
        const d = res.record;
        this.showToast(`Deleted recent call: ${d.number} (${d.type})`, 'danger');
        this.logToTerminal(`POP -> Deleted recent call -> Number: ${d.number} | Type: ${d.type} | Duration: ${d.duration}s | Time: ${d.timestamp}`);
      }
    }, 250);
  }

  executePeek() {
    const res = this.stack.peekCall();
    if (!res.success) {
      this.setTracerStep('peekCall(&s, &top): FAILED -> isEmpty(s) is TRUE');
      this.showToast('Call log is empty.', 'danger');
      this.logToTerminal('PEEK -> Error: Call log is empty.');
      return;
    }
    this.sound.playPeek();
    const c = res.record;
    this.setTracerStep(`peekCall(&s, &top): Inspecting calls[s->top = ${this.stack.top}] without modifying s->top`);

    const topPhoneItem = document.querySelector('.call-item.is-top');
    if (topPhoneItem) {
      topPhoneItem.classList.remove('highlight-peek');
      void topPhoneItem.offsetWidth;
      topPhoneItem.classList.add('highlight-peek');
    }
    const topVizItem = document.querySelector('.stack-slot.top-item');
    if (topVizItem) {
      topVizItem.classList.remove('highlight-peek');
      void topVizItem.offsetWidth;
      topVizItem.classList.add('highlight-peek');
    }

    this.showToast(`PEEK Top: ${c.number} (${c.type}, ${c.duration}s)`, 'info');
    this.logToTerminal(`PEEK -> Last dialed/received call -> Number: ${c.number} | Type: ${c.type} | Duration: ${c.duration}s | Time: ${c.timestamp}`);
  }

  executeTraverse() {
    if (this.stack.isEmpty()) {
      this.setTracerStep('viewCallLog(&s): isEmpty(s) == TRUE -> Log empty');
      this.showToast('Call log is empty. No calls to display.', 'danger');
      this.logToTerminal('TRAVERSAL -> Call log is empty.');
      return;
    }
    this.setTracerStep(`viewCallLog(&s): for (i = ${this.stack.top}; i >= 0; i--) printing records in O(n)`);
    this.showToast(`Traversing Call Stack: ${this.stack.top + 1} calls (LIFO order)`, 'info');
    this.logToTerminal(`\n--------------------------------------------------------------\n%-15s %-10s %-10s %-15s\nNumber          Type       Duration   Timestamp      \n--------------------------------------------------------------`);
    const logs = this.stack.viewCallLog();
    logs.forEach(call => {
      this.logToTerminal(`${call.number.padEnd(15)} ${call.type.padEnd(10)} ${String(call.duration).padEnd(10)} ${call.timestamp}`);
    });
    this.logToTerminal(`--------------------------------------------------------------\nTotal calls in log: ${this.stack.top + 1}\n`);

    const recentsTabBtn = document.querySelector('[data-tab="recents"]');
    if (recentsTabBtn) recentsTabBtn.click();
  }

  // --- Rendering Functions ---
  renderAll() {
    this.renderRecents();
    this.renderVisualizer();
    this.renderHUD();
    this.renderAnalytics();
  }

  renderRecents() {
    if (!this.recentsListEl) return;
    const calls = this.stack.viewCallLog();

    if (calls.length === 0) {
      this.recentsListEl.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <p style="font-weight: 600; font-size: 13.5px; color: #fff;">Call Log is Empty</p>
          <p style="font-size: 11.5px;">Stack Underflow (s->top = -1). Dial a number or click PUSH to add calls.</p>
        </div>
      `;
      if (this.stackTopBannerEl) {
        this.stackTopBannerEl.innerHTML = `<span>STACK STATUS</span><span>EMPTY (s->top = -1)</span>`;
      }
      return;
    }

    let filtered = calls.filter(c => {
      if (this.activeFilter !== 'all' && c.type.toLowerCase() !== this.activeFilter.toLowerCase()) {
        return false;
      }
      if (this.searchQuery) {
        const contactName = (this.getContactName(c.number) || '').toLowerCase();
        const num = c.number.toLowerCase();
        return contactName.includes(this.searchQuery) || num.includes(this.searchQuery);
      }
      return true;
    });

    let html = '';
    filtered.forEach((c) => {
      const isTop = c.stackIndex === this.stack.top;
      const typeLower = c.type.toLowerCase();
      const contact = this.getContactName(c.number);
      const displayName = contact || c.number;
      const initials = displayName.slice(0, 2).toUpperCase();

      const icon = typeLower === 'incoming' 
        ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="7" x2="17" y2="17"></line><polyline points="17 7 17 17 7 17"></polyline></svg>`
        : typeLower === 'outgoing'
        ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`
        : `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16 16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1"></path></svg>`;

      html += `
        <div class="call-item ${isTop ? 'is-top' : ''}" data-index="${c.stackIndex}">
          <div class="call-left">
            <div class="avatar" style="border-color: ${typeLower === 'missed' ? 'var(--accent-red)' : typeLower === 'incoming' ? 'var(--accent-green)' : 'var(--primary-light)'}">
              ${initials}
            </div>
            <div class="call-info">
              <span class="call-number">${displayName}</span>
              ${contact ? `<span style="font-size:9.5px; color:var(--text-dim); font-family:var(--font-mono);">${c.number}</span>` : ''}
              <div class="call-meta">
                <span class="badge-type ${typeLower}">
                  ${icon} ${c.type}
                </span>
                <span>•</span>
                <span class="call-duration">${c.duration}s</span>
              </div>
            </div>
          </div>
          <div class="call-right">
            <span class="call-time">${c.timestamp}</span>
            <button class="btn btn-sm" style="padding: 2px 7px; font-size: 10px;" onclick="window.app.redialNumber('${c.number}')">
              Dial
            </button>
          </div>
        </div>
      `;
    });

    this.recentsListEl.innerHTML = html;
    if (this.stackTopBannerEl) {
      this.stackTopBannerEl.innerHTML = `
        <span>LIFO STACK: calls[0..${this.stack.top}]</span>
        <span>TOP INDEX: [${this.stack.top}] (${this.stack.top + 1}/50)</span>
      `;
    }
  }

  renderVisualizer() {
    if (!this.stackItemsStack) return;

    if (this.stack.isEmpty()) {
      this.stackItemsStack.innerHTML = `
        <div class="empty-state" style="padding: 30px;">
          <p style="font-family: var(--font-mono); font-size: 12.5px; color: var(--text-dim);">
            CallStack is empty: s->top = -1<br>
            Awaiting pushCall() operations
          </p>
        </div>
      `;
      return;
    }

    let html = '';
    for (let i = 0; i <= this.stack.top; i++) {
      const c = this.stack.calls[i];
      const isTop = i === this.stack.top;
      const memAddr = `0x7ff00` + (100 + i * 8).toString(16);
      const name = this.getContactName(c.number);

      html += `
        <div class="stack-slot ${isTop ? 'top-item' : ''}" id="slot-${i}">
          <div class="slot-index">
            ${isTop ? '<span class="pointer-arrow">TOP ➔</span>' : ''}
            <span>[${i}]</span>
          </div>
          <div class="slot-content">
            <span class="slot-number">${name ? `${name} (${c.number})` : c.number} <small style="color:var(--text-muted)">• ${c.type}</small></span>
            <span class="slot-details">Duration: ${c.duration}s | Date: ${c.timestamp}</span>
          </div>
          <div class="slot-memory">
            <span>${memAddr}</span>
          </div>
        </div>
      `;
    }

    if (!this.stack.isFull()) {
      const nextIdx = this.stack.top + 1;
      const memAddr = `0x7ff00` + (100 + nextIdx * 8).toString(16);
      html += `
        <div class="stack-slot empty-preview">
          <div class="slot-index">
            <span>[${nextIdx}]</span>
          </div>
          <div class="slot-content">
            <span class="slot-number" style="color: var(--text-dim); font-style: italic;">(Next available push slot)</span>
          </div>
          <div class="slot-memory">
            <span>${memAddr}</span>
          </div>
        </div>
      `;
    }

    this.stackItemsStack.innerHTML = html;
  }

  renderHUD() {
    const count = this.stack.top + 1;
    const pct = Math.round((count / this.stack.MAX) * 100);

    if (this.hudTopPointer) this.hudTopPointer.textContent = this.stack.top;
    if (this.metricTop) this.metricTop.textContent = this.stack.top;
    if (this.metricCount) this.metricCount.textContent = `${count} / ${this.stack.MAX}`;
    if (this.metricPercent) this.metricPercent.textContent = `${pct}% buffer used`;
    if (this.metricProgressFill) this.metricProgressFill.style.width = `${pct}%`;

    if (this.hudStackState) {
      if (this.stack.isEmpty()) {
        this.hudStackState.textContent = 'EMPTY (UNDERFLOW)';
        this.hudStackState.style.color = 'var(--text-dim)';
      } else if (this.stack.isFull()) {
        this.hudStackState.textContent = 'FULL (OVERFLOW)';
        this.hudStackState.style.color = 'var(--accent-red)';
      } else {
        this.hudStackState.textContent = 'ACTIVE';
        this.hudStackState.style.color = 'var(--accent-green)';
      }
    }
  }

  renderAnalytics() {
    const totalCalls = this.stack.top + 1;
    let totalSeconds = 0;
    let missedCount = 0;
    let outgoingCount = 0;
    let incomingCount = 0;

    for (let i = 0; i <= this.stack.top; i++) {
      const c = this.stack.calls[i];
      totalSeconds += (c.duration || 0);
      const t = c.type.toLowerCase();
      if (t === 'missed') missedCount++;
      else if (t === 'outgoing') outgoingCount++;
      else if (t === 'incoming') incomingCount++;
    }

    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const talkTimeStr = `${mins}m ${secs}s`;
    const memoryBytes = 50 * 48 + 4; // 50 * sizeof(CallRecord) + sizeof(int)

    const elTotalTalk = document.getElementById('statTotalTalk');
    const elTotalCalls = document.getElementById('statTotalCalls');
    const elMissedRatio = document.getElementById('statMissedRatio');
    const elMemoryFootprint = document.getElementById('statMemoryFootprint');

    if (elTotalTalk) elTotalTalk.textContent = talkTimeStr;
    if (elTotalCalls) elTotalCalls.textContent = totalCalls;
    if (elMissedRatio) {
      const pct = totalCalls > 0 ? Math.round((missedCount / totalCalls) * 100) : 0;
      elMissedRatio.textContent = `${pct}% (${missedCount} calls)`;
    }
    if (elMemoryFootprint) elMemoryFootprint.textContent = `${memoryBytes} bytes (Stack)`;
  }

  // --- Terminal Emulator Logic ---
  initTerminal() {
    if (!this.termInput) return;
    this.termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = this.termInput.value.trim();
        this.termInput.value = '';
        this.handleTerminalCommand(val);
      }
    });

    this.logToTerminal(`===================== MOBILE CALL LOG MENU =====================`);
    this.logToTerminal(`1. Add New Call (Push)`);
    this.logToTerminal(`2. Delete Recent Call (Pop)`);
    this.logToTerminal(`3. View Last Dialed / Most Recent Call (Peek)`);
    this.logToTerminal(`4. View Complete Call Log`);
    this.logToTerminal(`5. Exit`);
    this.logToTerminal(`==================================================================`);
    this.logToTerminal(`GCC Compiler v9.3.0 CSN102 Runtime initialized.\nType 1-5 or click GUI buttons.\n`);
  }

  handleTerminalCommand(cmd) {
    this.logToTerminal(`$ user_input: ${cmd}`, 'term-prompt');
    switch (cmd) {
      case '1':
        this.openAddCallModal();
        this.logToTerminal(`Executing Option 1: Enter call details in GUI modal...`);
        break;
      case '2':
        this.executePop();
        break;
      case '3':
        this.executePeek();
        break;
      case '4':
        this.executeTraverse();
        break;
      case '5':
        this.logToTerminal(`Exiting Call Log Management System. Goodbye!`, 'term-highlight');
        this.showToast('Exiting Call Log Management System. Goodbye!', 'info');
        break;
      case 'clear':
        if (this.termBody) this.termBody.innerHTML = '';
        break;
      default:
        this.logToTerminal(`Invalid choice: "${cmd}". Please enter 1, 2, 3, 4, or 5.`);
    }
  }

  logToTerminal(text, className = 'term-line') {
    if (!this.termBody) return;
    const p = document.createElement('div');
    p.className = `term-line ${className}`;
    p.textContent = text;
    this.termBody.appendChild(p);
    this.termBody.scrollTop = this.termBody.scrollHeight;
  }

  getContactName(number) {
    return this.contactsBook[number] || null;
  }

  redialNumber(num) {
    const keypadTabBtn = document.querySelector('[data-tab="keypad"]');
    if (keypadTabBtn) keypadTabBtn.click();
    this.currentDialNumber = num;
    this.updateDialDisplay();
    this.sound.playDTMF('1');
    this.showToast(`Loaded ${num} on keypad!`, 'info');
  }

  openAddCallModal() {
    if (this.stack.isFull()) {
      this.showToast('Call log is FULL! Cannot add more calls (Stack Overflow).', 'danger');
      return;
    }
    const form = document.getElementById('addCallForm');
    if (form) form.reset();
    document.getElementById('inputTimestamp').value = this.stack.formatDate(new Date());
    this.openModal(this.addCallModal);
  }

  openModal(modal) {
    if (modal) modal.classList.add('open');
  }

  closeModal(modal) {
    if (modal) modal.classList.remove('open');
  }

  showToast(msg, type = 'info') {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  exportCSV() {
    const calls = this.stack.viewCallLog();
    if (calls.length === 0) {
      this.showToast('Stack is empty. Nothing to export.', 'danger');
      return;
    }
    let csv = 'Index,Phone Number,Contact,Type,Duration (s),Timestamp\n';
    calls.forEach(c => {
      const name = this.getContactName(c.number) || '';
      csv += `${c.stackIndex},"${c.number}","${name}","${c.type}",${c.duration},"${c.timestamp}"\n`;
    });
    this.downloadFile(csv, 'mobile_call_log_stack.csv', 'text/csv');
    this.showToast('Exported CSV file!', 'success');
  }

  exportJSON() {
    const data = {
      project: 'Mobile Call Log Management System',
      university: 'DIT University',
      course: 'CSN102 Data Structure',
      semester: 'Odd Sem, 2026-2027',
      team: [
        { name: 'Krishna Rustagi', sapId: '1000024715', section: 'BTRAI', role: 'Team Lead' },
        { name: 'Samaksh Raj', sapId: '1000025730', section: 'BTME' },
        { name: 'Rimesh Raj', sapId: '1000026934', section: 'BTME' },
        { name: 'Aditya Raj', sapId: '1000026924', section: 'BTME' }
      ],
      stackStatus: {
        top: this.stack.top,
        capacity: this.stack.MAX,
        totalCalls: this.stack.top + 1
      },
      callRecords: this.stack.viewCallLog()
    };
    this.downloadFile(JSON.stringify(data, null, 2), 'dit_call_log_report.json', 'application/json');
    this.showToast('Exported JSON data!', 'success');
  }

  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Global bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
