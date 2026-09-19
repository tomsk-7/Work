// content.js — Text Expander & Action Snippets
// Injected into every page at document_idle. Zero overhead unless a '/' is typed.
// All functions ≤ 6 lines (Google JS Style Guide).

// ── Data ──────────────────────────────────────────────────────────────────────

const SNIPPETS = {
  '/cli': `Bon dia,\r\n\r\nHem dut a terme les configuracions necessàries a la plataforma de telefonia. Us preguem que verifiqueu si el servei ja funciona correctament.\r\n\r\nSi el problema persisteix, si us plau comuniqueu-nos-ho per tal de continuar amb l'anàlisi.\r\n\r\nDisposeu de cinc dies naturals per confirmar-nos el resultat. Passat aquest termini sense resposta, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/val': `Bon dia,\r\n\r\nUs informem que hem aplicat els ajustos necessaris al sistema per resoldre la vostra incidència. En breu, el servei hauria de funcionar amb normalitat.\r\n\r\nSi us plau, confirmeu-nos si el servei ja és operatiu. Disposeu de cinc dies naturals per fer-nos arribar la vostra resposta.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/diag': `DIAGNÒSTIC:\nInc: \nCapçalera de la seu: \nPersona de contacte: \nTelèfon de contacte: \nNom de la seu: \nDirecció de la seu: \nHorari de contacte:  \nExtensió o numeració afectada:  \nModel de terminal: \nProves realitzades:  \nDiagnòstic:`,

  '/swap': `Bon dia,\r\n\r\nPer tal de continuar amb el diagnòstic, us sol·licitem la vostra col·laboració per realitzar la prova següent:\r\n\r\nConnecteu el terminal a un altre punt de xarxa o roseta diferent de l'habitual i comproveu:\r\n- Si el terminal s'inicia correctament o mostra algun error.\r\n- Si el problema de connectivitat o telefonia persisteix en el nou punt de xarxa.\r\n\r\nUn cop realitzada la prova, indiqueu-nos el resultat obtingut.\r\n\r\nDisposeu de cinc dies naturals per respondre. Passat aquest termini sense resposta, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/ex': `Bon dia,\r\n\r\nPer poder analitzar la incidència i obtenir les traces corresponents, necessitem que ens faciliteu exemples concrets de trucades fallides amb la informació següent:\r\n\r\nOrigen (mòbil o fix que truca):\r\nDestí (número al qual es truca):\r\nExtensió que respon:\r\nData i hora:\r\nComportament o problema detectat:\r\n\r\nDisposeu de cinc dies naturals per fer-nos arribar aquesta informació. Passat aquest termini sense resposta, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/cl': `Bon dia,\r\n\r\nPer descartar una possible avaria en el cable de l'auricular com a causa de la incidència, us demanem que realitzeu les comprovacions següents:\r\n\r\n1. Inspeccioneu visualment el cable arrissat de l'auricular: busqueu senyals de dany, trencament o desgast. Durant una trucada activa, moveu suaument el cable per detectar si l'àudio s'interromp.\r\n2. Si disposeu d'un cable de recanvi, substituïu-lo i comproveu si el problema es reprodueix.\r\n\r\nA més, per completar l'anàlisi necessitem la informació següent:\r\n- El problema es presenta en totes les trucades o únicament amb certs números?\r\n- Si és parcial, faciliteu un exemple de trucada afectada:\r\n  - Número origen (que truca)\r\n  - Número destí (que rep la trucada)\r\n  - Extensió on es registra el problema\r\n  - Data i hora aproximada\r\n\r\nDisposeu de cinc dies naturals per respondre. En cas contrari, el tiquet es tancarà per operativa, tot i que podeu tornar a obrir-lo amb les dades disponibles.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/ne37': `Bon dia,\r\n\r\nPer continuar amb el diagnòstic del terminal NEO3750 que no arrenca, us demanem que realitzeu els passos següents:\r\n\r\n1. Premeu i manteniu premuda la tecla vermella (encesa) durant almenys 5 segons.\r\n2. Comproveu que la bateria estigui correctament encaixada al terminal.\r\n3. Extraieu la bateria, espereu 10 segons, torneu a col·locar-la i intenteu encendre el terminal.\r\n4. Si la bateria està descarregada, connecteu el carregador i espereu almenys 15 minuts abans de tornar a intentar-ho.\r\n5. Comproveu que el carregador estigui ben connectat al terminal i a una presa de corrent operativa.\r\n6. Proveu el carregador en una altra presa elèctrica o amb un altre terminal compatible, i indiqueu-nos el resultat.\r\n\r\nIndiqueu-nos el resultat de cada prova per poder continuar amb el diagnòstic.\r\n\r\nDisposeu de cinc dies naturals per respondre. Passat aquest termini, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/ne25': `Bon dia,\r\n\r\nPer continuar amb el diagnòstic del terminal DT250 que no arrenca, us demanem que realitzeu els passos següents:\r\n\r\n1. Premeu i manteniu premuda la tecla d'encesa durant almenys 5 segons.\r\n2. Comproveu que la bateria estigui correctament encaixada al terminal.\r\n3. Extraieu la bateria, espereu 10 segons, torneu a col·locar-la i reinicieu el terminal.\r\n4. Si la bateria està descarregada, connecteu el carregador i espereu almenys 15 minuts abans de tornar a intentar-ho.\r\n5. Comproveu que el carregador estigui ben connectat al terminal i a una presa de corrent operativa.\r\n6. Proveu el carregador en una altra presa elèctrica o amb un altre terminal compatible, i indiqueu-nos el resultat.\r\n\r\nIndiqueu-nos el resultat de cada prova per poder continuar amb el diagnòstic.\r\n\r\nDisposeu de cinc dies naturals per respondre. Passat aquest termini, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/int37': `Bon dia,\r\n\r\nLes interferències, talls de veu o problemes d'àudio durant les trucades sovint estan associats a factors de cobertura o maquinari. Per continuar amb el diagnòstic, sol·licitem que realitzeu les accions següents:\r\n\r\n1. Reinicieu el terminal.\r\n2. Intercanvieu l'auricular amb el d'un altre terminal de la mateixa línia i comproveu si el problema persisteix.\r\n3. Verifiqueu que el cable de l'auricular estigui ben connectat al terminal.\r\n4. Canvieu la banda de cobertura: aneu a Configuració > Xarxes mòbils > Preferència de tipus de xarxa, seleccioneu únicament 2G i reinicieu el terminal.\r\n5. Si el problema persisteix en 2G, repetiu el procés i torneu a seleccionar la modalitat automàtica (Auto 4G/3G/2G).\r\n\r\nUn cop realitzades les proves, indiqueu-nos el resultat obtingut en cadascuna.\r\n\r\nDisposeu de cinc dies naturals per respondre. Passat aquest termini, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/vol37': `Bon dia,\r\n\r\nPer diagnosticar el problema de volum al terminal NEO3750, us demanem que realitzeu les comprovacions següents:\r\n\r\n1. Durant una trucada activa, premeu la tecla de volum (+) fins al màxim i comproveu si millora la qualitat auditiva.\r\n2. Reinicieu el terminal i realitzeu una trucada de prova.\r\n3. Intercanvieu l'auricular amb el d'un altre terminal disponible i indiqueu-nos si el problema persisteix amb el nou auricular.\r\n4. Consulteu el nivell de cobertura que mostra la pantalla del terminal durant la trucada i indiqueu-nos-la.\r\n\r\nIndiqueu-nos el resultat de cada prova per poder continuar amb el diagnòstic.\r\n\r\nDisposeu de cinc dies naturals per respondre. Passat aquest termini, el tiquet es tancarà per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/cobr': `Bon dia,\r\n\r\nUs informem que el tècnic desplaçat ha realitzat la visita programada i ha dut a terme les actuacions necessàries sobre el terminal, verificant el correcte funcionament del servei.\r\n\r\nDonem per resolta la incidència i procedim al tancament del tiquet.\r\nEn cas que es torni a produir qualsevol incidència, podeu contactar amb el servei d'assistència d'ATOM trucant al 900 828 282 per obrir una nova sol·licitud de suport.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/cplt': `Bon dia,\r\n\r\nUs informem que s'han aplicat les configuracions necessàries a la plataforma de telefonia i hem verificat que el servei funciona correctament.\r\n\r\nDonem per resolta la incidència i procedim al tancament del tiquet.\r\nEn cas que es torni a produir qualsevol problema, podeu contactar amb el servei d'assistència d'ATOM trucant al 900 828 282 per obrir una nova sol·licitud de suport.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/na': `Bon dia,\r\n\r\nEn no haver rebut resposta en el termini de cinc dies naturals establert, i seguint el procediment intern d'operativa, procedim al tancament del tiquet.\r\n\r\nSi continueu experimentant el problema o disposeu de la informació sol·licitada, podeu tornar a obrir el tiquet o crear-ne un de nou fent referència a l'incident actual.\r\n\r\nGràcies per la vostra comprensió.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/dup': `Bon dia,\r\n\r\nEl present tiquet ha estat identificat com a duplicat d'una sol·licitud prèviament registrada. D'acord amb el procediment establert, procedim al seu tancament.\r\n\r\nPodeu consultar l'estat de la vostra incidència a través del tiquet original.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/pri': `Bon dia,\r\n\r\nHem revisat l'estat del canal primari E1/PRI, del qual gestionem el manteniment en casos d'incomunicació, i hem comprovat que es troba operatiu i en correcte funcionament.\r\n\r\nAtès que la gestió de la centraleta interna de la vostra seu escapa del nostre àmbit de suport, us recomanem posar-vos en contacte amb el vostre proveïdor o tècnic responsable del manteniment de la centraleta. Ells podran revisar el terminal afectat, el cablejat intern i la connectivitat fins a la centraleta de la vostra instal·lació.\r\n\r\nRestem a disposició per a qualsevol altra consulta dins del nostre àmbit de servei.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/wo': `Bon dia,\r\n\r\nEl contingut d'aquest tiquet correspon a una petició de servei i no a una incidència tècnica. Per tant, no és possible gestionar-lo per aquest canal.\r\n\r\nPer tramitar la vostra sol·licitud, podeu accedir als canals habilitats:\r\n- Portal d'Autoservei ATOM: http://pautic.gencat.cat\r\n- Telèfon d'atenció: 900 828 282\r\n\r\nProcedim al tancament del present tiquet per operativa.\r\n\r\nCordialment,\r\nServei de Suport Tècnic\r\nVodafone`,

  '/obs': `Bon dia,\r\n\r\nEl període d'observació acordat ha finalitzat sense que s'hagin reportat noves incidències ni anomalies en el servei.\r\n\r\nConsiderem la incidència resolta i procedim al tancament del tiquet.\r\nEn cas que el problema es reprodueixi, no dubteu a contactar-nos per obrir una nova sol·licitud.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`,

  '/esc': `=== ESCALAT A N2 / NETOPS ===\r\nIncidència / Ticket: \r\nSeu / Equip afectat: \r\nTipus d'afectació: (Incomunicació / Talls àudio / Portabilitat / Altre)\r\nComprovacions N1 realitzades:\r\n- Estat de la línia / Equip:\r\n- Proves creuades / Swap:\r\n- Exemples de trucades afectades:\r\nMotiu de l'escalat: `,
};

// ── Vendor Ticket Number Snippets (Target: Remedy arid_WIN_x_1000000652) ─────

const VENDOR_SNIPPETS = {
  // OSV1
  '/osv1manca': `OSV1 - 9 a 14 - CONF - MANCA`,
  '/osv1diag':  `OSV1 - 9 a 14 - CONF - DIAG`,
  '/osv1tas':   `OSV1 - 9 a 14 - CONF - TAS `,
  '/osv1te':    `OSV1 - 9 a 14 - CONF - TE`,
  '/osv1obr':   `OSV1 - 9 a 14 - TA - OA OBR `,

  // OSV2
  '/osv2manca': `OSV2 - 9 a 14 - CONF - MANCA`,
  '/osv2diag':  `OSV2 - 9 a 14 - CONF - DIAG`,
  '/osv2tas':   `OSV2 - 9 a 14 - CONF - TAS `,
  '/osv2te':    `OSV2 - 9 a 14 - CONF - TE`,
  '/osv2obr':   `OSV2 - 9 a 14 - TA - OA OBR `,


  // SOC
  '/socsales': `SOC - 9 a 14 - CONF - OA SALES`,
  '/socmanca': `SOC - 9 a 14 - CONF - MANCA`,
  '/socdiag':  `SOC - 9 a 14 - CONF - DIAG`,

  // RIAV
  '/riavmanca': `RIAV - 9 a 14 - CONF - MANCA`,
  '/riavdiag':  `RIAV - 9 a 14 - CONF - DIAG`,
  '/riavtas':   `RIAV - 9 a 14 - CONF - TAS `,
  '/riavsales': `RIAV - 9 a 14 - CONF - OA SALES`,

  // TA - DIAG variants (OSV1 / OSV2)
  '/osv1tadiag': `OSV1 - 9 a 14 - TA - DIAG`,
  '/osv2tadiag': `OSV2 - 9 a 14 - TA - DIAG`,

  // Aliases
  '/cons':      `CONS `,
  '/vobr':      `OSV1 - 9 a 14 - TA - OA OBR `,
  '/vtas':      `OSV1 - 9 a 14 - CONF - TAS `,
  '/vmanca':    `OSV1 - 9 a 14 - CONF - MANCA`,
  '/vdiag':     `OSV1 - 9 a 14 - CONF - DIAG`,
};

const ACTION_SNIPPETS = {
  // ── Replace URLs when ready ────────────────────────────────────────────────
  '/osv': { type: 'open_urls', urls: ['https://google.com', 'https://google.com'] },
};

// ── State ─────────────────────────────────────────────────────────────────────

let isExpanding = false;

// ── Field helpers ─────────────────────────────────────────────────────────────

const isSupportedField = ({ tagName, type }) =>
  tagName === 'TEXTAREA' || (tagName === 'INPUT' && (type === 'text' || type === 'search'));

const getTriggerStart = (text, trigger, cursor) => {
  const start = cursor - trigger.length;
  return (start >= 0 && text.substring(start, cursor) === trigger) ? start : -1;
};

const dispatchFieldEvents = target => {
  target.dispatchEvent(new Event('input', { bubbles: true }));
  target.dispatchEvent(new Event('change', { bubbles: true }));
};

// ── Mutation helpers ──────────────────────────────────────────────────────────

const clearTrigger = (target, start, end) => {
  target.value = target.value.substring(0, start) + target.value.substring(end);
  target.setSelectionRange(start, start);
  dispatchFieldEvents(target);
};

const expandText = (target, start, replacement) => {
  target.value = target.value.substring(0, start) + replacement + ' ' + target.value.substring(target.selectionEnd);
  const cursor = start + replacement.length + 1;
  target.setSelectionRange(cursor, cursor);
  dispatchFieldEvents(target);
};

// ── Snippet matching ──────────────────────────────────────────────────────────

const findVendorField = () => {
  // 1. Try exact ID arid_WIN_2_1000000652 first
  let el = document.getElementById('arid_WIN_2_1000000652');
  if (el) return el;

  // 2. Try any window index containing _1000000652
  el = document.querySelector('[id^="arid_WIN_"][id*="_1000000652"]');
  if (el) return el;

  // 3. Search top window / parent document if inside an iframe
  try {
    if (window.top && window.top.document) {
      el = window.top.document.getElementById('arid_WIN_2_1000000652') || window.top.document.querySelector('[id^="arid_WIN_"][id*="_1000000652"]');
      if (el) return el;
    }
  } catch (e) {}

  return null;
};

// ── Vendor String & Schedule Normalizer (Strict: [text] - [text] - [text]) ───

const cleanVendorString = text => {
  if (!text) return text;
  let cleaned = text
    .replace(/\bOSV(?![12I\?])/gi, 'OSV?')
    .replace(/\bCONSULTA\b/gi, 'CONS')
    .replace(/\bCONF\s*-\s*OA\s+OBR\b/gi, 'TA - OA OBR')
    .replace(/\bCONF\s*-\s*OBR\b/gi, 'TA - OBR')
    .replace(/-\s*(?:24\s*h(?:oras)?|24h|00?\s*a\s*24h?)\s*-/gi, ' - 0 a 24 - ')
    .replace(/-\s*(\d{1,2})\s*(?:a|-|hasta)\s*(\d{1,2})\s*h?\s*-/gi, ' - $1 a $2 - ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/ {2,}/g, ' ')
    .trim();
  return cleaned + ' ';
};

// ── Document / Frame Helper ───────────────────────────────────────────────────

const getAllDocs = () => {
  const docs = [document];
  try { if (window.top && window.top.document) docs.push(window.top.document); } catch (e) {}
  const collect = doc => {
    try {
      doc.querySelectorAll('iframe, frame').forEach(f => {
        try {
          const fd = f.contentDocument || f.contentWindow?.document;
          if (fd && !docs.includes(fd)) { docs.push(fd); collect(fd); }
        } catch (e) {}
      });
    } catch (e) {}
  };
  docs.slice().forEach(collect);
  return docs;
};

const findRemedyField = idOrSuffix => {
  if (!idOrSuffix) return null;
  const sfx = idOrSuffix.includes('_') ? idOrSuffix.split('_').pop() : idOrSuffix;
  const isVisible = el => el && (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);

  console.log(`[RemedyAutoFill] Searching for field with suffix/ID: "${idOrSuffix}" (sfx: "${sfx}")`);

  for (const doc of getAllDocs()) {
    const selector = `textarea[id*="_${sfx}"], input[id*="_${sfx}"], select[id*="_${sfx}"], [id$="_${sfx}"], [id*="_${sfx}"], [id="${idOrSuffix}"], [name="${sfx}"]`;
    let rawCandidates = Array.from(doc.querySelectorAll(selector));
    
    if (!rawCandidates.length) continue;

    // Resolve any container DIV/SPAN to inner form element if available
    let candidates = rawCandidates.map(el => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return el;
      return el.querySelector('textarea, input, select') || el;
    });

    // Remove duplicates
    candidates = Array.from(new Set(candidates));

    // Sort so form elements come first
    candidates.sort((a, b) => {
      const aIsForm = ['INPUT', 'TEXTAREA', 'SELECT'].includes(a.tagName) ? 1 : 0;
      const bIsForm = ['INPUT', 'TEXTAREA', 'SELECT'].includes(b.tagName) ? 1 : 0;
      return bIsForm - aIsForm;
    });

    console.log(`[RemedyAutoFill] Candidates found for "${idOrSuffix}":`, candidates.map(c => `${c.tagName}#${c.id}`));

    const visible = candidates.find(isVisible);
    const chosen = visible || candidates[0];
    if (chosen) {
      console.log(`[RemedyAutoFill] Selected element for "${idOrSuffix}":`, chosen.tagName, chosen.id, chosen.className);
      return chosen;
    }
  }

  console.warn(`[RemedyAutoFill] Could NOT find element for suffix/ID: "${idOrSuffix}"`);
  return null;
};

const forceSetRemedyField = (idOrSuffix, value) => {
  console.log(`[RemedyAutoFill] forceSetRemedyField called for "${idOrSuffix}" with value: "${value}"`);
  if (value === undefined || value === null || value === '') {
    console.warn(`[RemedyAutoFill] Value for "${idOrSuffix}" is empty/null/undefined`);
    return false;
  }

  let el = findRemedyField(idOrSuffix);
  if (!el) {
    console.warn(`[RemedyAutoFill] forceSetRemedyField failed: field "${idOrSuffix}" not found`);
    return false;
  }

  // Double check form control resolution
  if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) {
    const inner = el.querySelector('textarea, input, select');
    if (inner) {
      console.log(`[RemedyAutoFill] Resolved container ${el.tagName}#${el.id} -> ${inner.tagName}#${inner.id}`);
      el = inner;
    }
  }

  const win = el.ownerDocument?.defaultView || window;
  const prevVal = el.value;

  try { el.focus(); } catch (e) {}
  if (el.hasAttribute('readonly')) {
    try { el.removeAttribute('readonly'); } catch (e) {}
  }

  if (el.tagName === 'SELECT') {
    const valLower = String(value).trim().toLowerCase();
    const idx = Array.from(el.options).findIndex(o => o.value === value || o.text.trim().toLowerCase() === valLower);
    if (idx !== -1) el.selectedIndex = idx;
    else el.value = value;
  } else {
    // TEXTAREA or INPUT
    el.value = value;
    try { el.textContent = value; } catch (e) {}
    try { el.innerText = value; } catch (e) {}
    try { el.setAttribute('value', value); } catch (e) {}
  }

  ['focus', 'keydown', 'keypress', 'keyup', 'input', 'change', 'blur'].forEach(evtType => {
    try {
      if (win.Event) {
        el.dispatchEvent(new win.Event(evtType, { bubbles: true, cancelable: true }));
      } else {
        const ev = el.ownerDocument.createEvent('HTMLEvents');
        ev.initEvent(evtType, true, true);
        el.dispatchEvent(ev);
      }
    } catch (e) {}
  });

  // Try native Remedy ARSetText / ARSetFullText if available
  try {
    const sfx = String(idOrSuffix).split('_').pop();
    [win, window, window.top].forEach(w => {
      try {
        if (w && typeof w.ARSetText === 'function') {
          for (let winIdx = 0; winIdx <= 5; winIdx++) {
            w.ARSetText(winIdx, sfx, value, 0);
          }
        }
      } catch (e) {}
    });
  } catch (e) {}

  console.log(`[RemedyAutoFill] Field "${idOrSuffix}" (${el.tagName}#${el.id}) set from "${prevVal}" -> "${el.value}"`);
  return true;
};


// CS Nodes (OXE variants)
['01', '02', '03', '04', '05', '07', '08', '10', '11', '12', '13'].forEach(num => {
  const cs = `CS${num}`;
  VENDOR_SNIPPETS[`/cs${num}manca`]  = `${cs} - 9 a 14 - CONF - MANCA`;
  VENDOR_SNIPPETS[`/cs${num}diag`]   = `${cs} - 9 a 14 - CONF - DIAG`;
  VENDOR_SNIPPETS[`/cs${num}tas`]    = `${cs} - 9 a 14 - CONF - TAS `;
  VENDOR_SNIPPETS[`/cs${num}tp`]     = `${cs} - 9 a 14 - CONF - TP`;
  VENDOR_SNIPPETS[`/cs${num}obr`]    = `${cs} - 9 a 14 - TA - OA OBR `;
  VENDOR_SNIPPETS[`/cs${num}tadiag`] = `${cs} - 9 a 14 - TA - DIAG`;
});

const extractVendorTypeFor5550 = text => {
  if (!text) return '';
  const upper = text.trim().toUpperCase();
  if (upper.startsWith('CS')) return 'OXE';
  if (upper.startsWith('OSV')) return 'OSV';
  if (upper.startsWith('RIAV')) return 'RIAV';
  if (upper.startsWith('SOC')) return 'SOC';
  return '';
};

const extractSegmentValue5549 = text => {
  if (!text) return '';
  const trimmed = text.trim();
  const lastHyphenIdx = trimmed.lastIndexOf('-');
  if (lastHyphenIdx === -1) return '';
  const afterHyphen = trimmed.substring(lastHyphenIdx + 1).trim();
  const words = afterHyphen.split(/\s+/).filter(Boolean);
  if (!words.length) return '';

  const oaIdx = words.findIndex(w => w.toUpperCase() === 'OA');
  if (oaIdx !== -1) {
    if (oaIdx + 1 < words.length) {
      return `${words[oaIdx]} ${words[oaIdx + 1]}`;
    }
    return words[oaIdx];
  }

  return words[words.length - 1];
};

// Read current tier field value (lowercased).
const getTierFieldVal = sfx =>
  findRemedyField(sfx)?.value?.trim().toLowerCase() || '';

// Returns true when terminal-substitution tiers are already correctly filled.
const isTaObrTierAlreadyCorrect = () =>
  getTierFieldVal('1000000063').includes('funcionament incorrecte') &&
  getTierFieldVal('1000000064').includes('terminal') &&
  getTierFieldVal('1000000065').includes('amb substitucio de terminal') &&
  getTierFieldVal('1000002488').includes('maquinari') &&
  getTierFieldVal('1000003889').includes('avaria') &&
  getTierFieldVal('1000003890').includes('substitució total');

let isFillingCategorization = false;

const checkAndFillObrCategorization = text => {
  if (isFillingCategorization) return false;
  isFillingCategorization = true;
  console.log('[RemedyAutoFill] Running checkAndFillObrCategorization with text:', text);
  try {
    if (!text) {
      console.warn('[RemedyAutoFill] checkAndFillObrCategorization received empty text');
      return false;
    }

    const vendorType5550 = extractVendorTypeFor5550(text);
    console.log(`[RemedyAutoFill] Field 2000205550 extracted value: "${vendorType5550}"`);
    if (vendorType5550) {
      const res5550 = forceSetRemedyField('2000205550', vendorType5550);
      console.log(`[RemedyAutoFill] Field 2000205550 set result: ${res5550}`);
    } else {
      console.log('[RemedyAutoFill] Field 2000205550: vendor text did not start with CS or OSV');
    }

    const value5549 = extractSegmentValue5549(text);
    console.log(`[RemedyAutoFill] Field 2000205549 extracted value: "${value5549}"`);
    if (value5549) {
      const res5549 = forceSetRemedyField('2000205549', value5549);
      console.log(`[RemedyAutoFill] Field 2000205549 set result: ${res5549}`);
    } else {
      console.log('[RemedyAutoFill] Field 2000205549: could not extract segment after last hyphen');
    }

    const upper = text.toUpperCase();
    // Use word-boundary match for TA so 'TAS', 'CATALEG', etc. don’t trigger.
    const hasTa          = /\bTA\b/.test(upper);
    const hasObrOrOntime = upper.includes('OBR') || upper.includes('ONTIME');
    const hasTaDiag      = hasTa && upper.includes('DIAG');
    const hasTaManca     = hasTa && upper.includes('MANCA');
    const hasAa          = upper.includes('AA');
    const hasConf        = upper.includes('CONF') || upper.includes('MANCA') || upper.includes('DIAG') || upper.includes('TAS') || upper.includes('TE') || upper.includes('TP') || upper.includes('SALES');
    const hasCons        = upper.includes('CONS');

    // CONS / CONSULTA → only fill the 3 closure tiers, leave the rest untouched.
    if (hasCons) {
      forceSetRemedyField('1000002488', 'NO INCIDÈNCIA');
      forceSetRemedyField('1000003889', 'ÉS CONSULTA');
      forceSetRemedyField('1000003890', '-');
      return false;
    }

    // TA - OA OBR  /  TA - DIAG  /  TA - MANCA → substitució de terminal
    if ((hasObrOrOntime && hasTa) || hasTaDiag || hasTaManca) {
      // Early-exit: if the correct tiers are already set, do nothing.
      if (isTaObrTierAlreadyCorrect()) return true;
      forceSetRemedyField('1000000063', 'FUNCIONAMENT INCORRECTE');
      forceSetRemedyField('1000000064', 'TERMINAL');
      forceSetRemedyField('1000000065', 'AMB SUBSTITUCIO DE TERMINAL');
      forceSetRemedyField('1000002488', 'MAQUINARI');
      forceSetRemedyField('1000003889', 'AVARIA');
      forceSetRemedyField('1000003890', 'SUBSTITUCIÓ TOTAL');
      return true;
    } else if (hasObrOrOntime && hasAa) {
      forceSetRemedyField('1000000063', 'FUNCIONAMENT INCORRECTE');
      forceSetRemedyField('1000000064', 'TERMINAL');
      forceSetRemedyField('1000000065', 'SENSE SUBSTITUCIO DE TERMINAL');
      forceSetRemedyField('1000002488', 'MAQUINARI');
      forceSetRemedyField('1000003889', 'AVARIA');
      forceSetRemedyField('1000003890', 'SUBSTITUCIÓ PEÇA');
      return true;
    } else if (hasConf) {
      forceSetRemedyField('1000000063', 'FUNCIONAMENT INCORRECTE');
      forceSetRemedyField('1000000064', 'FUNCIONAMENT DEGRADAT');
      forceSetRemedyField('1000000065', 'ALTRES');
      forceSetRemedyField('1000002488', 'MAQUINARI');
      forceSetRemedyField('1000003889', 'CONFIGURACIÓ');
      forceSetRemedyField('1000003890', 'CONFIGURACIÓ');
      return true;
    } else if (hasCons) {
      forceSetRemedyField('1000000063', 'CONSULTA');
      forceSetRemedyField('1000000064', 'ALTRES');
      forceSetRemedyField('1000000065', 'NO INCIDÈNCIA');
      forceSetRemedyField('1000002488', 'ÉS CONSULTA');
      forceSetRemedyField('1000003889', '-');
      forceSetRemedyField('1000003890', '-');
      return true;
    }
    return false;
  } finally {
    isFillingCategorization = false;
  }
};

let isScanDisabled = false;
let scheduleCheckTimer = null;

const autoFixTicketSchedule = () => {
  if (isExpanding || isFillingCategorization || isScanDisabled) return;
  const field = findVendorField();
  if (!field || !field.value) return;

  const fixed = cleanVendorString(field.value);
  if (fixed !== field.value) {
    isExpanding = true;
    field.value = fixed;
    dispatchFieldEvents(field);
    isExpanding = false;
  }

  // ── One-shot: stop watching this ticket once processed. ──────────────────
  isScanDisabled = true;
  scheduleObserver.disconnect();
};

const scheduleDebouncedAutoFix = () => {
  if (isExpanding || isFillingCategorization || isScanDisabled) return;
  if (scheduleCheckTimer) clearTimeout(scheduleCheckTimer);
  scheduleCheckTimer = setTimeout(() => {
    scheduleCheckTimer = null;
    autoFixTicketSchedule();
  }, 200);
};

const applyVendorSnippet = (target, start, end, replacement) => {
  isExpanding = true;
  clearTrigger(target, start, end);
  const vendorField = findVendorField();
  const finalReplacement = cleanVendorString(replacement);
  if (vendorField) {
    vendorField.value = finalReplacement;
    dispatchFieldEvents(vendorField);
    vendorField.focus();
    if (finalReplacement.endsWith(' ')) {
      const len = finalReplacement.length;
      vendorField.setSelectionRange(len, len);
    }
  } else {
    expandText(target, start, finalReplacement);
  }
  checkAndFillObrCategorization(finalReplacement);
  isExpanding = false;
};

const tryVendorSnippet = (target, text, cursor) => {
  for (const [cmd, replacement] of Object.entries(VENDOR_SNIPPETS)) {
    const start = getTriggerStart(text, cmd + ' ', cursor);
    if (start >= 0) {
      applyVendorSnippet(target, start, cursor, replacement);
      return true;
    }
  }
  return false;
};

const fireAction = (target, start, end, action) => {
  isExpanding = true;
  clearTrigger(target, start, end);
  isExpanding = false;
  chrome.runtime.sendMessage({ action: 'snippet_action', payload: action });
};

const tryActionSnippet = (target, text, cursor) => {
  for (const [cmd, action] of Object.entries(ACTION_SNIPPETS)) {
    const start = getTriggerStart(text, cmd + ' ', cursor);
    if (start >= 0) { fireAction(target, start, cursor, action); return true; }
  }
  return false;
};

const applySnippet = (target, start, replacement) => {
  isExpanding = true;
  expandText(target, start, replacement);
  isExpanding = false;
};

const tryTextSnippet = (target, text, cursor) => {
  for (const [cmd, replacement] of Object.entries(SNIPPETS)) {
    const start = getTriggerStart(text, cmd + ' ', cursor);
    if (start >= 0) { applySnippet(target, start, replacement); return true; }
  }
  return false;
};

// ── Floating Oracle Badge & Tab Trigger Autocomplete ─────────────────────────

let activeOracleTarget = null;
let oracleBadgeEl = null;

const createOracleBadge = () => {
  if (oracleBadgeEl) return oracleBadgeEl;
  oracleBadgeEl = document.createElement('div');
  oracleBadgeEl.id = 'ext-oracle-badge';
  oracleBadgeEl.style.cssText = `
    position: absolute;
    z-index: 2147483647;
    pointer-events: none;
    font-family: Consolas, monospace;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 5px;
    background: rgba(15, 23, 42, 0.95);
    color: #94a3b8;
    border: 1px solid rgba(52, 211, 153, 0.6);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    display: none;
    white-space: nowrap;
    line-height: 1.2;
  `;
  document.body.appendChild(oracleBadgeEl);
  return oracleBadgeEl;
};

const hideOracle = () => {
  if (oracleBadgeEl) oracleBadgeEl.style.display = 'none';
  activeOracleTarget = null;
};

const positionOracle = target => {
  if (!oracleBadgeEl || !target) return;
  const rect = target.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  oracleBadgeEl.style.top = `${Math.max(0, rect.top + scrollY - 28)}px`;
  oracleBadgeEl.style.left = `${rect.left + scrollX + 4}px`;
};

const findTriggerMatchForToken = token => {
  if (!token || !token.startsWith('/') || token.length < 2) return null;
  const lower = token.toLowerCase();
  const allTriggers = [
    ...Object.keys(VENDOR_SNIPPETS),
    ...Object.keys(ACTION_SNIPPETS),
    ...Object.keys(SNIPPETS),
  ];

  if (allTriggers.includes(lower)) return lower;

  const match = allTriggers.find(t => t.startsWith(lower));
  return match || null;
};

const updateOracleIndicator = target => {
  if (!target || !isSupportedField(target)) return hideOracle();

  const { value, selectionStart } = target;
  if (!value || selectionStart === undefined) return hideOracle();

  const textBeforeCursor = value.substring(0, selectionStart);
  const slashIdx = textBeforeCursor.lastIndexOf('/');
  if (slashIdx === -1) return hideOracle();

  const token = textBeforeCursor.substring(slashIdx);
  if (token.includes(' ') || token.length < 2) return hideOracle();

  const fullTrigger = findTriggerMatchForToken(token);
  if (!fullTrigger) return hideOracle();

  const suffix = fullTrigger.substring(token.length);
  activeOracleTarget = target;

  const badge = createOracleBadge();
  badge.innerHTML = `<span style="color:#e2e8f0;font-weight:bold;">${token}</span><span style="color:#34d399;font-weight:bold;">${suffix}</span> <span style="font-size:9.5px;color:#94a3b8;margin-left:6px;border:1px solid rgba(52,211,153,0.5);padding:1px 5px;border-radius:3px;background:rgba(52,211,153,0.15);">Tab ↹</span>`;
  positionOracle(target);
  badge.style.display = 'block';
};

const handleTabTrigger = e => {
  if (!e || e.key !== 'Tab') return false;

  const target = e.target || document.activeElement;
  if (!isSupportedField(target)) return false;

  const { value, selectionStart } = target;
  if (!value || selectionStart === undefined) return false;

  const textBeforeCursor = value.substring(0, selectionStart);
  const slashIdx = textBeforeCursor.lastIndexOf('/');
  if (slashIdx === -1) return false;

  const token = textBeforeCursor.substring(slashIdx);
  if (token.includes(' ')) return false;

  const fullTrigger = findTriggerMatchForToken(token);
  if (!fullTrigger) return false;

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  const currentEnd = selectionStart;
  hideOracle();

  if (VENDOR_SNIPPETS[fullTrigger]) {
    applyVendorSnippet(target, slashIdx, currentEnd, VENDOR_SNIPPETS[fullTrigger]);
    return true;
  }

  if (ACTION_SNIPPETS[fullTrigger]) {
    fireAction(target, slashIdx, currentEnd, ACTION_SNIPPETS[fullTrigger]);
    return true;
  }

  if (SNIPPETS[fullTrigger]) {
    clearTrigger(target, slashIdx, currentEnd);
    applySnippet(target, slashIdx, SNIPPETS[fullTrigger]);
    return true;
  }

  return false;
};

// ── Main listener ─────────────────────────────────────────────────────────────

const onInput = ({ target }) => {
  if (isExpanding || !target || !isSupportedField(target)) return;
  const { value, selectionStart } = target;
  if (!value?.includes('/')) {
    hideOracle();
    return;
  }
  updateOracleIndicator(target);
  if (tryVendorSnippet(target, value, selectionStart) || tryActionSnippet(target, value, selectionStart) || tryTextSnippet(target, value, selectionStart)) {
    hideOracle();
  }
};

document.addEventListener('input', onInput, { passive: true });

window.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    handleTabTrigger(e);
  } else if (e.key === 'Escape') {
    hideOracle();
  }
}, true);

window.addEventListener('scroll', () => {
  if (activeOracleTarget) positionOracle(activeOracleTarget);
}, { passive: true });
window.addEventListener('resize', () => {
  if (activeOracleTarget) positionOracle(activeOracleTarget);
}, { passive: true });
document.addEventListener('click', e => {
  if (e.target !== activeOracleTarget) hideOracle();
}, { passive: true });

// ── Non-blocking, self-disconnecting DOM observer ─────────────────────────────

const scheduleObserver = new MutationObserver(() => scheduleDebouncedAutoFix());

const startObserver = () => {
  isScanDisabled = false;
  if (scheduleCheckTimer) { clearTimeout(scheduleCheckTimer); scheduleCheckTimer = null; }
  if (document.body) {
    scheduleObserver.observe(document.body, { childList: true, subtree: true });
  }
  scheduleDebouncedAutoFix();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startObserver, { once: true });
} else {
  startObserver();
}

// Re-enable scan when user switches tickets or clicks form container
window.addEventListener('popstate', () => startObserver(), { passive: true });
window.addEventListener('hashchange', () => startObserver(), { passive: true });
document.addEventListener('click', (e) => {
  if (e.target && isSupportedField(e.target) && isScanDisabled) {
    startObserver();
  }
}, { passive: true });

// ── Arconte / Videoconferencia Form Filling & Save Button Auto-Click ───────

const findRemedySaveButton = () => {
  for (const doc of getAllDocs()) {
    for (const el of doc.querySelectorAll('.btntextdiv, .f1')) {
      if (el.textContent.trim() === 'Save' || el.innerText?.trim() === 'Save') return el;
    }
    const saveById = doc.querySelector('[id*="304319500"]');
    if (saveById) return saveById;
  }
  return null;
};


const clickRemedySaveButton = () => {
  const saveBtn = findRemedySaveButton();
  if (!saveBtn) return false;

  const target = saveBtn.closest('.btntextdiv') || saveBtn.parentElement || saveBtn;
  ['mousedown', 'mouseup', 'click'].forEach(evt => {
    try {
      target.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window }));
    } catch (e) {}
  });

  if (typeof target.click === 'function') {
    try { target.click(); } catch (e) {}
  }
  return true;
};

const readClipboardTextWithFallback = async () => {
  let text = '';
  try {
    text = await navigator.clipboard.readText();
    if (text) {
      console.log('📋 [REMEDY AUTO-FILL] navigator.clipboard.readText() exitoso. Caracteres:', text.length);
      return text;
    }
  } catch (err) {
    console.warn('⚠️ [REMEDY AUTO-FILL] navigator.clipboard.readText() falló:', err.message || err);
  }

  try {
    const ta = document.createElement('textarea');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    const ok = document.execCommand('paste');
    text = ta.value;
    document.body.removeChild(ta);
    console.log(`📋 [REMEDY AUTO-FILL] Fallback execCommand('paste') ${ok ? 'exitoso' : 'falló'}. Caracteres:`, text ? text.length : 0);
    return text || '';
  } catch (err) {
    console.warn('⚠️ [REMEDY AUTO-FILL] Fallback execCommand paste falló:', err.message || err);
  }

  return '';
};

const waitForAndClickButton = (textMatch, maxAttempts = 30, interval = 500) => new Promise(resolve => {
  let attempts = 0;
  const check = () => {
    for (const doc of getAllDocs()) {
      const candidates = Array.from(doc.querySelectorAll('a, button, div.btntextdiv, div.f1, .btn'));
      const found = candidates.find(el => {
        const text = el.textContent.trim();
        return text === textMatch || text.toLowerCase() === textMatch.toLowerCase();
      });

      if (found) {
        console.log(`🖱️ [REMEDY AUTO-FILL] Botón "${textMatch}" encontrado → Pulsando...`);
        const target = found.closest('a, button, .btn, .btntextdiv') || found;
        const origHref = target.getAttribute('href');
        if (origHref && origHref.toLowerCase().startsWith('javascript:')) target.removeAttribute('href');

        ['mouseenter', 'mouseover', 'mousedown', 'mouseup', 'click'].forEach(evt => {
          try { target.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window, buttons: 1 })); } catch (e) {}
        });
        if (typeof target.onclick === 'function') {
          try { target.onclick(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })); } catch (e) {}
        }
        if (origHref) target.setAttribute('href', origHref);
        resolve(true);
        return;
      }
    }

    attempts++;
    if (attempts >= maxAttempts) {
      console.warn(`⚠️ [REMEDY AUTO-FILL] Timeout esperando botón "${textMatch}".`);
      resolve(false);
      return;
    }
    setTimeout(check, interval);
  };
  check();
});

const executeClipboardAutoFill = async () => {
  console.log('🚀 ===================================================');
  console.log('🚀 [REMEDY AUTO-FILL] Iniciando autocompletado desde portapapeles...');
  
  const text = await readClipboardTextWithFallback();
  if (!text) {
    console.warn('❌ [REMEDY AUTO-FILL] El portapapeles está vacío o no se pudo leer.');
    return 0;
  }

  console.log('📄 [REMEDY AUTO-FILL] Muestra del portapapeles:', text.substring(0, 150) + '...');

  const hasWO = text.toUpperCase().includes('WO:');
  console.log('🔍 [REMEDY AUTO-FILL] ¿Se encontró "WO:" en la plantilla?:', hasWO);
  if (!hasWO) {
    console.warn('⚠️ [REMEDY AUTO-FILL] No se detectó "WO:" en el portapapeles. Cancelando.');
    return 0;
  }

  const mapData = parseWoTextToAridMap(text);
  console.log('🗺️ [REMEDY AUTO-FILL] Mapa de campos a rellenar:', mapData);

  let filledCount = 0;
  Object.keys(mapData).forEach(id => {
    const val = mapData[id];
    if (!val) return;
    const success = forceSetRemedyField(id, val);
    console.log(`📝 [REMEDY AUTO-FILL] Campo [${id}] -> Valor: "${val}" | Resultado: ${success ? '✅ RELLENADO' : '❌ NO ENCONTRADO EN DOM'}`);
    if (success) filledCount++;
  });

  console.log(`🎉 [REMEDY AUTO-FILL] Resumen final: ${filledCount} de ${Object.keys(mapData).length} campos rellenados con éxito.`);

  // ── Flujo secuencial post-rellenado: Save (300000300) → People → Add ─────────
  if (filledCount > 0) {
    await new Promise(r => setTimeout(r, 500));

    // 1. Clic en botón Save (arid="300000300")
    console.log('💾 [REMEDY AUTO-FILL] Pulsando botón Save (300000300)...');
    const saveClicked = clickRemedyButton('300000300') || clickRemedySaveButton();
    console.log(`💾 [REMEDY AUTO-FILL] Botón Save: ${saveClicked ? '✅ PULSADO' : '⚠️ NO ENCONTRADO'}`);

    // 2. Esperar a que cargue la nueva página/vista y pulsar el botón "People"
    console.log('⏳ [REMEDY AUTO-FILL] Esperando botón "People"...');
    const peopleClicked = await waitForAndClickButton('People', 35, 500);

    // 3. Esperar a que aparezca y pulsar el botón "Add"
    if (peopleClicked) {
      console.log('⏳ [REMEDY AUTO-FILL] Esperando botón "Add"...');
      await new Promise(r => setTimeout(r, 600));
      await waitForAndClickButton('Add', 35, 500);
    }
  }

  console.log('🚀 ===================================================');
  return filledCount;
};


if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'FILL_ARCONTE_FORM' && request.data) {
      const map = request.data;
      let filledCount = 0;

      Object.keys(map).forEach(fullId => {
        const val = map[fullId];
        if (!val) return;
        const success = forceSetRemedyField(fullId, val);
        if (success) filledCount++;
      });

      sendResponse({ status: 'OK', filledCount, saveClicked: false });
    } else if (request.action === 'TRIGGER_CLIPBOARD_AUTOFILL') {
      console.log('📩 [REMEDY AUTO-FILL] Mensaje recibido desde background: TRIGGER_CLIPBOARD_AUTOFILL');
      executeClipboardAutoFill().then(count => {
        sendResponse({ status: 'OK', count });
      });
      return true;
    }
  });
}

// ── Shortcut Listener: ALT+A or CTRL+SHIFT+A ───

const parseWoTextToAridMap = (text) => {
  if (!text || !text.toUpperCase().includes('WO:')) return null;

  const getFieldValue = (blockText, fieldNames) => {
    for (const name of fieldNames) {
      const regex = new RegExp('(?:^|\\n)\\s*' + name + '\\s*[:=]\\s*(.*)', 'i');
      const match = blockText.match(regex);
      if (match && match[1]) return match[1].trim();
    }
    return '';
  };

  const ddiMatch = text.match(/\b\d{9}\b/);
  const ddiNum = ddiMatch ? ddiMatch[0] : (getFieldValue(text, ['DDI']) || '').replace(/\D/g, '');

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const formattedDate = `${day}/${month}/${year} 00:00:00`;

  const rawHost = getFieldValue(text, ['Hostname', 'HOST']);
  const hostValue = rawHost ? (rawHost.endsWith('.videobox.justicia.intranet.gencat.cat') ? rawHost : `${rawHost}.videobox.justicia.intranet.gencat.cat`) : '';

  return {
    "arid_WIN_5_200000020": ddiNum ? `SVC${ddiNum}` : '',
    "arid_WIN_5_210000000": ddiNum ? `TC.SVC.${ddiNum}` : '',
    "arid_WIN_5_200000003": "TELECOMUNICACIONS",
    "arid_WIN_5_200000004": "VIDEOCONFERENCIA",
    "arid_WIN_5_200000005": "VIDEOCONFERENCIA TPC ARC",
    "arid_WIN_5_240001002": "VIDEOCONFERENCIA TPC ARC",
    "arid_WIN_5_240001005": "ARCONTE VIDEOBOX",
    "arid_WIN_5_240001003": "FUJITSU",
    "arid_WIN_5_2000002882": ddiNum,
    "arid_WIN_5_1000000001": getFieldValue(text, ['COMPANY']),
    "arid_WIN_5_2000003720": getFieldValue(text, ['ORGANIZATION']),
    "arid_WIN_5_200000006": getFieldValue(text, ['DEPARTAMENT']),
    "arid_WIN_5_2000002850": "Deployed",
    "arid_WIN_5_260700001": formattedDate,
    "arid_WIN_7_8": hostValue
  };
};

const handleGlobalKeyDown = async (e) => {
  if (e.ctrlKey) {
    console.log('⌨️ [KEYPRESS DEBUG] Presionado Ctrl +', e.key, '| e.code:', e.code);
  }

  const isB = e.ctrlKey && (e.code === 'KeyB' || e.key === 'b' || e.key === 'B');

  if (isB) {
    console.log('⌨️ [REMEDY AUTO-FILL] ¡CTRL+B capturado con éxito en fase de captura!');
    try {
      e.preventDefault();
      e.stopPropagation();
    } catch(err) {}
    executeClipboardAutoFill();
  }
};

window.addEventListener('keydown', handleGlobalKeyDown, { capture: true, passive: false });
document.addEventListener('keydown', handleGlobalKeyDown, { capture: true, passive: false });

// ── AST:RelatePeople Auto-Fill (Videoconferencia) ──────────────────────────────

const clickRemedyButton = (arid) => {
  let el = null;
  for (const doc of getAllDocs()) {
    el = doc.querySelector(`[arid="${arid}"]`) || doc.querySelector(`[id$="_${arid}"], [id="WIN_0_${arid}"], [id="arid_WIN_0_${arid}"]`);
    if (el) break;
  }

  if (!el) {
    console.warn(`⚠️ [RELATE-PEOPLE] Botón arid=${arid} no encontrado.`);
    return false;
  }

  console.log(`🔘 [RELATE-PEOPLE] Botón encontrado: id="${el.id}", tag=${el.tagName}, class="${el.className}"`);

  const originalHref = el.getAttribute('href');
  if (originalHref && originalHref.toLowerCase().startsWith('javascript:')) {
    el.removeAttribute('href');
  }

  const targetEl = el.querySelector('.btntextdiv, .f1') || el;
  ['mouseenter', 'mouseover', 'mousedown', 'mouseup', 'click'].forEach(evtName => {
    try {
      targetEl.dispatchEvent(new MouseEvent(evtName, {
        bubbles: true, cancelable: true, view: window, buttons: 1
      }));
    } catch (e) {}
  });

  if (typeof el.onclick === 'function') {
    try { el.onclick(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })); } catch (e) {}
  }

  if (originalHref) el.setAttribute('href', originalHref);
  console.log(`✅ [RELATE-PEOPLE] Click enviado al botón arid=${arid}`);
  return true;
};



const extractRelatePeopleData = (text) => {
  if (!text) return null;
  const get = (names) => {
    for (const name of names) {
      const regex = new RegExp('(?:^|\\n)\\s*' + name + '\\s*[:=]\\s*(.*)', 'i');
      const match = text.match(regex);
      if (match && match[1]) return match[1].trim();
    }
    return '';
  };
  return {
    company:      get(['COMPANY']),
    organization: get(['ORGANIZATION']),
    departament:  get(['DEPARTAMENT', 'DEPARTMENT']),
  };
};

const executeRelatePeopleAutoFill = async () => {
  console.log('🔗 ===================================================');
  console.log('🔗 [RELATE-PEOPLE] URL detectada: AST%3ARelatePeople. Iniciando auto-fill...');

  const text = await readClipboardTextWithFallback();
  if (!text) {
    console.warn('❌ [RELATE-PEOPLE] El portapapeles está vacío o no se pudo leer.');
    return;
  }

  console.log('📄 [RELATE-PEOPLE] Muestra portapapeles:', text.substring(0, 200));

  const data = extractRelatePeopleData(text);
  if (!data || (!data.company && !data.organization && !data.departament)) {
    console.warn('⚠️ [RELATE-PEOPLE] No se encontraron datos de COMPANY/ORGANIZATION/DEPARTAMENT en el portapapeles.');
    return;
  }

  console.log('🗺️ [RELATE-PEOPLE] Datos extraídos:', data);

  // ── Helper: seleccionar opción de menú desplegable de Remedy ─────────────────
  // Estrategia verificada: Hacemos clic en el botón <a class="btn btn3d menu">
  // desplegable de Remedy. Remedy abre su menú emergente nativo y hacemos clic en la opción.
  const setRemedyArautocField = async (idSuffix, wantedText) => {
    if (!wantedText) return false;
    const wantedLower = wantedText.trim().toLowerCase();

    for (const doc of getAllDocs()) {

      // 1. Buscar el contenedor o el campo por su sufijo
      const container = doc.querySelector(`div[id="WIN_0_${idSuffix}"], div[id$="_${idSuffix}"], div[id*="_${idSuffix}"]`);
      const targetInput = doc.querySelector(`[id$="_${idSuffix}"], [id*="_${idSuffix}"]`);

      if (!container && !targetInput) continue;

      const parentEl = container || targetInput?.parentElement || doc;
      const menuBtn = parentEl.querySelector('a.menu, a[class*="menu"]') 
                    || doc.querySelector(`div[id*="${idSuffix}"] a.menu`);

      // Método A: Si existe el botón de flecha de menú desplegable <a class="menu">
      if (menuBtn) {
        console.log(`🔽 [RELATE-PEOPLE] Abriendo menú desplegable para ${idSuffix}...`);
        
        const origHref = menuBtn.getAttribute('href');
        if (origHref && origHref.toLowerCase().startsWith('javascript:')) {
          menuBtn.removeAttribute('href');
        }

        ['mouseenter', 'mouseover', 'mousedown', 'mouseup', 'click'].forEach(evt => {
          try { menuBtn.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window })); } catch (e) {}
        });

        if (origHref) menuBtn.setAttribute('href', origHref);

        // Esperar a que el menú desplegable de Remedy se dibuje en el DOM
        await new Promise(r => setTimeout(r, 350));

        // Buscar la opción en el menú emergente recién desplegado
        const menuItems = Array.from(doc.querySelectorAll(
          'tr[class*="Menu"] td, td[class*="Menu"], div[class*="Menu"] td, tr[class*="AutoComplete"] td, td[id^="tat_td"]'
        ));

        let targetItem = null;

        // Prioridad 1: Coincidencia exacta
        targetItem = menuItems.find(item => item.textContent.trim().toLowerCase() === wantedLower);

        // Prioridad 2: El texto del menú contiene el texto buscado (ej: "DEPARTAMENT DE JUSTÍCIA (001)" contiene "DEPARTAMENT DE JUSTÍCIA")
        if (!targetItem) {
          targetItem = menuItems.find(item => item.textContent.trim().toLowerCase().includes(wantedLower));
        }

        // Prioridad 3: Coincidencia flexible de palabras clave
        if (!targetItem && wantedLower.length > 3) {
          targetItem = menuItems.find(item => wantedLower.includes(item.textContent.trim().toLowerCase()));
        }

        if (targetItem) {
          console.log(`🎯 [RELATE-PEOPLE] Opción encontrada en menú: "${targetItem.textContent.trim()}" → Haciendo clic`);
          ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(evt => {
            try { targetItem.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window })); } catch (e) {}
          });
          if (typeof targetItem.onclick === 'function') {
            try { targetItem.onclick(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })); } catch (e) {}
          }
          console.log(`✅ [RELATE-PEOPLE] Campo ${idSuffix} → "${wantedText}" asignado vía menú desplegable.`);
          return true;
        }
        console.warn(`⚠️ [RELATE-PEOPLE] No se encontró "${wantedText}" en el menú de Remedy. Usando asignación directa...`);

      }

      // Método B: Fallback asignación por eventos si no hay botón menú
      const inputEl = targetInput || (container ? container.querySelector('textarea, input') : null);
      if (inputEl) {
        inputEl.focus();
        inputEl.select && inputEl.select();
        inputEl.value = wantedText;
        ['keydown', 'keypress', 'keyup', 'input', 'change', 'blur'].forEach(evt => {
          try { inputEl.dispatchEvent(new Event(evt, { bubbles: true, cancelable: true })); } catch (e) {}
        });
        console.log(`✅ [RELATE-PEOPLE] Campo ${idSuffix} → "${wantedText}" asignado vía asignación directa.`);
        return true;
      }
    }

    console.warn(`❌ [RELATE-PEOPLE] Campo ${idSuffix} NO encontrado.`);
    return false;
  };





  // ── PASO 1: Rellenar campos de búsqueda y hacer click en Search ─────────────

  // [1] arid_WIN_0_1000000671 — Tipo de búsqueda: "People Organization"
  console.log('📝 [RELATE-PEOPLE] Ajustando tipo de búsqueda a "People Organization"...');
  await setRemedyArautocField('1000000671', 'People Organization');

  // Pausa importante: Al cambiar el tipo a "People Organization", Remedy ejecuta
  // un refresco/redibujado del panel ("Search Organization"). Hay que esperar a que termine.
  console.log('⏳ [RELATE-PEOPLE] Esperando refresco del panel Search Organization...');
  await new Promise(r => setTimeout(r, 1000));

  // [20] Company (304370951)
  if (data.company) {
    await setRemedyArautocField('304370951', data.company);
    await new Promise(r => setTimeout(r, 500));
  }

  // [18] Organization (301531200)
  if (data.organization) {
    await setRemedyArautocField('301531200', data.organization);
    await new Promise(r => setTimeout(r, 500));
  }

  // [19] Department (301531300)
  if (data.departament) {
    await setRemedyArautocField('301531300', data.departament);
    await new Promise(r => setTimeout(r, 500));
  }

  // Pausa final antes de buscar
  await new Promise(r => setTimeout(r, 400));

  // Click botón Search
  const searchClicked = clickRemedyButton('304289680');
  console.log(`🔍 [RELATE-PEOPLE] Botón Search (304289680): ${searchClicked ? '✅ PULSADO' : '❌ NO ENCONTRADO'}`);

  // ── PASO 2: Esperar la tabla de RESULTADOS de búsqueda ────────────────────────

  console.log('⏳ [RELATE-PEOPLE] Esperando tabla de resultados de búsqueda...');

  const waitForTableRow = (maxAttempts = 25, interval = 500) => new Promise(resolve => {
    let attempts = 0;
    const check = () => {
      // Buscar todas las tablas del documento
      const allTables = Array.from(document.querySelectorAll('table'));
      let foundRow = null;

      for (const tbl of allTables) {
        const headers = Array.from(tbl.querySelectorAll('th, td')).map(c => c.textContent.trim().toLowerCase());
        
        // Excluir la tabla de la derecha "Current People Relationships" (contiene "Role" o "Supported by")
        const isRelTable = headers.some(h => h === 'role' || h === 'supported by' || h.includes('supported by'));
        if (isRelTable) continue;

        // Es una tabla de búsqueda válida si tiene cabeceras de Company/Organization o First Name
        const isSearchResultTable = headers.some(h =>
          h.includes('company') || h.includes('organization') || h.includes('first name') || h.includes('last name') || h.includes('nombre')
        );
        if (!isSearchResultTable) continue;

        // Buscar filas con datos en esta tabla (ignorando la cabecera)
        const dataRows = Array.from(tbl.querySelectorAll('tr')).filter(r => {
          const cells = r.querySelectorAll('td');
          return cells.length >= 2 && r.textContent.trim().length > 5 && !r.textContent.includes('Table has Not been Loaded');
        });
        if (dataRows.length > 0) {
          foundRow = dataRows[0];
          break;
        }
      }

      if (foundRow) {
        console.log(`✅ [RELATE-PEOPLE] Tabla de resultados cargada. Primera fila: "${foundRow.textContent.trim().substring(0, 60)}"`);
        resolve(foundRow);
        return;
      }
      attempts++;
      if (attempts >= maxAttempts) {
        console.warn('⚠️ [RELATE-PEOPLE] Timeout esperando resultados de búsqueda. Continuando sin selección.');
        resolve(null);
        return;
      }
      setTimeout(check, interval);
    };
    check();
  });

  const firstRow = await waitForTableRow();

  // Seleccionar la primera fila (necesario antes de Add)
  if (firstRow) {
    try {
      firstRow.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
      firstRow.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true, cancelable: true, view: window }));
      firstRow.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true, view: window }));
      if (typeof firstRow.onclick === 'function') firstRow.onclick(new MouseEvent('click', { bubbles: true }));
      console.log('🖱️ [RELATE-PEOPLE] Primera fila seleccionada.');
    } catch (e) {
      console.warn('⚠️ [RELATE-PEOPLE] Error al seleccionar fila:', e);
    }
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('🔗 [RELATE-PEOPLE] Paso 2: rellenando campos de rol...');

  // [21] arid_WIN_0_1000000209 — Choose relationship level
  await setRemedyArautocField('1000000209', 'Department');
  await new Promise(r => setTimeout(r, 400));

  // [22] arid_WIN_0_301527000 — Role
  await setRemedyArautocField('301527000', 'Used by');
  await new Promise(r => setTimeout(r, 400));

  // Click botón Add
  const addClicked = clickRemedyButton('300073200');
  console.log(`➕ [RELATE-PEOPLE] Botón Add (300073200): ${addClicked ? '✅ PULSADO' : '❌ NO ENCONTRADO'}`);

  console.log('🔗 [RELATE-PEOPLE] Auto-fill completado.');
  console.log('🔗 ===================================================');

};

// Inicializar auto-fill cuando la URL contiene AST%3ARelatePeople
const initRelatePeopleIfNeeded = () => {
  const url = window.location.href;
  if (!url.includes('AST%3ARelatePeople') && !url.includes('AST:RelatePeople')) return;
  console.log('🔗 [RELATE-PEOPLE] Página RelatePeople detectada. Esperando a que el DOM esté listo...');
  // Esperar a que el formulario esté renderizado antes de actuar
  const waitAndFill = (attempts = 0) => {
    const searchBtn = findRemedyField('304289680');
    if (searchBtn || attempts >= 20) {
      if (searchBtn) {
        console.log('🔗 [RELATE-PEOPLE] Formulario listo. Ejecutando auto-fill...');
        executeRelatePeopleAutoFill();
      } else {
        console.warn('⚠️ [RELATE-PEOPLE] Tiempo de espera agotado: botón Search no encontrado.');
      }
      return;
    }
    setTimeout(() => waitAndFill(attempts + 1), 500);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => waitAndFill(), 800), { once: true });
  } else {
    setTimeout(() => waitAndFill(), 800);
  }
};

initRelatePeopleIfNeeded();