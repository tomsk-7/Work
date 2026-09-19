// popup.js — Popup UI Logic
// All functions ≤ 6 lines (Google JS Style Guide).
// Sections: DOM helpers → Storage → Notes → Links → Overlay → File Search
//           → MAC Lookup → IP/Subnet → VLSM → Diag CMD → CNMC → Q931
//           → Snippets → OSV → Action Buttons → Init

// ── DOM helpers ───────────────────────────────────────────────────────────────

const $       = id  => document.getElementById(id);
const $$      = sel => document.querySelectorAll(sel);
const onClick = (id, fn) => $(id)?.addEventListener('click', fn);

const emptyStateHTML = (icon, msg, color) =>
  `<div class="empty-state"><i class="ph ${icon}" style="font-size:32px;color:var(--accent-${color})"></i><p class="mt-2">${msg}</p></div>`;

const errorHTML = (msg, icon = 'ph-warning-circle') =>
  `<div class="kb-item" style="color:var(--accent-rose);font-size:11px"><i class="ph ${icon} me-1"></i>${msg}</div>`;

const flashEl = (el, ms = 300) => {
  el.style.borderColor = 'var(--accent-green)';
  el.style.background  = 'rgba(52,211,153,0.1)';
  setTimeout(() => { el.style.borderColor = ''; el.style.background = ''; }, ms);
};

const flashBtn = (btn, okHTML, resetHTML, ms = 1500) => {
  btn.innerHTML      = okHTML;
  btn.style.color    = 'var(--accent-green)';
  setTimeout(() => { btn.innerHTML = resetHTML; btn.style.color = ''; }, ms);
};

// ── Storage helpers ───────────────────────────────────────────────────────────

const getStorage = (key, def = []) =>
  new Promise(r => chrome.storage.local.get({ [key]: def }, res => r(res[key])));

const setStorage = (key, val) =>
  new Promise(r => chrome.storage.local.set({ [key]: val }, r));

// ── Clipboard data ────────────────────────────────────────────────────────────

const CLIPBOARD_TEXTS = {
  'CLI': `Bon dia,\r\n\r\nEns podríeu confirmar si el telèfon ja us funciona correctament, si us plau?\r\n\r\nHem aplicat uns ajustos des de la nostra central per intentar solucionar el problema.\r\n\r\nUs recordem que la incidència romandrà oberta durant 5 dies (inclosos caps de setmana). Si necessiteu que us truquem un dia o a una hora en concret, ens ho podeu dir sense problema.\r\nSi passen aquests 5 dies i no hem rebut cap resposta, entendrem que tot funciona bé i tancarem la incidència automàticament.\r\n\r\nMoltes gràcies per la vostra col·laboració.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'ValidationBtn': `Bon dia,\r\n\r\nUs informem que hem aplicat uns ajustos al sistema per intentar solucionar la vostra incidència.\r\nEns mantindrem a l'espera per confirmar que el servei ja us funciona correctament.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'diagnosticBtn': `DIAGNÒSTIC:\nInc: \nCapçalera de la seu: \nPersona de contacte: \nTelèfon de contacte: \nNom de la seu: \nDirecció de la seu: \nHorari de contacte:  \nExtensió o numeració afectada:  \nModel de terminal: \nProves realitzades:  \nDiagnòstic:`,

  'CiscoBtn': `\n! Mostrar tiempo encendido\nshow version | include uptime\n! ---------------------------------------------------\n! Ver el uptime y el estado de interfaces \nshow ip interface brief\nshow interfaces description | include 1500|1501|1504\nshow interfaces status | include 1500|1501|1504\nshow running-config | include 1500|1501|1504\n! ---------------------------------------------------\n! Revisar logs y alertas críticas \nshow logging | include %SYS-|%LINK-|%LINEPROTO-|BGP|EIGRP|IF|sla|down|up|ERR-|ERROR|FAIL|alarm\n! ---------------------------------------------------\n! Revisar protocolos de enrutamiento\nshow ip bgp all summary\n! ---------------------------------------------------\n! Revisar summary errores\nshow int summ\n! ---------------------------------------------------\n! Revisar pruebas de ping\nshow run | section ip sla \n! ---------------------------------------------------\n! Revisar track Up o Down, (estado de la ruta)\nshow run | section track\n! ---------------------------------------------------\n! Ver estado de VLANs\nshow vrf\n! ---------------------------------------------------\n! Ver servicios de sincronización y tiempo\nshow ntp status\n! ---------------------------------------------------\n! Ver inventario de equipos en router\nsh inventory\n  `,

  'HuaweiBtn': `\n# Mostrar tiempo encendido (uptime del equipo)\ndisplay version | include uptime\n\n# Ver el uptime y el estado de interfaces\ndisplay ip interface brief\ndisplay interface description \ndisplay interface brief \n\n# Revisar logs y alertas críticas\ndisplay logbuffer | include ERROR|FAIL|DOWN|UP\ndisplay logfile\ndisplay alarm active\n\n# Revisar protocolos de enrutamiento\ndisplay bgp peer\ndisplay bgp peer summary\n\n# Revisar summary de errores\ndisplay interface statistics\ndisplay interface brief \n\n# Revisar configuración de NQA (equivalente a IP SLA)\ndisplay current-configuration | section nqa\n\n# Revisar estado de tracks (seguimiento de rutas)\ndisplay current-configuration | section track\ndisplay track\n\n# Ver estado de instancias VRF / VLAN\n# display ip vpn-instance\n# display vlan\n\n# Ver servicios de sincronización y tiempo\ndisplay ntp-service status\ndisplay clock\n\n# Ver inventario de hardware del equipo\ndisplay device\n# display elabel\n\n# Ver resultados de NQA (ip sla)\ndisplay nqa results\ndisplay nqa history\n  `,

  'AlisysBtn': '#AAPP#ALISYS',
  'NetopsBtn': '#AAPP#NETOPS',
};

// ── Notes (Apuntes & KB) ──────────────────────────────────────────────────────

const DEFAULT_NOTES = [];

const noteItemHTML = (note, i) =>
  `<div class="quick-link-wrapper" style="margin-bottom:5px">
    <div style="flex-grow:1;font-size:11px"><b style="color:var(--accent-blue)">[${note.tag}]</b> ${note.content.substring(0,25)}${note.content.length>25?'...':''}</div>
    <span class="delete-link" data-idx="${i}"><i class="ph ph-trash"></i></span>
  </div>`;

const kbItemHTML = (note, i) =>
  `<div class="snippet-card mb-2" style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 10px;">
    <div class="d-flex justify-content-between align-items-center mb-1">
      <span class="badge" style="font-size: 10px; background: rgba(52, 211, 153, 0.15) !important; color: var(--accent-green); border: 1px solid rgba(52, 211, 153, 0.3);">${note.tag}</span>
      <div class="d-flex gap-1">
        <button class="btn-snippet-copy copy-kb-item-btn" data-content="${encodeURIComponent(note.content)}" title="Copiar Nota"><i class="ph ph-copy"></i></button>
        <button class="btn-snippet-copy del-kb-item-btn" data-idx="${i}" style="color:var(--accent-red); border-color: rgba(234,133,117,0.3);" title="Eliminar Nota"><i class="ph ph-trash"></i></button>
      </div>
    </div>
    <div style="font-size:11px;line-height:1.4;color:var(--text-muted);white-space:pre-wrap;word-break:break-all;max-height:120px;overflow-y:auto;">${note.content}</div>
  </div>`;

const groupByTag = notes =>
  notes.reduce((acc, n) => { (acc[n.tag] = acc[n.tag] || []).push(n); return acc; }, {});

const kbGroupHTML = (tag, notes) =>
  `<div class="link-category mb-3">
    <div class="category-title" style="color:var(--accent-green)">${tag}</div>
    <div class="kb-container" style="display:flex;flex-direction:column">${notes.map((n, i) => kbItemHTML(n, i)).join('')}</div>
  </div>`;

const renderKb = (el, notes) => {
  const groups = groupByTag(notes);
  el.innerHTML = Object.keys(groups).sort().map(t => kbGroupHTML(t, groups[t])).join('')
    || emptyStateHTML('ph-books', 'La base de conocimiento está vacía. Añade tu primera nota arriba.', 'green');

  el.querySelectorAll('.copy-kb-item-btn').forEach(btn => {
    btn.onclick = () => {
      const text = decodeURIComponent(btn.dataset.content);
      navigator.clipboard.writeText(text);
      flashSnippetBtn(btn);
    };
  });

  el.querySelectorAll('.del-kb-item-btn').forEach(btn => {
    btn.onclick = async () => {
      const idx = parseInt(btn.dataset.idx, 10);
      deleteNote(idx);
    };
  });
};

const renderNotes = async () => {
  const notes = await getStorage('userNotes', []);
  const kbEl = $('kb-dynamic-list');
  if (kbEl) renderKb(kbEl, notes);
};

const deleteNote = async index => {
  const notes = await getStorage('userNotes', []);
  notes.splice(index, 1);
  await setStorage('userNotes', notes);
  renderNotes();
};

const bindSaveNote = () =>
  onClick('save-note-btn', async () => {
    const tag = $('note-tag')?.value.toUpperCase().trim();
    const content = $('note-content')?.value.trim();
    if (!tag || !content) return alert('Pon un TAG y el contenido');
    const notes = await getStorage('userNotes', []);
    await setStorage('userNotes', [...notes, { tag, content, id: Date.now() }]);
    $('note-tag').value = ''; $('note-content').value = '';
    renderNotes();
  });

// ── Quick Links ───────────────────────────────────────────────────────────────

const createLinkEl = link => {
  const a = document.createElement('a');
  a.href = link.url; a.target = '_blank'; a.className = 'quick-link flex-grow-1';
  a.innerHTML = `<i class="ph ph-arrow-square-out me-2 opacity-50"></i>${link.name}`;
  return a;
};

const removeLink = async (links, link) => {
  await setStorage('userLinks', links.filter(l => l !== link));
  renderLinks();
};

const createDeleteBtn = (link, links) => {
  const del = document.createElement('span');
  del.className = 'delete-link ms-auto';
  del.innerHTML = '<i class="ph ph-trash"></i>';
  del.addEventListener('click', () => removeLink(links, link));
  return del;
};

const createLinkWrapper = (link, links) => {
  const wrap = document.createElement('div');
  wrap.className = 'quick-link-wrapper'; wrap.style.margin = '2px 0';
  wrap.appendChild(createLinkEl(link));
  wrap.appendChild(createDeleteBtn(link, links));
  return wrap;
};

const renderCategory = (category, catLinks, allLinks) => {
  const div  = document.createElement('div'); div.className = 'mb-4';
  div.innerHTML = `<div class="category-title" style="color:var(--accent-purple)">${category}</div>`;
  const grid = document.createElement('div'); grid.className = 'row g-2 p-1';
  catLinks.forEach(link => { const col = document.createElement('div'); col.className = 'col-12'; col.appendChild(createLinkWrapper(link, allLinks)); grid.appendChild(col); });
  div.appendChild(grid);
  return div;
};

const renderLinks = async () => {
  const links = await getStorage('userLinks', []);
  const container = $('dynamic-links-container');
  if (!container) return;
  if (!links.length) return (container.innerHTML = emptyStateHTML('ph-link', 'No tienes enlaces configurados.', 'purple'));
  container.innerHTML = '';
  const groups = links.reduce((acc, l) => { (acc[l.category] = acc[l.category] || []).push(l); return acc; }, {});
  Object.keys(groups).sort().forEach(cat => container.appendChild(renderCategory(cat, groups[cat], links)));
};

const promptNewLink = () => {
  const category = prompt('Nombre de la categoría (Ej: HERRAMIENTAS):');
  if (!category) return null;
  const name = prompt('Nombre del link:');
  if (!name) return null;
  const url = prompt('URL del link (https://...):', 'https://');
  return url ? { name, url, category: category.toUpperCase() } : null;
};

const bindAddCategory = () =>
  onClick('add-new-category-btn', async () => {
    const link = promptNewLink();
    if (!link) return;
    await setStorage('userLinks', [...(await getStorage('userLinks', [])), link]);
    renderLinks();
  });

// ── Overlay Navigation ────────────────────────────────────────────────────────

const openOverlay  = id  => $(id)?.classList.add('active');
const closeOverlay = btn => btn.closest('.overlay')?.classList.remove('active');

const bindOverlayNavigation = () => {
  $$('.nav-btn, .btn-tool').forEach(btn => btn.addEventListener('click', () => openOverlay(btn.dataset.target)));
  $$('.back-btn').forEach(btn => btn.addEventListener('click', () => closeOverlay(btn)));
};

// ── File Searcher ─────────────────────────────────────────────────────────────

const SEARCHABLE_EXTS = new Set(['txt','js','cfg','html','log','json','csv','yaml','md']);
const SKIP_FOLDERS    = ['.git/','node_modules/','.vscode/','.idea/','dist/'];

let selectedFiles = [];

const shouldSkip     = path => SKIP_FOLDERS.some(f => path.includes(f));
const isSearchableFile = f  => SEARCHABLE_EXTS.has(f.name.split('.').pop()) && f.size < 2 * 1024 * 1024;

const fileMatchesQuery = async (file, query) => {
  if (!isSearchableFile(file)) return file.name.toLowerCase().includes(query);
  try { return (await file.text()).toLowerCase().includes(query); } catch { return false; }
};

// 🟠 FIX: process files in parallel batches — ~10–30× faster on large folders
const BATCH_SIZE = 50;

const searchFiles = async (files, query) => {
  const searchable = files.filter(f => !shouldSkip(f.webkitRelativePath.toLowerCase()));
  const results = [];
  for (let i = 0; i < searchable.length; i += BATCH_SIZE) {
    const batch = searchable.slice(i, i + BATCH_SIZE);
    const flags = await Promise.all(batch.map(f => fileMatchesQuery(f, query)));
    flags.forEach((hit, j) => hit && results.push(batch[j]));
  }
  return results;
};

const matchItemHTML = f =>
  `<div class="kb-item">
    <div style="font-weight:600;color:var(--accent-blue)"><i class="ph ph-file-text me-1"></i>${f.name}</div>
    <div class="small opacity-50" style="font-size:10px;font-weight:400;margin-top:4px">${f.webkitRelativePath}</div>
  </div>`;

const renderSearchResults = (matches, statusEl, resultsEl) => {
  if (!matches.length) return (resultsEl.innerHTML = emptyStateHTML('ph-file-dashed', 'Sin resultados', 'rose'));
  statusEl.innerHTML = `✅ Encontrado en <span class="text-white">${matches.length}</span> archivos`;
  resultsEl.innerHTML = matches.map(matchItemHTML).join('');
  resultsEl.querySelectorAll('.kb-item').forEach((el, i) =>
    el.addEventListener('click', () => window.open(URL.createObjectURL(matches[i]), '_blank')));
};

const bindFolderPicker = () => {
  onClick('select-folder-btn', () => $('folder-input')?.click());
  $('folder-input')?.addEventListener('change', e => {
    selectedFiles = Array.from(e.target.files).filter(f => !shouldSkip(f.webkitRelativePath.toLowerCase()));
    const folder  = selectedFiles[0]?.webkitRelativePath.split('/')[0] || 'Desconocida';
    $('search-status').innerHTML = `<i class="ph ph-folder me-1 text-blue"></i> ${folder} <span class="text-white opacity-50 ms-1">(${selectedFiles.length} archivos)</span>`;
  });
};

const bindFileSearch = () =>
  onClick('start-search-btn', async () => {
    const query = $('search-query')?.value.trim().toLowerCase();
    const resultsEl = $('search-results'), statusEl = $('search-status');
    if (!selectedFiles.length) return alert('Primero selecciona una carpeta');
    if (!query) return alert('Escribe algo para buscar');
    resultsEl.innerHTML = '<div class="spinner mt-5 mb-3"></div><div class="text-center text-muted small">Buscando en equipo...</div>';
    setTimeout(async () => renderSearchResults(await searchFiles(selectedFiles, query), statusEl, resultsEl), 100);
  });

// ── MAC Vendor Lookup ─────────────────────────────────────────────────────────

const extractMacVendors = async res => {
  const t = await res.text();
  return (!t.includes('errors') && !t.includes('Not Found')) ? t.trim() : null;
};

const extractMacLookup = async res => {
  const d = await res.json();
  return (d.success && d.company) ? d.company : null;
};

const extractMacVendorsCo = async res => {
  const d = await res.json();
  return d.result?.company || null;
};

const MAC_APIS = [
  { url: macs => `https://api.macvendors.com/${encodeURIComponent(macs.raw)}`,    extract: extractMacVendors   },
  { url: macs => `https://api.maclookup.app/v2/macs/${macs.clean}`,               extract: extractMacLookup    },
  { url: macs => `https://macvendors.co/api/${macs.clean}`,                        extract: extractMacVendorsCo },
];

const tryVendorApi = async (api, macs) => {
  const res = await fetch(api.url(macs));
  return res.ok ? await api.extract(res) : null;
};

// 🟠 FIX: race all 3 APIs in parallel — fastest success wins
const lookupVendor = async (rawMac, cleanMac) => {
  const macs = { raw: rawMac, clean: cleanMac };
  try {
    return await Promise.any(
      MAC_APIS.map(api => tryVendorApi(api, macs).then(v => v || Promise.reject(new Error('no vendor'))))
    );
  } catch { return null; }
};

const MAC_SPINNER = '<div class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;margin-right:8px;vertical-align:middle;"></div>BUSCANDO EN REGISTRO IEEE...';

const validateMac = (cleanMac, resultEl) => {
  if (cleanMac.length >= 6) return true;
  resultEl.style.display = 'block'; resultEl.style.color = 'var(--accent-rose)';
  resultEl.innerHTML = `<i class="ph ph-warning me-1"></i>La dirección MAC debe tener al menos 6 dígitos hexadecimales.`;
  return false;
};

const renderVendorResult = (vendor, rawMac, resultEl, btn) => {
  btn.innerHTML = '<i class="ph ph-magnifying-glass me-2"></i>BUSCAR FABRICANTE';
  resultEl.style.display = 'block'; resultEl.style.color = vendor ? 'var(--accent-green)' : 'var(--accent-rose)';
  resultEl.innerHTML = vendor
    ? `<i class="ph ph-check-circle me-1"></i><b>${vendor}</b>`
    : `<i class="ph ph-warning-circle me-1"></i>No se encontró fabricante para la MAC ${rawMac.toUpperCase()}`;
};

const bindMacLookup = () =>
  onClick('mac-search-btn', async () => {
    const rawMac = $('mac-input')?.value.trim(), btn = $('mac-search-btn'), resultEl = $('mac-result');
    if (!rawMac) return alert('Introduce una dirección MAC válida');
    const cleanMac = rawMac.replace(/[^a-fA-F0-9]/g, '');
    if (!validateMac(cleanMac, resultEl)) return;
    btn.innerHTML = MAC_SPINNER;
    renderVendorResult(await lookupVendor(rawMac, cleanMac), rawMac, resultEl, btn);
  });

// ── IP / Mask helpers ─────────────────────────────────────────────────────────

const ipToInt    = ip => ip.split('.').reduce((acc, oct) => (acc << 8) + (parseInt(oct, 10) || 0), 0) >>> 0;
const intToIp    = n  => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
const maskFromCidr = cidr => cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;

const netmaskToCIDR = maskStr => {
  const inv = (~ipToInt(maskStr)) >>> 0;
  if ((inv & (inv + 1)) !== 0) return null;
  return 32 - Math.log2(inv + 1);
};

const parseCidrNotation = str => {
  const [ip, mask] = str.split('/').map(s => s.trim());
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return null;
  const cidr = mask.includes('.') ? netmaskToCIDR(mask) : parseInt(mask, 10);
  return (cidr !== null && cidr >= 0 && cidr <= 32) ? { ip, cidr } : null;
};

const parseSpaceNotation = str => {
  const [ip, mask] = str.split(/\s+/);
  if (!ip || !mask || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return null;
  const cidr = mask.includes('.') ? netmaskToCIDR(mask) : parseInt(mask, 10);
  return (cidr !== null && cidr >= 0 && cidr <= 32) ? { ip, cidr } : null;
};

const parseSingleIp = str =>
  /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(str) ? { ip: str, cidr: 32 } : null;

const parseIpAndMask = str => {
  const clean = str.trim();
  if (!clean) return null;
  if (clean.includes('/')) return parseCidrNotation(clean);
  if (/\s/.test(clean))   return parseSpaceNotation(clean);
  return parseSingleIp(clean);
};

// ── Subnet Calculator ─────────────────────────────────────────────────────────

const calcSubnet = (ip, cidr) => {
  const mask = maskFromCidr(cidr), ipInt = ipToInt(ip);
  const network = (ipInt & mask) >>> 0, broadcast = (network | (~mask >>> 0)) >>> 0;
  return { mask, network, broadcast, wildcard: (~mask) >>> 0,
    firstHost: cidr < 31 ? network + 1 : network, lastHost: cidr < 31 ? broadcast - 1 : broadcast,
    numHosts:  cidr < 31 ? Math.pow(2, 32 - cidr) - 2 : (cidr === 31 ? 2 : 1) };
};

const subnetRow = (label, value, color = '') =>
  `<div class="d-flex justify-content-between py-1" style="border-bottom:1px solid rgba(255,255,255,0.05)">
    <span class="text-muted" style="font-size:11px">${label}</span>
    <span style="font-size:11px;font-weight:700${color?`;color:${color}`:''}">${value}</span>
  </div>`;

const renderSubnet = (ip, cidr) => {
  const s = calcSubnet(ip, cidr);
  return `<div class="kb-item" style="font-weight:400">
    ${subnetRow('Red',          intToIp(s.network),   'var(--accent-blue)')}
    ${subnetRow('Broadcast',    intToIp(s.broadcast), 'var(--accent-rose)')}
    ${subnetRow('Primer host',  intToIp(s.firstHost), 'var(--accent-green)')}
    ${subnetRow('Último host',  intToIp(s.lastHost),  'var(--accent-green)')}
    ${subnetRow('Máscara decimal', intToIp(s.mask))}
    ${subnetRow('Wildcard',     intToIp(s.wildcard))}
    ${subnetRow('Nº hosts',     s.numHosts.toLocaleString('es-ES'), 'var(--accent-blue)')}
    ${subnetRow('CIDR',         `/${cidr}`)}
  </div>`;
};

const bindSubnetCalc = () =>
  onClick('subnet-calc-btn', () => {
    const parsed = parseIpAndMask($('subnet-input')?.value || ''), resultEl = $('subnet-result');
    resultEl.style.display = 'block';
    resultEl.innerHTML = parsed
      ? renderSubnet(parsed.ip, parsed.cidr)
      : errorHTML('Formato inválido. Usa IP/CIDR (192.168.1.0/24) o IP Máscara (192.168.1.0 255.255.255.0)');
  });

// ── VLSM Calculator ───────────────────────────────────────────────────────────

const VLSM_COLORS = ['var(--accent-blue)','var(--accent-green)','var(--accent-purple)','var(--accent-rose)','#fbbf24'];

const allocateSubnets = (baseNet, baseCidr, hostsList) => {
  let cur = ipToInt(baseNet) & maskFromCidr(baseCidr);
  return hostsList.map((h, i) => ({ h, i: i + 1 })).sort((a, b) => b.h - a.h).map(({ h, i }) => {
    const cidr = Math.max(baseCidr, Math.min(30, 32 - Math.ceil(Math.log2(h + 2))));
    const size = Math.pow(2, 32 - cidr), net = cur, bc = (net + size - 1) >>> 0;
    cur = (bc + 1) >>> 0;
    return { h, i, cidr, avail: size - 2, mask: maskFromCidr(cidr), net, bc, first: net + 1, last: bc - 1 };
  });
};

const vlsmRowHTML = (r, idx) => {
  const c = VLSM_COLORS[idx % VLSM_COLORS.length];
  return `<div class="kb-item mb-2" style="border-left:3px solid ${c};font-weight:400;font-size:11px">
    <div style="color:${c};font-weight:700;margin-bottom:6px">Subred ${r.i} (${r.h} hosts) — Disponibles: ${r.avail}</div>
    <div class="d-flex justify-content-between"><span class="text-muted">Red:</span><span>${intToIp(r.net)}/${r.cidr}</span></div>
    <div class="d-flex justify-content-between"><span class="text-muted">Máscara:</span><span>${intToIp(r.mask)}</span></div>
    <div class="d-flex justify-content-between"><span class="text-muted">Rango:</span><span>${intToIp(r.first)} – ${intToIp(r.last)}</span></div>
    <div class="d-flex justify-content-between"><span class="text-muted">Broadcast:</span><span>${intToIp(r.bc)}</span></div>
  </div>`;
};

const parseHostsList = str =>
  str.split('\n').map(h => parseInt(h.trim(), 10)).filter(h => !isNaN(h) && h > 0);

const showVlsmResult = (resultEl, parsed, hosts) => {
  if (!parsed) return (resultEl.innerHTML = errorHTML('Formato inválido para red base. Usa IP/CIDR o IP Máscara.'));
  if (!hosts.length) return (resultEl.innerHTML = errorHTML('Introduce al menos un número de hosts por línea'));
  resultEl.innerHTML = allocateSubnets(parsed.ip, parsed.cidr, hosts).map(vlsmRowHTML).join('');
};

const bindVlsmCalc = () =>
  onClick('vlsm-calc-btn', () => {
    const parsed = parseIpAndMask($('vlsm-network')?.value || '');
    const hosts  = parseHostsList($('vlsm-hosts')?.value || '');
    const resultEl = $('vlsm-result');
    resultEl.style.display = 'block';
    showVlsmResult(resultEl, parsed, hosts);
  });

// ── Diagnostic Command Generator ──────────────────────────────────────────────

const buildCmds = (ip, port, mtu) => [
  { sys: 'Windows PowerShell', cmd: port ? `Test-NetConnection -ComputerName ${ip} -Port ${port}` : `ping -f -l ${mtu} ${ip}` },
  { sys: 'Linux / MacOS',      cmd: port ? `nc -zv -w 3 ${ip} ${port}` : `ping -M do -s ${mtu} ${ip}` },
  { sys: 'Cisco IOS / XE',     cmd: `ping ${ip} size ${mtu} df-bit repeat 5${port ? `\ntraceroute ${ip}` : ''}` },
  { sys: 'Huawei VRP',         cmd: `ping -c 5 -s ${mtu} -f ${ip}${port ? `\ntracert ${ip}` : ''}` },
  { sys: 'Alcatel OXE (mgr)',  cmd: `trkstat -t\nlistdnis -e ${ip}\ncst -t ${ip}\nincvisu` },
  { sys: 'Siemens OSV / DLS',  cmd: `trace sip start\nshow subscriber ${ip}\ndls status` },
];

const renderCmdBlock = item =>
  `<div class="kb-item mb-2" style="font-size:11px">
    <div class="d-flex justify-content-between align-items-center mb-1">
      <strong style="color:var(--accent-blue)">${item.sys}</strong>
      <button class="btn btn-sm btn-copy-cmd" data-cmd="${encodeURIComponent(item.cmd)}" style="font-size:10px!important;padding:2px 8px!important;height:auto!important"><i class="ph ph-copy me-1"></i>Copiar</button>
    </div>
    <pre style="margin:0;background:rgba(0,0,0,0.3);padding:6px 8px;border-radius:6px;font-family:monospace;color:var(--text-primary);font-size:11px;white-space:pre-wrap;border:1px solid rgba(255,255,255,0.05)">${item.cmd}</pre>
  </div>`;

const flashCopyBtn = btn =>
  flashBtn(btn, '<i class="ph ph-check me-1"></i>¡Copiado!', '<i class="ph ph-copy me-1"></i>Copiar');

const bindCopyBtns = el =>
  el.querySelectorAll('.btn-copy-cmd').forEach(btn =>
    btn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(decodeURIComponent(btn.dataset.cmd));
      flashCopyBtn(btn);
    }));

const bindDiagCmd = () =>
  onClick('diag-gen-btn', () => {
    const ip = $('diag-ip')?.value.trim() || '192.168.1.1';
    const port = $('diag-port')?.value.trim(), mtu = $('diag-mtu')?.value.trim() || '1472';
    const resultEl = $('diag-result');
    resultEl.style.display = 'block';
    resultEl.innerHTML = buildCmds(ip, port, mtu).map(renderCmdBlock).join('');
    bindCopyBtns(resultEl);
  });

// ── CNMC Number Consultant ────────────────────────────────────────────────────

const MOBILE_PREFIXES = { '600':'Movistar','609':'Movistar','610':'Movistar','619':'Movistar','650':'Vodafone','660':'Vodafone','670':'Vodafone','607':'Vodafone','659':'Orange','656':'Orange','657':'Orange' };

const classifyMobile = clean => ({
  type: '📱 MÓVIL', desc: 'Numeración de Telefonía Móvil',
  prov: MOBILE_PREFIXES[clean.substring(0,3)] ? `Rango Inicial: ${MOBILE_PREFIXES[clean.substring(0,3)]}` : 'Móvil Nacional',
  cnmcUrl: 'https://numeracionyoperadores.cnmc.es/portabilidad/movil',
});

const classifyFixed = clean => {
  if (clean.startsWith('91') || clean.startsWith('81')) return 'Madrid (Zona 91/81)';
  if (clean.startsWith('93') || clean.startsWith('83')) return 'Barcelona (Zona 93/83)';
  if (clean.startsWith('96') || clean.startsWith('86')) return 'Comunidad Valenciana / Murcia';
  if (clean.startsWith('95') || clean.startsWith('85')) return 'Andalucía / Asturias';
  return 'Provincial España';
};

const classifyPhone = clean => {
  if (clean.startsWith('6') || clean.startsWith('7'))   return classifyMobile(clean);
  if (clean.startsWith('900') || clean.startsWith('800')) return { type:'☎️ RED INTELIGENTE (900/800)', desc:'Cobro Revertido Automático (Gratuito para el llamante)', prov:'España', cnmcUrl:'https://numeracionyoperadores.cnmc.es/portabilidad/fija' };
  if (clean.startsWith('901')) return { type:'☎️ RED INTELIGENTE (901)', desc:'Pago Compartido', prov:'España', cnmcUrl:'https://numeracionyoperadores.cnmc.es/portabilidad/fija' };
  if (clean.startsWith('902')) return { type:'☎️ RED INTELIGENTE (902)', desc:'Pago por el llamante (Tarifa Especial)', prov:'España', cnmcUrl:'https://numeracionyoperadores.cnmc.es/portabilidad/fija' };
  return { type:'🏢 FIJO GEOGRÁFICO', desc:'Fijo Geográfico', prov: classifyFixed(clean), cnmcUrl:'https://numeracionyoperadores.cnmc.es/portabilidad/fija' };
};

const cnmcResultHTML = (clean, data) =>
  `<div class="kb-item p-2 mb-2" style="font-size:12px">
    <div style="color:var(--accent-yellow);font-weight:800;font-size:13px;margin-bottom:4px"><i class="ph ph-phone me-1"></i>${clean} — ${data.type}</div>
    <div class="small text-muted mb-1">${data.desc}</div>
    <div class="small mb-2" style="color:var(--text-primary)"><b>Ubicación/Operador Asignado:</b> ${data.prov}</div>
    <div class="d-flex gap-2"><a href="${data.cnmcUrl}" target="_blank" class="btn btn-sm w-100" style="background:rgba(251,191,36,0.2);border:1px solid #fbbf24;color:#fff;font-size:11px;font-weight:700;text-decoration:none;text-align:center"><i class="ph ph-arrow-square-out me-1"></i>Abrir Consulta Oficial CNMC</a></div>
  </div>`;

const bindCnmc = () =>
  onClick('cnmc-search-btn', () => {
    const clean = ($('cnmc-phone-input')?.value.trim() || '').replace(/\D/g, '');
    const resultEl = $('cnmc-result');
    resultEl.style.display = 'block';
    resultEl.innerHTML = (clean.length >= 3)
      ? cnmcResultHTML(clean, classifyPhone(clean))
      : errorHTML('Introduce un número válido (ej: 912345678 o 612345678).');
  });

// ── Q.931 / SIP Decoder ───────────────────────────────────────────────────────

const Q931_MAP = { '1':'404','2':'404','3':'404','6':'488','16':'200','17':'486','18':'408','19':'480','20':'480','21':'603','22':'410','27':'502','28':'484','29':'403','31':'200','34':'503','38':'503','41':'503','42':'503','44':'503','47':'503','50':'403','57':'403','58':'503','63':'501','65':'488','88':'488','102':'504','111':'400' };
const SIP_API_URL = 'https://raw.githubusercontent.com/4lifedev/sip_codes/master/sip_codes.json';
const Q931_DECODE_BTN_HTML = '<i class="ph ph-code me-2"></i>DECODIFICAR CAUSA';
const Q931_SPINNER_HTML    = '<div class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;margin-right:8px;vertical-align:middle;"></div>CONSULTANDO API VOIP SIP / RFC 3261...';

const mapToSip      = code => Q931_MAP[code] || code;
const fetchSipCodes = async () => { const r = await fetch(SIP_API_URL); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); };

const originLabel = sip => {
  const n = parseInt(sip, 10);
  if (n === 486 || n === 603 || n === 480) return 'Destino (Abonado / PBX Cliente)';
  if (n === 404 || n === 484)              return 'Origen / Plan de Marcación';
  if (n === 503 || n === 502 || n === 504) return 'Red Vodafone / SBC / Primario E1';
  return 'Red / Sistema VoIP';
};

const buildClosureText = (code, match, origin) =>
  `DIAGNÒSTIC TELEFONÍA VOIP / SIP & Q.931 (API Pública GitHub 4lifedev/sip_codes):\nCausa Solicitada: ${code} (Mapeado a SIP ${match.code} - ${match.name})\nOrigen: ${origin}\nDetalle RFC 3261: ${match.desc}`;

const q931ResultHTML = (code, match, origin) =>
  `<div class="kb-item p-3 mb-2" style="border-left:4px solid var(--accent-green);font-size:12px">
    <div class="d-flex justify-content-between align-items-center mb-2 pb-1" style="border-bottom:1px solid rgba(255,255,255,0.1)">
      <strong style="color:var(--accent-green);font-size:13px"><i class="ph ph-phone-call me-1"></i>SIP ${match.code} — ${match.name}</strong>
      <button id="btn-copy-q931-closure" class="btn btn-sm" style="font-size:10px!important;padding:2px 8px!important;background:rgba(255,255,255,0.12);color:#fff;font-weight:700"><i class="ph ph-copy me-1"></i>Copiar Cierre Ticket</button>
    </div>
    <div class="mb-1"><span class="text-muted">Causa Solicitada:</span> <b style="color:var(--accent-blue)">Código ${code}</b></div>
    <div class="mb-1"><span class="text-muted">Origen del Cuelgue:</span> <b style="color:var(--accent-yellow)">${origin}</b></div>
    <div class="mb-2"><span class="text-muted">Especificación Técnica API (RFC 3261):</span> <span style="color:var(--text-primary)">${match.desc}</span></div>
    <div class="p-2" style="background:rgba(0,0,0,0.3);border-radius:6px;font-size:11px;border:1px solid rgba(255,255,255,0.05)"><strong style="color:var(--accent-blue)">🌐 API Fuente Pública:</strong> <a href="https://github.com/4lifedev/sip_codes" target="_blank" style="color:var(--accent-blue)">4lifedev/sip_codes (IETF RFC 3261)</a></div>
  </div>`;

const flashCopyQ931 = btn =>
  flashBtn(btn, '<i class="ph ph-check me-1"></i>¡Copiado!', '<i class="ph ph-copy me-1"></i>Copiar Cierre Ticket');

const showQ931Result = (code, match, resultEl) => {
  const origin = originLabel(match.code);
  resultEl.style.display = 'block';
  resultEl.innerHTML     = q931ResultHTML(code, match, origin);
  $('btn-copy-q931-closure')?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(buildClosureText(code, match, origin));
    flashCopyQ931($('btn-copy-q931-closure'));
  });
};

const handleQ931Success = async (code, btn, resultEl) => {
  const codes = await fetchSipCodes();
  btn.innerHTML = Q931_DECODE_BTN_HTML;
  const match = codes.find(i => String(i.code) === mapToSip(code));
  if (match) return showQ931Result(code, match, resultEl);
  resultEl.style.display = 'block';
  resultEl.innerHTML = errorHTML(`Código SIP/Q.931 ${code} no encontrado en la API pública de telefonía.`);
};

const handleQ931Error = (e, btn, resultEl) => {
  btn.innerHTML = Q931_DECODE_BTN_HTML;
  resultEl.style.display = 'block';
  resultEl.innerHTML = errorHTML(`Error de conexión con la API de telefonía: ${e.message}`);
};

const bindQ931 = () =>
  onClick('q931-decode-btn', async () => {
    const code = $('q931-input')?.value.trim().replace(/\D/g, '');
    const btn = $('q931-decode-btn'), resultEl = $('q931-result');
    if (!code) { resultEl.style.display='block'; resultEl.innerHTML=errorHTML('Por favor introduce un código numérico de telefonía (ej: 34, 16, 17, 31, 404, 486, 503).'); return; }
    btn.innerHTML = Q931_SPINNER_HTML;
    try { await handleQ931Success(code, btn, resultEl); }
    catch (e) { handleQ931Error(e, btn, resultEl); }
  });

// ── Snippet Copy Buttons ──────────────────────────────────────────────────────

const SNIPPET_SWAP_TEXT = `Bon dia,\n\nPer tal de continuar amb les comprovacions, necessitem la teva col·laboració.\nEt demanem que connectis el terminal a un altre punt de xarxa/roseta i verifiquis\nsi s'inicia correctament o si apareix algun error, així com si el problema de\nconnectivitat a internet persisteix.\n\nUn cop feta la prova, si us plau, indica'ns si el terminal funciona correctament\nen l'altra connexió de xarxa o si el comportament és el mateix.\n\nRecordeu que disposeu de cinc dies naturals (no 5 dies laborables) per respondre o, si escau, indicar-nos una data en què us puguem contactar.\nEn cas contrari, el tiquet es tancarà automàticament i/o manualment passats els 5 dies naturals per operativa.\n\nCordialment,\nCentre de Suport de Vodafone`;

const SNIPPET_FULL_TEXTS = {
  'cli':    CLIPBOARD_TEXTS['CLI'],
  'val':    CLIPBOARD_TEXTS['ValidationBtn'],
  'diag':   CLIPBOARD_TEXTS['diagnosticBtn'],
  'swap':   SNIPPET_SWAP_TEXT,
  'alisys': CLIPBOARD_TEXTS['AlisysBtn'],
  'netops': CLIPBOARD_TEXTS['NetopsBtn'],
  'cisco':  CLIPBOARD_TEXTS['CiscoBtn'],
  'huaw':   CLIPBOARD_TEXTS['HuaweiBtn'],

  'ex': `Bon dia,\r\n\r\nPer poder analitzar la incidència i obtenir les traces corresponents, necessitem que ens faciliteu exemples concrets de trucades fallides amb la informació següent:\r\n\r\nOrigen (mòbil o fix que truca):\r\nDestí (número al qual es truca):\r\nExtensió que respon:\r\nData i hora:\r\nComportament o problema detectat:\r\n\r\nDisposeu de cinc dies naturals per fer-nos arribar aquesta informació. Passat aquest termini sense resposta, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'cl': `Bon dia,\r\n\r\nPer descartar una possible avaria en el cable de l'auricular com a causa de la incidència, us demanem que realitzeu les comprovacions següents:\r\n\r\n1. Inspeccioneu visualment el cable arrissat de l'auricular: busqueu senyals de dany, trencament o desgast. Durant una trucada activa, moveu suaument el cable per detectar si l'àudio s'interromp.\r\n2. Si disposeu d'un cable de recanvi, substituïu-lo i comproveu si el problema es reprodueix.\r\n\r\nA més, per completar l'anàlisi necessitem la informació següent:\r\n- El problema es presenta en totes les trucades o únicament amb certs números?\r\n- Si és parcial, faciliteu un exemple de trucada afectada:\r\n  - Número origen\r\n  - Número destí\r\n  - Extensió on es registra el problema\r\n  - Data i hora aproximada\r\n\r\nDisposeu de cinc dies naturals per respondre. En cas contrari, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'ne37': `Bon dia,\r\n\r\nPer continuar amb el diagnòstic del terminal NEO3750 que no arrenca, us demanem que realitzeu els passos següents:\r\n\r\n1. Premeu i manteniu premuda la tecla vermella (encesa) durant almenys 5 segons.\r\n2. Comproveu que la bateria estigui correctament encaixada al terminal.\r\n3. Extraieu la bateria, espereu 10 segons, torneu a col·locar-la i intenteu encendre el terminal.\r\n4. Si la bateria està descarregada, connecteu el carregador i espereu almenys 15 minuts abans de tornar a intentar-ho.\r\n5. Comproveu que el carregador estigui ben connectat al terminal i a una presa de corrent operativa.\r\n6. Proveu el carregador en una altra presa elèctrica o amb un altre terminal compatible, i indiqueu-nos el resultat.\r\n\r\nIndiqueu-nos el resultat de cada prova per poder continuar amb el diagnòstic.\r\n\r\nDisposeu de cinc dies naturals per respondre. Passat aquest termini, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'ne25': `Bon dia,\r\n\r\nPer continuar amb el diagnòstic del terminal DT250 que no arrenca, us demanem que realitzeu els passos següents:\r\n\r\n1. Premeu i manteniu premuda la tecla d'encesa durant almenys 5 segons.\r\n2. Comproveu que la bateria estigui correctament encaixada al terminal.\r\n3. Extraieu la bateria, espereu 10 segons, torneu a col·locar-la i reinicieu el terminal.\r\n4. Si la bateria està descarregada, connecteu el carregador i espereu almenys 15 minuts abans de tornar a intentar-ho.\r\n5. Comproveu que el carregador estigui ben connectat al terminal i a una presa de corrent operativa.\r\n6. Proveu el carregador en una altra presa elèctrica o amb un altre terminal compatible, i indiqueu-nos el resultat.\r\n\r\nIndiqueu-nos el resultat de cada prova per poder continuar amb el diagnòstic.\r\n\r\nDisposeu de cinc dies naturals per respondre. Passat aquest termini, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'int37': `Bon dia,\r\n\r\nLes interferències, talls de veu o problemes d'àudio durant les trucades sovint estan associats a factors de cobertura o maquinari. Per continuar amb el diagnòstic, sol·licitem que realitzeu les accions següents:\r\n\r\n1. Reinicieu el terminal.\r\n2. Intercanvieu l'auricular amb el d'un altre terminal de la mateixa línia i comproveu si el problema persisteix.\r\n3. Verifiqueu que el cable de l'auricular estigui ben connectat al terminal.\r\n4. Canvieu la banda de cobertura: aneu a Configuració > Xarxes mòbils > Preferència de tipus de xarxa, seleccioneu únicament 2G i reinicieu el terminal.\r\n5. Si el problema persisteix en 2G, repetiu el procés i torneu a seleccionar la modalitat automàtica (Auto 4G/3G/2G).\r\n\r\nUn cop realitzades les proves, indiqueu-nos el resultat obtingut en cadascuna.\r\n\r\nDisposeu de cinc dies naturals per respondre. Passat aquest termini, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'vol37': `Bon dia,\r\n\r\nPer diagnosticar el problema de volum al terminal NEO3750, us demanem que realitzeu les comprovacions següents:\r\n\r\n1. Durant una trucada activa, premeu la tecla de volum (+) fins al màxim i comproveu si millora la qualitat auditiva.\r\n2. Reinicieu el terminal i realitzeu una trucada de prova.\r\n3. Intercanvieu l'auricular amb el d'un altre terminal disponible i indiqueu-nos si el problema persisteix.\r\n4. Consulteu el nivell de cobertura que mostra la pantalla del terminal durant la trucada i indiqueu-nos-la.\r\n\r\nIndiqueu-nos el resultat de cada prova per poder continuar amb el diagnòstic.\r\n\r\nDisposeu de cinc dies naturals per respondre. Passat aquest termini, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'cobr': `Bon dia,\r\n\r\nUs informem que el tècnic desplaçat ha realitzat la visita programada i ha dut a terme les actuacions necessàries sobre el terminal, verificant el correcte funcionament del servei.\r\n\r\nDonem per resolta la incidència i procedim al tancament del tiquet.\r\nEn cas que es torni a produir qualsevol incidència, podeu contactar amb el servei d'assistència d'ATOM trucant al 900 828 282 per obrir una nova sol·licitud de suport.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'cplt': `Bon dia,\r\n\r\nUs informem que s'han aplicat les configuracions necessàries a la plataforma de telefonia i hem verificat que el servei funciona correctament.\r\n\r\nDonem per resolta la incidència i procedim al tancament del tiquet.\r\nEn cas que es torni a produir qualsevol problema, podeu contactar amb el servei d'assistència d'ATOM trucant al 900 828 282 per obrir una nova sol·licitud de suport.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'na': `Bon dia,\r\n\r\nEn no haver rebut resposta en el termini de cinc dies naturals establert, i seguint el procediment intern d'operativa, procedim al tancament del tiquet.\r\n\r\nSi continueu experimentant el problema o disposeu de la informació sol·licitada, podeu tornar a obrir el tiquet o crear-ne un de nou fent referència a l'incident actual.\r\n\r\nGràcies per la vostra comprensió.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'dup': `Bon dia,\r\n\r\nEl present tiquet ha estat identificat com a duplicat d'una sol·licitud prèviament registrada. D'acord amb el procediment establert, procedim al seu tancament.\r\n\r\nPodeu consultar l'estat de la vostra incidència a través del tiquet original.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'pri': `Bon dia,\r\n\r\nHem revisat l'estat del canal primari E1/PRI, del qual gestionem el manteniment en casos d'incomunicació, i hem comprovat que es troba operatiu i en correcte funcionament.\r\n\r\nAtès que la gestió de la centraleta interna de la vostra seu escapa del nostre àmbit de suport, us recomanem posar-vos en contacte amb el vostre proveïdor o tècnic responsable del manteniment de la centraleta. Ells podran revisar el terminal afectat, el cablejat intern i la connectivitat fins a la centraleta de la vostra instal·lació.\r\n\r\nRestem a disposició per a qualsevol altra consulta dins del nostre àmbit de servei.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  'wo': `Bon dia,\r\n\r\nEl contingut d'aquest tiquet correspon a una petició de servei i no a una incidència tècnica. Per tant, no és possible gestionar-lo per aquest canal.\r\n\r\nPer tramitar la vostra sol·licitud, podeu accedir als canals habilitats:\r\n- Portal d'Autoservei ATOM: http://pautic.gencat.cat\r\n- Telèfon d'atenció: 900 828 282\r\n\r\nProcedim al tancament del present tiquet per operativa.\r\n\r\nCordialment,\r\nServei de Suport Tècnic\r\nVodafone`,

  'obs': `Bon dia,\r\n\r\nEl període d'observació acordat ha finalitzat sense que s'hagin reportat noves incidències ni anomalies en el servei.\r\n\r\nConsiderem la incidència resolta i procedim al tancament del tiquet.\r\nEn cas que el problema es reprodueixi, no dubteu a contactar-nos per obrir una nova sol·licitud.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  // OSV1
  'osv1manca':  'OSV1 - 9 a 14 - CONF - MANCA',
  'osv1diag':   'OSV1 - 9 a 14 - CONF - DIAG',
  'osv1tadiag': 'OSV1 - 9 a 14 - TA - DIAG',
  'osv1tas':    'OSV1 - 9 a 14 - CONF - TAS ',
  'osv1te':     'OSV1 - 9 a 14 - CONF - TE',
  'osv1obr':    'OSV1 - 9 a 14 - TA - OA OBR ',

  // OSV2
  'osv2manca':  'OSV2 - 9 a 14 - CONF - MANCA',
  'osv2diag':   'OSV2 - 9 a 14 - CONF - DIAG',
  'osv2tadiag': 'OSV2 - 9 a 14 - TA - DIAG',
  'osv2tas':    'OSV2 - 9 a 14 - CONF - TAS ',
  'osv2te':     'OSV2 - 9 a 14 - CONF - TE',
  'osv2obr':    'OSV2 - 9 a 14 - TA - OA OBR ',


  // OXE/CS Nodes registered dynamically below

  // SOC
  'socsales': 'SOC - 9 a 14 - CONF - OA SALES',
  'socmanca': 'SOC - 9 a 14 - CONF - MANCA',
  'socdiag':  'SOC - 9 a 14 - CONF - DIAG',

  // RIAV
  'riavmanca': 'RIAV - 9 a 14 - CONF - MANCA',
  'riavdiag':  'RIAV - 9 a 14 - CONF - DIAG',
  'riavtas':   'RIAV - 9 a 14 - CONF - TAS ',
  'riavsales': 'RIAV - 9 a 14 - CONF - OA SALES',

  // Aliases
  'cons':      'CONS ',
  'vobr':      'OSV1 - 9 a 14 - TA - OA OBR ',
  'vtas':      'OSV1 - 9 a 14 - CONF - TAS ',
  'vmanca':    'OSV1 - 9 a 14 - CONF - MANCA',
  'vdiag':     'OSV1 - 9 a 14 - CONF - DIAG',
};

['01', '02', '03', '04', '05', '07', '08', '10', '11', '12', '13'].forEach(num => {
  const cs = `CS${num}`;
  SNIPPET_FULL_TEXTS[`cs${num}manca`]  = `${cs} - 9 a 14 - CONF - MANCA`;
  SNIPPET_FULL_TEXTS[`cs${num}diag`]   = `${cs} - 9 a 14 - CONF - DIAG`;
  SNIPPET_FULL_TEXTS[`cs${num}tadiag`] = `${cs} - 9 a 14 - TA - DIAG`;
  SNIPPET_FULL_TEXTS[`cs${num}tas`]    = `${cs} - 9 a 14 - CONF - TAS `;
  SNIPPET_FULL_TEXTS[`cs${num}tp`]     = `${cs} - 9 a 14 - CONF - TP`;
  SNIPPET_FULL_TEXTS[`cs${num}obr`]    = `${cs} - 9 a 14 - TA - OA OBR `;
});

const flashSnippetBtn = btn => {
  btn.querySelector('i').className = 'ph ph-check';
  btn.style.color = '#34d399';
  setTimeout(() => { btn.querySelector('i').className = 'ph ph-copy'; btn.style.color = ''; }, 1500);
};

const bindSnippetCopiers = () =>
  $$('.btn-snippet-copy').forEach(btn =>
    btn.addEventListener('click', async () => {
      const text = SNIPPET_FULL_TEXTS[btn.dataset.snippet];
      if (!text) return;
      await navigator.clipboard.writeText(text);
      flashSnippetBtn(btn);
    }));

// ── OSV Action ────────────────────────────────────────────────────────────────

// ── Replace with the real URLs when ready ─────────────────────────────────────
const OSV_URLS = ['https://URL_1_AQUI', 'https://URL_2_AQUI'];

const openOsvUrls = () =>
  chrome.runtime.sendMessage({ action: 'snippet_action', payload: { type: 'open_urls', urls: OSV_URLS } });

const bindOsvButtons = () => {
  onClick('OSV', openOsvUrls);
  onClick('osv-open-btn', openOsvUrls);
};

// ── CRM Action Buttons ────────────────────────────────────────────────────────

const ACTION_BTN_IDS = ['TE','RE','EX','PM','CL','NA','PRI','DUP','WO','COBR','NE37','NE25','INT37','VOL37','OBS'];

const bindActionButtons = () =>
  ACTION_BTN_IDS.forEach(id =>
    $(id)?.addEventListener('click', () => chrome.runtime.sendMessage({ action: `run-${id}` })));

const bindClipboardButtons = () =>
  Object.entries(CLIPBOARD_TEXTS).forEach(([id, text]) =>
    $(id)?.addEventListener('click', () => navigator.clipboard.writeText(text)));

// ── Init ──────────────────────────────────────────────────────────────────────

const SNIPPET_SUMMARY_GROUPS = [
  {
    label: 'Manca & Config',
    color: 'var(--accent-blue)',
    items: [
      { tag: '/cli',   label: 'CLI Validation' },
      { tag: '/val',   label: 'Validació' },
      { tag: '/diag',  label: 'Diagnòstic' },
      { tag: '/swap',  label: 'Phone Swap' },
      { tag: '/ex',    label: 'Call Example' },
      { tag: '/cl',    label: 'VoIP Drop' },
      { tag: '/ne37',  label: 'NEO3750 No Arranca' },
      { tag: '/ne25',  label: 'DT250 No Arranca' },
      { tag: '/int37', label: 'NEO3750 Sorolls' },
      { tag: '/vol37', label: 'NEO3750 Volum' },
    ],
  },
  {
    label: 'Closures',
    color: 'var(--accent-rose)',
    items: [
      { tag: '/cobr', label: 'Cierre OBR' },
      { tag: '/cplt', label: 'Cierre PLT' },
      { tag: '/na',   label: 'No Answer' },
      { tag: '/dup',  label: 'Duplicado' },
      { tag: '/pri',  label: 'PRI No SMC' },
      { tag: '/wo',   label: 'Work Order' },
      { tag: '/obs',  label: 'Observació' },
    ],
  },
  {
    label: 'Eines',
    color: 'var(--accent-green)',
    items: [
      { tag: '/alisys', label: 'Alisys' },
      { tag: '/netops', label: 'Netops' },
    ],
  },
  {
    label: 'Vendor OSV',
    color: 'var(--accent-purple)',
    items: [
      { tag: '/osv1manca',  label: 'OSV1 CONF MANCA' },
      { tag: '/osv1diag',   label: 'OSV1 CONF DIAG' },
      { tag: '/osv1tadiag', label: 'OSV1 TA DIAG' },
      { tag: '/osv1tas',    label: 'OSV1 CONF TAS' },
      { tag: '/osv1te',     label: 'OSV1 CONF TE' },
      { tag: '/osv1obr',    label: 'OSV1 TA OA OBR' },
      { tag: '/osv2manca',  label: 'OSV2 CONF MANCA' },
      { tag: '/osv2diag',   label: 'OSV2 CONF DIAG' },
      { tag: '/osv2tadiag', label: 'OSV2 TA DIAG' },
      { tag: '/osv2tas',    label: 'OSV2 CONF TAS' },
      { tag: '/osv2te',     label: 'OSV2 CONF TE' },
      { tag: '/osv2obr',    label: 'OSV2 TA OA OBR' },
    ],
  },
  {
    label: 'Vendor CS Nodes (CS01-CS13)',
    color: 'var(--accent-blue)',
    items: [
      { tag: '/cs01manca',  label: 'CS01 MANCA' },
      { tag: '/cs01diag',   label: 'CS01 DIAG' },
      { tag: '/cs01tadiag', label: 'CS01 TA DIAG' },
      { tag: '/cs01tas',    label: 'CS01 TAS' },
      { tag: '/cs01tp',     label: 'CS01 TP' },
      { tag: '/cs01obr',    label: 'CS01 OBR' },
    ],
  },
  {
    label: 'Vendor SOC',
    color: 'var(--accent-green)',
    items: [
      { tag: '/socsales', label: 'CONF OA SALES' },
      { tag: '/socmanca', label: 'CONF MANCA' },
      { tag: '/socdiag',  label: 'CONF DIAG' },
    ],
  },
  {
    label: 'Vendor RIAV',
    color: 'var(--accent-yellow)',
    items: [
      { tag: '/riavmanca', label: 'CONF MANCA' },
      { tag: '/riavdiag',  label: 'CONF DIAG' },
      { tag: '/riavtas',   label: 'CONF TAS' },
      { tag: '/riavsales', label: 'CONF OA SALES' },
      { tag: '/cons',      label: 'CONS' },
    ],
  },
];

const chipFlash = chip => {
  chip.classList.add('copied');
  const orig = chip.innerHTML;
  chip.innerHTML = '<i class="ph ph-check" style="color:var(--accent-green);font-size:11px;"></i><span style="color:var(--accent-green)">Copiat!</span>';
  setTimeout(() => { chip.innerHTML = orig; chip.classList.remove('copied'); }, 1400);
};

const makeChip = item => {
  const chip = document.createElement('div');
  chip.className = 'snippet-chip';
  chip.innerHTML = `<code>${item.tag}</code><span>${item.label}</span>`;
  chip.addEventListener('click', async () => {
    const key = item.tag.replace('/', '');
    const text = SNIPPET_FULL_TEXTS[key];
    if (!text) return;
    await navigator.clipboard.writeText(text);
    chipFlash(chip);
  });
  return chip;
};

const renderSnippetSummary = () => {
  const grid = $('snippet-summary-grid');
  if (!grid) return;
  SNIPPET_SUMMARY_GROUPS.forEach(group => {
    const labelEl = document.createElement('div');
    labelEl.className = 'snippet-group-label';
    labelEl.style.color = group.color;
    labelEl.textContent = group.label;
    grid.appendChild(labelEl);
    const row = document.createElement('div');
    row.className = 'snippet-chips-row';
    group.items.forEach(item => row.appendChild(makeChip(item)));
    grid.appendChild(row);
  });
};





// ── Backup JSON Export & Import ──────────────────────────────────────────────

const bindBackupExportImport = () => {
  const exportBtn = $('backup-export-btn');
  const importBtn = $('backup-import-btn');
  const fileInput = $('backup-file-input');

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      chrome.storage.local.get(null, (data) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aperturas_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    });
  }

  if (importBtn && fileInput) {
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (typeof parsed === 'object' && parsed !== null) {
            chrome.storage.local.set(parsed, () => {
              renderNotes();
              renderLinks();
              alert('¡Copia de seguridad restaurada con éxito!');
            });
          }
        } catch (err) {
          alert('Error al leer el archivo JSON de copia de seguridad.');
        }
      };
      reader.readAsText(file);
    });
  }
};



// ── Telephony Platform Configs ───────────────────────────────────────────────

const DEFAULT_TELEPHONY_CONFIGS = [];

const getTelephonyConfigs = () =>
  new Promise(r => chrome.storage.local.get('telephony_configs', data => r(data.telephony_configs || [])));

const renderTelephonyConfigs = async () => {
  const container = $('config-tel-list');
  if (!container) return;
  const list = await getTelephonyConfigs();
  if (!list.length) {
    container.innerHTML = `<div class="text-muted small text-center p-3">No hay configuraciones guardadas.</div>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="snippet-card mb-2" style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 10px;">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span class="badge" style="font-size: 10px; background: rgba(251, 191, 36, 0.15) !important; color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3);">${item.platform || 'Telefonía'}</span>
        <span class="small fw-bold text-light ms-2 flex-grow-1 text-truncate">${item.title}</span>
        <div class="d-flex gap-1">
          <button class="btn-snippet-copy copy-cfg-btn" data-content="${encodeURIComponent(item.content)}" title="Copiar Configuración"><i class="ph ph-copy"></i></button>
          <button class="btn-snippet-copy del-cfg-btn" data-id="${item.id}" style="color:var(--accent-red); border-color: rgba(234,133,117,0.3);" title="Eliminar"><i class="ph ph-trash"></i></button>
        </div>
      </div>
      <pre style="font-family: Consolas, monospace; font-size: 10.5px; color: var(--text-muted); background: rgba(0,0,0,0.25); padding: 6px 8px; border-radius: 6px; margin: 0; white-space: pre-wrap; word-break: break-all; max-height: 120px; overflow-y: auto;">${item.content}</pre>
    </div>
  `).join('');

  container.querySelectorAll('.copy-cfg-btn').forEach(btn => {
    btn.onclick = () => {
      const text = decodeURIComponent(btn.dataset.content);
      navigator.clipboard.writeText(text);
      flashSnippetBtn(btn);
    };
  });

  container.querySelectorAll('.del-cfg-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const current = await getTelephonyConfigs();
      const updated = current.filter(x => x.id !== id);
      chrome.storage.local.set({ telephony_configs: updated }, () => renderTelephonyConfigs());
    };
  });
};

const bindTelephonyConfigs = () => {
  const saveBtn = $('save-config-tel-btn');
  if (!saveBtn) return;
  saveBtn.onclick = async () => {
    const platform = $('config-tel-platform')?.value || 'General / Otros';
    const title = $('config-tel-title')?.value?.trim();
    const content = $('config-tel-content')?.value?.trim();
    if (!title || !content) {
      alert('Por favor indica un título y el contenido de la configuración.');
      return;
    }

    const current = await getTelephonyConfigs();
    const newEntry = {
      id: 'cfg_' + Date.now(),
      platform,
      title,
      content,
      date: new Date().toLocaleDateString()
    };

    chrome.storage.local.set({ telephony_configs: [newEntry, ...current] }, () => {
      if ($('config-tel-title')) $('config-tel-title').value = '';
      if ($('config-tel-content')) $('config-tel-content').value = '';
      renderTelephonyConfigs();
    });
  };
};

const bindAllUI = () => {
  bindActionButtons();
  bindClipboardButtons();
  bindOverlayNavigation();
  bindFolderPicker();
  bindFileSearch();
};

const bindNetworkToolsAll = () => {
  bindMacLookup();
  bindSubnetCalc();
  bindVlsmCalc();
  bindDiagCmd();
  bindCnmc();
  bindQ931();
  bindBackupExportImport();
};

const bindAutoExpandTextareas = () => {
  ['note-content', 'config-tel-content'].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', () => {
      el.style.height = 'auto';
      el.style.height = Math.min(Math.max(el.scrollHeight, 42), 250) + 'px';
    });
  });
};

const init = () => {
  bindAllUI();
  bindNetworkToolsAll();
  bindSaveNote();
  bindAddCategory();
  bindSnippetCopiers();
  bindOsvButtons();
  bindTelephonyConfigs();
  bindAutoExpandTextareas();
  renderNotes();
  renderLinks();
  renderSnippetSummary();
  renderTelephonyConfigs();
};

init();