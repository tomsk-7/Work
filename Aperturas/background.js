// background.js — Service Worker
// Routes popup messages and keyboard shortcuts to the active CRM tab.
// All functions ≤ 6 lines (Google JS Style Guide).

const BUNDLE_PATH = 'Work/scripts.bundle.js';
const CMD_MAP = {
  'run-obr-apertura': 'OBR_APERTURA',
  'fill-arconte-clipboard': 'FILL_ARCONTE'
};

// ── Tab helpers ───────────────────────────────────────────────────────────────

const getActiveTab = () =>
  new Promise(r => chrome.tabs.query({ active: true, currentWindow: true }, t => r(t?.[0])));

// ── Script injection ──────────────────────────────────────────────────────────

const injectBundle = tabId =>
  chrome.scripting.executeScript({ target: { tabId }, files: [BUNDLE_PATH] });

const runBundleKey = (tabId, key) =>
  chrome.scripting.executeScript({
    target: { tabId },
    func: k => window.__REMEDY_SCRIPTS__?.run(k),
    args: [key],
  });

const runKeyInTab = async (tabId, key) => {
  await injectBundle(tabId);
  return runBundleKey(tabId, key);
};

const dispatchKey = async key => {
  if (!key) return;
  const tab = await getActiveTab();
  if (tab) runKeyInTab(tab.id, key);
};

// ── Message handlers ──────────────────────────────────────────────────────────

const openUrls = urls =>
  urls.forEach((url, i) => chrome.tabs.create({ url, active: i === 0 }));

const handleSnippetAction = payload =>
  payload?.type === 'open_urls' && Array.isArray(payload.urls) && openUrls(payload.urls);

const handleMessage = msg => {
  if (!msg?.action) return;
  if (msg.action === 'snippet_action') return handleSnippetAction(msg.payload);
  dispatchKey(msg.action.replace(/^run-/, '').toUpperCase());
};

// ── Listeners ─────────────────────────────────────────────────────────────────

chrome.commands.onCommand.addListener(cmd => dispatchKey(CMD_MAP[cmd]));
chrome.runtime.onMessage.addListener(handleMessage);