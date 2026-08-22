(function () {
  if (window.__REMEDY_SCRIPTS__) return;

  // ── Namespace ───────────────────────────────────────────────────────────────

  const registry = {};

  const run = async key => {
    const fn = registry[key];
    if (!fn) return console.error('Script not found:', key);
    try { return await fn(); } catch (e) { console.error(e); }
  };

  window.__REMEDY_SCRIPTS__ = { registry, run };

  // ── Shared CRM field helper (arid_WIN_ pattern) ─────────────────────────────

  const findRemedyField = idOrSuffix => {
    if (!idOrSuffix) return null;
    const sfx = idOrSuffix.includes('_') ? idOrSuffix.split('_').pop() : idOrSuffix;
    const isVisible = el => el && (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);

    const searchInDoc = (doc) => {
      if (!doc) return { visible: null, fallback: null };
      
      const candidates = Array.from(doc.querySelectorAll(`[id$="_${sfx}"], [id*="_${sfx}"], [id="${idOrSuffix}"]`));
      let visible = candidates.find(isVisible);
      let fallback = candidates[0] || null;

      if (visible) return { visible, fallback };

      // Search child iframes if no visible element in current document
      try {
        const frames = doc.querySelectorAll('iframe, frame');
        for (let i = 0; i < frames.length; i++) {
          try {
            const fDoc = frames[i].contentDocument || frames[i].contentWindow?.document;
            const res = searchInDoc(fDoc);
            if (res.visible) return res;
            if (!fallback && res.fallback) fallback = res.fallback;
          } catch(e) {}
        }
      } catch(e) {}

      return { visible: null, fallback };
    };

    try {
      const res = searchInDoc(document) || (window.top ? searchInDoc(window.top.document) : null);
      return res ? (res.visible || res.fallback) : null;
    } catch (e) { }
    return null;
  };

  const forceSetRemedyField = (idOrSuffix, value) => {
    if (value === undefined || value === null || value === '') return false;
    const el = findRemedyField(idOrSuffix);
    if (!el) return false;

    const win = el.ownerDocument?.defaultView || window;

    try { el.focus(); } catch(e) {}

    if (el.tagName === 'SELECT') {
      let found = false;
      const valLower = String(value).trim().toLowerCase();
      for (let i = 0; i < el.options.length; i++) {
        if (el.options[i].value === value || el.options[i].text.trim().toLowerCase() === valLower) {
          el.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        el.value = value;
        try { el.setAttribute('value', value); } catch(e) {}
      }
    } else {
      el.value = value;
      try { el.setAttribute('value', value); } catch(e) {}
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
      } catch (e) { }
    });

    return true;
  };

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

    return {
      "200000020": ddiNum ? `SVC${ddiNum}` : '',
      "210000000": ddiNum ? `TC.SVC.${ddiNum}` : '',
      "200000003": "TELECOMUNICACIONS",
      "200000004": "VIDEOCONFERENCIA",
      "200000005": "VIDEOCONFERENCIA TPC ARC",
      "240001002": "VIDEOCONFERENCIA TPC ARC",
      "240001005": "ARCONTE VIDEOBOX",
      "240001003": "FUJITSU",
      "2000002882": ddiNum,
      "1000000001": getFieldValue(text, ['COMPANY']),
      "2000003720": getFieldValue(text, ['ORGANIZATION']),
      "200000006": getFieldValue(text, ['DEPARTAMENT']),
      "2000002850": "Deployed",
      "260700001": formattedDate,
      "8": getFieldValue(text, ['Hostname', 'HOST'])
    };
  };

  const extractFirstVendorSegment = text => {
    if (!text) return '';
    const trimmed = text.trim();
    const firstHyphenIdx = trimmed.indexOf('-');
    let rawSegment = firstHyphenIdx !== -1 ? trimmed.substring(0, firstHyphenIdx) : trimmed;
    return rawSegment.trim();
  };

  const extractLastVendorSegment = text => {
    if (!text) return '';
    const trimmed = text.trim();
    const lastHyphenIdx = trimmed.lastIndexOf('-');
    let rawSegment = lastHyphenIdx !== -1 ? trimmed.substring(lastHyphenIdx + 1) : trimmed;
    return rawSegment.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
  };

  const cleanVendorString = text => {
    if (!text) return text;
    let cleaned = text
      .replace(/\bOSVI\b/gi, 'OSV1')
      .replace(/\bOSV(?![\d\?])/gi, 'OSV?')
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

  // Read the current value of a remedy tier field (lowercased for comparison).
  const getTierFieldVal = sfx =>
    findRemedyField(sfx)?.value?.trim().toLowerCase() || '';

  // Check whether the terminal-substitution tiers are already correctly set.
  const isTaObrTierAlreadyCorrect = () =>
    getTierFieldVal('1000000063').includes('funcionament incorrecte') &&
    getTierFieldVal('1000000064').includes('terminal') &&
    getTierFieldVal('1000000065').includes('amb substitucio de terminal') &&
    getTierFieldVal('1000002488').includes('maquinari') &&
    getTierFieldVal('1000003889').includes('avaria') &&
    getTierFieldVal('1000003890').includes('substitució total');

  const checkAndFillObrCategorization = text => {
    if (!text) return;
    const upper = text.toUpperCase();
    // Detect TA - OA OBR / TA - DIAG / TA - MANCA patterns (requires TA prefix)
    const hasTa = /\bTA\b/.test(upper);
    const hasObrOrOntime = upper.includes('OBR') || upper.includes('ONTIME');
    const hasTaDiag = hasTa && upper.includes('DIAG');
    const hasTaManca = hasTa && upper.includes('MANCA');
    const hasAa = upper.includes('AA');
    const hasConf = upper.includes('CONF') || upper.includes('MANCA') || upper.includes('DIAG') || upper.includes('TAS') || upper.includes('TE') || upper.includes('TP') || upper.includes('SALES');
    const hasCons = upper.includes('CONS');

    // CONS / CONSULTA → only fill the 3 closure tiers, leave the rest untouched.
    if (hasCons) {
      forceSetRemedyField('1000002488', 'NO INCIDÈNCIA');
      forceSetRemedyField('1000003889', 'ÉS CONSULTA');
      forceSetRemedyField('1000003890', '-');
      return;
    }

    const firstSegment = extractFirstVendorSegment(text);
    if (firstSegment) {
      forceSetRemedyField('2000205550', firstSegment);
    }

    const lastSegment = extractLastVendorSegment(text);
    if (lastSegment) {
      forceSetRemedyField('2000205549', lastSegment);
    }

    // TA - OA OBR  /  TA - DIAG  /  TA - MANCA → substitució de terminal
    if ((hasObrOrOntime && hasTa) || hasTaDiag || hasTaManca) {
      // Early-exit: if tiers are already correct, don't overwrite them.
      if (isTaObrTierAlreadyCorrect()) return;
      forceSetRemedyField('1000000063', 'FUNCIONAMENT INCORRECTE');
      forceSetRemedyField('1000000064', 'TERMINAL');
      forceSetRemedyField('1000000065', 'AMB SUBSTITUCIO DE TERMINAL');
      forceSetRemedyField('1000002488', 'MAQUINARI');
      forceSetRemedyField('1000003889', 'AVARIA');
      forceSetRemedyField('1000003890', 'SUBSTITUCIÓ TOTAL');
    } else if (hasObrOrOntime && hasAa) {
      forceSetRemedyField('1000000063', 'FUNCIONAMENT INCORRECTE');
      forceSetRemedyField('1000000064', 'TERMINAL');
      forceSetRemedyField('1000000065', 'SENSE SUBSTITUCIO DE TERMINAL');
      forceSetRemedyField('1000002488', 'MAQUINARI');
      forceSetRemedyField('1000003889', 'AVARIA');
      forceSetRemedyField('1000003890', 'SUBSTITUCIÓ PEÇA');
    } else if (hasConf) {
      forceSetRemedyField('1000000063', 'FUNCIONAMENT INCORRECTE');
      forceSetRemedyField('1000000064', 'FUNCIONAMENT DEGRADAT');
      forceSetRemedyField('1000000065', 'ALTRES');
      forceSetRemedyField('1000002488', 'MAQUINARI');
      forceSetRemedyField('1000003889', 'CONFIGURACIÓ');
      forceSetRemedyField('1000003890', 'CONFIGURACIÓ');
    }
  };

  const setField = (suffix, value) => {
    const el = document.querySelector(`[id^="arid_WIN_"][id*="${suffix}"]`);
    if (!el) return;
    const valToSet = (suffix === '_1000000652') ? cleanVendorString(value) : value;
    el.value = valToSet;
    ['input', 'change'].forEach(e => el.dispatchEvent(new Event(e, { bubbles: true })));
    if (suffix === '_1000000652') {
      checkAndFillObrCategorization(valToSet);
    }
  };

  // ── CRM Text Injection Scripts ──────────────────────────────────────────────

  registry['CL'] = () => setField('_304247080', `Bon dia,\r\n\r\nPer tal de descartar possibles incidències relacionades amb el cable de l'auricular, et demanem que realitzis les següents comprovacions:\r\n\r\n1. Inspecciona visualment el cable arrissat de l'auricular per detectar possibles danys, trencaments o desgast. Durant una trucada, prova de moure lleugerament el cable per veure si es produeix alguna interrupció en l'àudio.\r\n2. Si en disposes, prova de substituir el cable actual per un altre en bon estat per comprovar si la incidència persisteix.\r\n\r\nAquestes proves ens ajudaran a determinar si l'origen del problema està relacionat amb el cablejat de l'auricular.\r\nPer tal de poder analitzar amb més detall la situació, també necessitaríem la següent informació addicional:\r\n\r\nEl problema es presenta en totes les trucades? (Sí / No)\r\nEs produeix només amb certs números?\r\nEn cas afirmatiu, si us plau facilita un exemple amb:\r\n1. Número que truca\r\n2. Data i hora aproximada de la trucada\r\n3. Extensió o dispositiu on es rep la trucada\r\n\r\nRecordeu que disposeu de cinc dies naturals (no 5 dies laborables) per fer-nos arribar aquesta informació o, si escau, indicar-nos una data en què us puguem contactar i fer proves amb vosaltres.\r\nEn cas contrari, el tiquet es tancarà automàticament passats els 5 dies, tot i que podreu tornar-lo a obrir un nou tiquet fent referència a aquest quan disposeu de les dades necessàries, i reprendrem l'anàlisi.\r\n\r\nAgraïm la teva col·laboració i restem a l'espera de la teva resposta per poder continuar amb la resolució de la incidència.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`);

  registry['COBR'] = () => setField('_1000000156', `Bon dia,\r\nEl tècnic ha realitzat la visita programada i ha fet les actuacions pertinents sobre el terminal, assegurant-ne el correcte funcionament.\r\nEn cas que es presenti qualsevol altra incidència, podeu contactar amb el servei d'assistència d'ATOM trucant al 900 828 282 per obrir una nova sol·licitud de suport.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`);

  registry['DUP'] = () => setField('_1000000156', `Benvolgut/da,\r\n\r\nAquest tiquet ha estat detectat com a duplicat. Seguint el procediment establert, procedim al seu tancament.\r\nPodeu continuar el seguiment de la incidència a través del tiquet original prèviament obert.\r\n\r\nCordialment,\r\nCentre  de Suport de Vodafone`);

  registry['EX'] = () => setField('_304247080', "Bon dia,\r\n\r\nPer tal de poder analitzar correctament la incidència i realitzar les traces corresponents, \r\nnecessitem que ens faciliteu exemples de trucades fallides amb la següent informació:\r\n\r\n- [Numero de Origen] Número mòbil o fix el qual us ha trucat\r\n- Data i hora:minut de la trucada\r\n- [Numero de destí] Numero fixe extern on han trucat\r\n- Extensió interna on es va rebre la trucada\r\n- [Comportament de la trucada] Resultat de la trucada\r\n- Es tracta d'un problema recurrent en totes les trucades o només en algunes?\r\n\r\nÉs important que els exemples facilitats no tinguin més de dos dies d'antiguitat, preferiblement del mateix dia en què es comunica la incidència.\r\n\r\nRecordeu que disposeu de cinc dies naturals (no 5 dies laborables ) per fer-nos arribar aquesta informació o, si escau, indicar-nos una data en què us puguem contactar i fer proves amb vosaltres. \r\nEn cas contrari, el tiquet es tancarà automàticament passats els 5 dies, tot i que podreu tornar-lo a obrir un nou tiquet fent referència a aquest quan disposeu de les dades necessàries, i reprendrem l'anàlisi.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone");

  registry['INT37'] = () => setField('_304247080', `Bon dia,\r\n\r\nEls talls de trucada, interferències o talls de veu sovint estan relacionats amb la cobertura. Per continuar amb la incidència, necessitem que feu les accions següents:\r\n\r\n1. Reinicieu el telèfon.\r\n2. Intercanvieu l'auricular amb el d'un altre telèfon.\r\n3. Comproveu que el cable de l'auricular estigui ben connectat al telèfon.\r\n4. Per fer el canvi de cobertura, aneu a Configuració > Xarxes mòbils > Preferència de tipus de xarxa i seleccioneu 2G. Reinicieu el terminal.\r\n5. Si el problema persisteix, repetiu el procés i torneu a seleccionar Auto 4G/3G/2G.\r\n\r\nDisposeu de 5 dies naturals (no 5 laborables) per respondre aquesta sol·licitud; un cop transcorregut aquest termini, el tiquet es tancarà per operativa.\r\n\r\nQuedem a l'espera de la vostra resposta amb el resultat de les comprovacions realitzades.\r\n\r\nGràcies i salutacions cordials.\r\nCentre de suport Vodafone`);

  registry['NA'] = () => setField('_1000000156', `Bon dia,\r\n\r\nCom que no hem rebut resposta amb les dades necessàries per analitzar la incidència, i seguint el procediment habitual, \r\nhem tancat aquest tiquet després de 5 dies naturals  sense resposta o novetats.\r\n\r\nTot i això, podeu tornar a obrir el tiquet en qualsevol moment facilitant la informació sol·licitada, o bé crear-ne \r\nun de nou si cal.\r\n\r\nGràcies per la vostra comprensió.\r\n\r\nSalutacions,\r\nCentre de Suport de Vodafone`);

  registry['NE37'] = () => setField('_304247080', `Bon dia\r\n\r\nper continuar amb la incidència necesitem que feu les accions \r\nindicades:\r\n\r\n1. Assegureu-vos de mantenir premuda la tecla vermella per encendre\r\n2. Assegureu-vos que la bateria estigui ben connectada al telèfon.\r\n3. Traieu la bateria, torneu a instal·lar-la\r\n4. Si la bateria està esgotada, recargueu-la\r\n5. Revisa que el carregador del telèfon estigui correctament conectat \r\n   i endollat.\r\n6. Connecteu el carregador del telèfon a un altre telèfon o \r\n   en un altre endoll i indiqueu-ne el resultat.\r\n\r\nQuedem en espera de resposta per poder continuar amb la incidència.\r\n\r\nRecordeu que disposeu de cinc dies naturals (no 5 dies laborables ) per respondre o, si escau, indicar-nos una data en què us puguem contactar. \r\nEn cas contrari, el tiquet es tancarà automàticament i/o manualment passats els 5 dies nautrals per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`);

  registry['NE25'] = () => setField('_304247080', `Bon dia\r\n\r\nper continuar amb la incidència necesitem que feu les accions \r\nindicades: \r\n\r\n1. Assegureu-vos de mantenir premuda la tecla d'encesa\r\n2. Assegureu-vos que la bateria estigui ben connectada al telèfon.\r\n3. Traieu la bateria, torneu a instal·lar-la i reinicieu el telèfon.\r\n4. Si la bateria està esgotada, recargueu-la\r\n5. Revisa que el carregador del telèfon estigui correctament conectat \r\n   i endollat.\r\n6. Connecteu el carregador del telèfon a un altre telèfon o \r\n   en un altre endoll i indiqueu-ne el resultat.\r\n\r\nQuedem en espera de resposta per poder continuar amb la incidència.\r\n\r\nRecordeu que disposeu de cinc dies naturals (no 5 dies laborables ) per respondre o, si escau, indicar-nos una data en què us puguem contactar. \r\nEn cas contrari, el tiquet es tancarà automàticament i/o manualment passats els 5 dies nautrals per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`);

  registry['OBR'] = () => setField('_304247080', `S'ha obert un tiquet per programar la visita d'un tècnic. Restem a l'espera de la seva intervenció.`);

  registry['PM'] = () => setField('_304247080', "Bon dia,\n\nPer tal de continuar amb les comprovacions, necessitem la teva col·laboració.\nEt demanem que connectis el terminal a un altre punt de xarxa/roseta i verifiquis\nsi s'inicia correctament o si apareix algun error, així com si el problema de\nconnectivitat a internet persisteix.\n\nUn cop feta la prova, si us plau, indica'ns si el terminal funciona correctament\nen l'altra connexió de xarxa o si el comportament és el mateix.\r\n\r\nRecordeu que disposeu de cinc dies naturals (no 5 dies laborables ) per respondre o, si escau, indicar-nos una data en què us puguem contactar. \r\nEn cas contrari, el tiquet es tancarà automàticament i/o manualment passats els 5 dies nautrals per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone");

  registry['PRI'] = () => setField('_1000000156', `Bon dia,\r\nHem revisat l'estat del canal primari, del qual en portem el manteniment en casos de incomunicació, i hem comprovat que es troba operatiu i en funcionament correcte.\r\n\r\nTanmateix, com que no gestionem la centraleta interna de la vostra seu, us recomanem posar-vos en contacte amb el vostre tècnic informàtic o \r\nl'empresa responsable del manteniment de la centraleta. Ells podran revisar el telèfon afectat, així com el cablejat i el seu recorregut fins\r\na la centraleta de la vostra instal·lació.\r\n\r\nRestem a disposició per qualsevol altra consulta o suport que pugueu necessitar.\r\n\r\nSalutacions cordials,\r\nCentre de suport de Vodafone`);

  registry['RE'] = () => setField('_304247080', `Revisió de la incidència iniciada. En fase de recopilació de dades per a l'anàlisi i diagnòstic.`);

  registry['TE'] = () => setField('_304247080', `Assignem a tècnic especialista de plataforma per fer la revisió`);

  registry['VOL37'] = () => setField('_304247080', `Bon dia, per prosseguir amb la incidència necessitem que feu les accions \r\n\r\n1. Assegureu-vos que heu comprovat el volum i aumenteu-lo enmig de trucada\r\n2. Reinicieu el telèfon\r\n3. Reviseu la cobertura a la pantalla del telòfon i indiqueu-nos-la\r\n4. Intercanvieu auriculars amb altre telefon i indiqueu-nos el resultat\r\n\r\nRestem a l'espera de resposta amb els resultats de les comprovacions realitzades. \r\n\r\nRecordeu que disposeu de cinc dies naturals (no 5 dies laborables ) per respondre o, si escau, indicar-nos una data en què us puguem contactar. \r\nEn cas contrari, el tiquet es tancarà automàticament i/o manualment passats els 5 dies nautrals per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone `);

  registry['WO'] = () => setField('_1000000156', `Bon dia,\r\nEl contingut exposat en aquest tiquet no es gestiona com una incidència, sinó com una petició.\r\nPodeu obrir la petició corresponent aportant la informació necessària per a la seva gestió a través de:\r\n\r\nPortal d'Autoservei ATOM: http://pautic.gencat.cat\r\nTelèfon: 900 828 282\r\n\r\nPer motius d'operativa, es procedeix al tancament d'aquest tiquet.\r\n\r\nCordialment,\r\nServei de Suport Tècnic\r\nVodafone`);

  registry['CLI'] = () => setField('_304247080', `Bon dia,\r\nsi us plau, podeu comprovar que ja funciona correctament?\r\n\r\n S'han realitzat configuracions a la plataforma de telefonia.\r\n\r\nRecordeu que disposeu de cinc dies naturals (no 5 dies laborables ) per respondre o, si escau, indicar-nos una data en què us puguem contactar. \r\nEn cas contrari, el tiquet es tancarà automàticament i/o manualment passats els 5 dies nautrals per operativa.\r\n\r\nCordialment,\r\nCentre de Suport de Vodafone`);

  registry['OBS'] = () => setField('_1000000156', `Bon dia,\r\n\r\nEl període d'observació acordat amb usuari ha finalitzat sense més incidències ni problemes reportats.\r\n\r\nPer tant, es dóna el tiquet per tancat.\r\n\r\nGràcies i salutacions cordials,\r\nCentre de suport Vodafone`);

  // ── OBR_CLEAR_STG ───────────────────────────────────────────────────────────

  registry['OBR_CLEAR_STG'] = () => chrome.storage.local.clear();

  // ── OBR_INFORME ─────────────────────────────────────────────────────────────

  const getVal = id => document.getElementById(id)?.value;
  const getText = id => document.getElementById(id)?.textContent;
  const MODELO_RE = /(Model de terminal|Modelo de terminal|Modelo terminal|Model de telèfon|Model de telefon):\s*(.*)/i;
  const extractModelo = str => (str?.match(MODELO_RE) || [])[2];

  const buildInformeRecord = () => ({
    'INCIDENCIA DE REMEDY': getVal('id_index_218'),
    'FECHA DE APERTURA DEL TOA': getText('id_index_241'),
    'ESTADO DEL TOA ACTUAL': getText('id_index_266'),
    'FECHA DE AGENDADO': getText('id_index_242'),
    'MODELO': extractModelo(getVal('id_index_306')),
    'VECES REAGENDADO': Math.max(0, document.querySelectorAll('[data-label="History"] table tr').length - 1),
    'ESTADO DE LA ACTUACIÓN': getText('id_index_266'),
  });

  registry['OBR_INFORME'] = () =>
    chrome.storage.local.get({ lista: [] }, res => {
      res.lista.push(buildInformeRecord());
      chrome.storage.local.set({ lista: res.lista });
    });

  // ── TIER ────────────────────────────────────────────────────────────────────

  const TIER_WORDS = {
    consulta: /consulta|extracte/,
    unify: /unify phone|rainbow|xarxa intel·ligent|riav/,
    plt: /gemyc|epveu/,
    ep: /ep - siep|epveu|viu en digital/,
    conf: /conf|ddi|sgi|tp|csv|sales/,
  };

  const TIER_CATS = {
    consulta: { c1: 'CONSULTA', c2: 'ALTRES', c4: 'NO INCIDÈNCIA', c5: 'ÉS CONSULTA', c6: '-', c7: 'COMUNICACIONS UNIFICADES' },
    unify: { c1: 'FUNCIONAMENT INCORRECTE', c2: 'FUNCIONAMENT DEGRADAT', c3: 'ALTRES', c4: 'MAQUINARI', c5: 'CONFIGURACIÓ', c6: 'CONFIGURACIÓ', c7: 'COMUNICACIONS UNIFICADES' },
    plt: { c1: 'FUNCIONAMENT INCORRECTE', c2: 'FUNCIONAMENT DEGRADAT', c3: 'INCIDENCIA PLATAFORMA', c4: 'MAQUINARI', c5: 'CONFIGURACIÓ', c6: 'CONFIGURACIÓ', c7: 'COMUNICACIONS UNIFICADES' },
    ep: { c1: 'FUNCIONAMENT INCORRECTE', c2: 'FUNCIONAMENT DEGRADAT', c3: 'INCIDENCIA PLATAFORMA', c4: 'MAQUINARI', c5: 'CONFIGURACIÓ', c6: 'CONFIGURACIÓ', c7: 'AM19-CPD4' },
    conf: { c1: 'FUNCIONAMENT INCORRECTE', c2: 'FUNCIONAMENT DEGRADAT', c3: 'ALTRES', c4: 'MAQUINARI', c5: 'CONFIGURACIÓ', c6: 'CONFIGURACIÓ', c7: 'COMUNICACIONS UNIFICADES' },
    default: { c1: 'FUNCIONAMENT INCORRECTE', c2: 'TERMINAL', c3: 'AMB SUBSTITUCIO DE TERMINAL', c4: 'MAQUINARI', c5: 'AVARIA', c6: 'SUBSTITUCIÓ TOTAL', c7: 'COMUNICACIONS UNIFICADES' },
  };

  const TIER_FIELD_MAP = {
    '1000000063': 'c1', '1000000064': 'c2', '1000000065': 'c3',
    '1000002488': 'c4', '1000003889': 'c5', '1000003890': 'c6', '200000004': 'c7',
  };

  const getTierVal = sfx =>
    document.querySelector(`[id^="arid_WIN_"][id$="${sfx}"]`)?.value?.toLowerCase() || '';

  const applyTierCat = cat =>
    Object.entries(TIER_FIELD_MAP).forEach(([sfx, key]) => cat[key] && setField(sfx, cat[key]));

  const detectTierCat = (sum, vnd) => {
    if (TIER_WORDS.consulta.test(sum)) return TIER_CATS.consulta;
    if (TIER_WORDS.unify.test(sum)) return TIER_CATS.unify;
    if (TIER_WORDS.plt.test(vnd)) return TIER_CATS.plt;
    if (TIER_WORDS.ep.test(sum)) return TIER_CATS.ep;
    if (TIER_WORDS.conf.test(vnd)) return TIER_CATS.conf;
    return TIER_CATS.default;
  };

  registry['TIER'] = () => {
    [...document.querySelectorAll('span.Tab a')].find(t => t.textContent.trim() === 'Categorization')?.click();
    const sum = getTierVal('_1000000000'), vnd = getTierVal('_1000000652');
    if (!vnd.includes('ov')) applyTierCat(detectTierCat(sum, vnd));
    setTimeout(() => document.querySelector('[id^="WIN_"][id$="301614800"]')?.click(), 500);
  };

  // ── OBR_APERTURA (absorbed from standalone file) ─────────────────────────────

  const OBR_CFG = {
    telefono: '900925240',
    correo: 'csv-generalitat-fix@vodafone.com',
    cliente: 'generalitat',
    cif: 'Q5856338H',
    zelenza: 'ZELENZA',
  };

  const OBR_KEYWORDS = {
    INC: ['4018', '4028', '4019', '4039', '8008', '8028', '8039', 'analògic', 'analogic', 'open stage', 'os40', 'os15', 'cp110', 'cp200', 'cp205', 'cp210', 'cp400', 'cp410', 'cp600', 'cp600e', 'gigaset', 'dect', 'mediatrix', 'ale300', '300'],
    OV: ['dt180', 'dt200', 'dt250', 'neo3750', 'neo3850', '3080', 'neo3850w'],
    AURORA: ['aurora', 'veex'],
    FCT: ['fct', 'gsm'],
  };

  // Clipboard parsing
  const normalizeLine = line => line.replace('-', '').split(':');
  const isValidPair = ([, v]) => Boolean(v);
  const toTrimmedEntry = ([k, v]) => [k.trim(), v.trim()];

  const parseClipboard = text =>
    Object.fromEntries(
      text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .split('\n').map(normalizeLine).filter(isValidPair).map(toTrimmedEntry)
    );

  // Vars extraction
  const extractProvince = addr => addr?.match(/\s([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)$/i)?.[1] || 'No encontrada';
  const extractPostal = addr => addr?.match(/\b\d{5}\b/)?.[0] || '00000';
  const extractCity = addr => addr?.match(/(\d{5})\s?([^,]+)/)?.[2] || 'Desconocida';
  const countExts = ext => ext?.split(/[\s,]+/).length || 0;
  const detectGrupo = modelo => Object.keys(OBR_KEYWORDS).find(g => OBR_KEYWORDS[g].some(k => modelo.includes(k))) || null;

  const buildAddressFields = dict => {
    const addr = dict['direccio de la seu'];
    return { provincia: extractProvince(addr), postal: extractPostal(addr), ciudad: extractCity(addr) };
  };

  const buildVars = dict => {
    const modelo = (dict['model de terminal'] || '').toLowerCase();
    return {
      dict, modelo, grupo: detectGrupo(modelo),
      ...buildAddressFields(dict),
      cantidadExtensiones: countExts(dict['extensio o numeracio afectada'])
    };
  };

  // Desplegables data
  const buildDesplegables = p => ({
    AURORA: [
      { id: 'id_index_2', name: 'IPVPN Pruebas Voz' }, { id: 'id_index_182', name: '18-18:30' },
      { id: 'id_index_18', name: 'NO' }, { id: 'id_index_19', name: 'SI' },
      { id: 'id_index_22', name: 'CSV' }, { id: 'id_index_24', name: 'ESTANDAR' },
      { id: 'id_index_38', name: p }, { id: 'id_index_59', name: 'SIP' },
      { id: 'id_index_67', name: 'SIP' }, { id: 'id_index_61', name: 'SIP' },
    ],
    FCT: [
      { id: 'id_index_2', name: 'One Net Mantenimiento' }, { id: 'id_index_8', name: 'Corporate' },
      { id: 'id_index_9', name: 'SI' }, { id: 'id_index_182', name: '18-18:30' },
      { id: 'id_index_22', name: 'CSV' }, { id: 'id_index_83', name: 'SUPPORT' },
      { id: 'id_index_24', name: 'ESTANDAR' }, { id: 'id_index_123', name: '1' },
      { id: 'id_index_38', name: p },
    ],
    INC: [
      { id: 'id_index_2', name: 'IPVPN Visita CITADO' }, { id: 'id_index_18', name: 'NO' },
      { id: 'id_index_19', name: 'SI' }, { id: 'id_index_182', name: '10-12' },
      { id: 'id_index_22', name: 'CSV' }, { id: 'id_index_24', name: 'ESTANDAR' },
      { id: 'id_index_31', name: 'Ninguno' }, { id: 'id_index_38', name: p },
      { id: 'id_index_60', name: 'SIP' }, { id: 'id_index_62', name: 'SIP' },
      { id: 'id_index_68', name: 'SIP' }, { id: 'id_index_9', name: 'SI' },
      { id: 'id_index_182', name: '18-18:30' },
    ],
    OV: [
      { id: 'id_index_2', name: 'One Net Mantenimiento' }, { id: 'id_index_8', name: 'Corporate' },
      { id: 'id_index_9', name: 'SI' }, { id: 'id_index_182', name: '18-18:30' },
      { id: 'id_index_22', name: 'CSV' }, { id: 'id_index_83', name: 'SUPPORT' },
      { id: 'id_index_24', name: 'ESTANDAR' }, { id: 'id_index_38', name: p },
    ],
  });

  // Dropdown filling
  const fillField = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = value;
    ['input', 'change'].forEach(e => el.dispatchEvent(new Event(e)));
  };

  const clickFirstOption = () => document.querySelector('div.list-option')?.click();

  const fillDropdown = async ({ id, name }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = name;
    ['input', 'change'].forEach(e => el.dispatchEvent(new Event(e, { bubbles: true })));
    clickFirstOption();
    await new Promise(r => setTimeout(r, 50));
  };

  const completarDesplegables = async lista => {
    for (const item of lista) await fillDropdown(item);
  };

  // Field filling
  const fillObrCommon = dict => {
    fillField('id_index_17', dict['horari de contacte']);
    fillField('id_index_16', '3');
    fillField('id_index_25', OBR_CFG.telefono); fillField('id_index_26', OBR_CFG.correo);
    fillField('id_index_27', OBR_CFG.telefono); fillField('id_index_28', OBR_CFG.correo);
  };

  const fillObrContact = (dict, vars) => {
    fillField('id_index_33', OBR_CFG.cliente); fillField('id_index_34', OBR_CFG.cif);
    fillField('id_index_36', dict['direccio de la seu']);
    fillField('id_index_40', vars.ciudad); fillField('id_index_41', vars.postal);
    fillField('id_index_52', dict['persona de contacte']); fillField('id_index_53', dict['telefon de contacte']);
  };

  const fillIncExtra = dict => {
    fillField('id_index_73', dict['model de terminal']);
    fillField('id_index_20', OBR_CFG.zelenza);
  };

  const fillOvExtra = (dict, vars) => {
    fillField('id_index_116', vars.cantidadExtensiones);
    fillField('id_index_121', dict['model de terminal']);
  };

  const fillObrGroup = (grupo, dict, vars) => {
    const isOnet = grupo === 'OV' || grupo === 'FCT';
    fillField('id_index_1', isOnet ? `ONET_${dict['inc']}` : dict['inc']);
    if (grupo === 'INC') fillIncExtra(dict);
    if (grupo === 'OV') fillOvExtra(dict, vars);
  };

  const fillDate = () => {
    const [, fecha] = document.querySelector('div.page-header-description').innerText.split(',').map(t => t.trim());
    fillField('id_index_14', `${fecha} 18:00`);
    fillField('id_index_15', `${fecha} 21:00`);
  };

  // Note generation
  const buildBaseInfo = d => [
    `Sede: ${d['nom de la seu']}`, `Horario: ${d['horari de contacte']}`,
    `Dirección: ${d['direccio de la seu']}`, `Contacto: ${d['persona de contacte']}`,
    `Número de contacto: ${d['telefon de contacte']}`, `Numeración afectada: ${d['extensio o numeracio afectada']}\n`,
  ].join('\n');

  const buildIncNote = (d, base) => {
    const isCJ = d['direccio de la seu']?.includes('gran via de les corts catalanes, 111');
    const aviso = isCJ ? '**Aviso Ciutat de la Justicia: notificar visita con 24h de antelación.**\n\n' : '';
    return `Necesitamos cambio de terminal y pruebas conjuntas\n\n${aviso}${base}Modelo de terminal: ${d['model de terminal']}`;
  };

  const noteByGrupo = (grupo, d, base) => {
    if (grupo === 'AURORA') return `Se solicita realizar pruebas con dispositivo AURORA para revisar primario en sede ${d['nom de la seu']}\n\n${base}\nPrimario a revisar:\nSMX:\nATN:\nA2M:\n\nSe deben llevar los siguientes dispositivos:\n- Dispositivo AURORA (OBLIGATORIO)\n- Cableado coaxial / RJ11 / RJ45\n- Dispositivo BALUN\n`;
    if (grupo === 'FCT') return `Necesitamos revisar una FCT (llevar SIM + FCT) y hacer pruebas conjuntas\n\n${base}`;
    if (grupo === 'OV') return `Necesitamos revisar teléfonos (llevar SIM por si acaso) y hacer pruebas conjuntas\n\n${base}`;
    if (grupo === 'INC') return buildIncNote(d, base);
    return '';
  };

  const generarNota = (grupo, dict) =>
    fillField('id_index_150', noteByGrupo(grupo, dict, buildBaseInfo(dict)));

  // Main entry point
  const rellenarPorGrupo = vars => {
    if (!vars.grupo) return console.warn('No se pudo determinar grupo');
    fillObrCommon(vars.dict);
    fillObrContact(vars.dict, vars);
    fillObrGroup(vars.grupo, vars.dict, vars);
    fillDate();
    generarNota(vars.grupo, vars.dict);
  };

  registry['OBR_APERTURA'] = async () => {
    const dict = parseClipboard(await navigator.clipboard.readText());
    const vars = buildVars(dict);
    console.log('Grupo detectado:', vars.grupo);
    if (vars.grupo) await completarDesplegables(buildDesplegables(vars.provincia)[vars.grupo]);
    setTimeout(() => rellenarPorGrupo(vars), 1500);
  };

  const getAllElementsOrdered = () => {
    const list = [];
    const scan = (doc) => {
      if (!doc) return;
      const els = Array.from(doc.querySelectorAll('input, textarea, select'));
      els.forEach(el => list.push(el));

      try {
        const frames = doc.querySelectorAll('iframe, frame');
        frames.forEach(f => {
          try {
            const fDoc = f.contentDocument || f.contentWindow?.document;
            scan(fDoc);
          } catch(e) {}
        });
      } catch(e) {}
    };

    try {
      scan(document);
      if (window.top && window.top.document && window.top.document !== document) {
        scan(window.top.document);
      }
    } catch(e) {}

    return list;
  };

  registry['FILL_ARCONTE'] = async () => {
    console.log('🚀 [FILL_ARCONTE] Ejecutando autocompletado por índice de objeto de la web...');
    let text = '';
    try {
      text = await navigator.clipboard.readText();
    } catch(e) {}

    if (!text) {
      try {
        const ta = document.createElement('textarea');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        document.execCommand('paste');
        text = ta.value;
        document.body.removeChild(ta);
      } catch(e) {}
    }

    if (!text || !text.toUpperCase().includes('WO:')) {
      console.warn('⚠️ [FILL_ARCONTE] No se encontró plantilla WO: válida en el portapapeles');
      return;
    }

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

    const allElements = getAllElementsOrdered();
    console.log(`📋 [FILL_ARCONTE] Escaneados ${allElements.length} elementos form en la web.`);

    const rawHost = getFieldValue(text, ['Hostname', 'HOST']);
    const hostValue = rawHost ? (rawHost.endsWith('.videobox.justicia.intranet.gencat.cat') ? rawHost : `${rawHost}.videobox.justicia.intranet.gencat.cat`) : '';

    const indexMap = {
      52: ddiNum ? `SVC${ddiNum}` : '',
      55: ddiNum ? `TC.SVC.${ddiNum}` : '',
      71: "TELECOMUNICACIONS",
      72: "VIDEOCONFERENCIA",
      73: "VIDEOCONFERENCIA TPC ARC",
      74: "VIDEOCONFERENCIA TPC ARC",
      75: "ARCONTE VIDEOBOX",
      76: "FUJITSU",
      91: ddiNum,
      60: getFieldValue(text, ['COMPANY']),
      48: getFieldValue(text, ['ORGANIZATION']),
      53: getFieldValue(text, ['DEPARTAMENT']),
      62: "Deployed",
      259: "Deployed",
      83: formattedDate,
      54: hostValue
    };

    const suffixMap = {
      52: '200000020', 55: '210000000', 71: '200000003', 72: '200000004',
      73: '200000005', 74: '240001002', 75: '240001005', 76: '240001003',
      91: '2000002882', 60: '1000000001', 48: '2000003720', 53: '200000006',
      62: '2000002850', 259: '2000002850', 83: '260700001', 54: '8'
    };

    const setRemedyFieldComplete = (fieldId, value) => {
      if (!fieldId || value === undefined || value === null || value === '') return false;
      const sfx = String(fieldId).includes('_') ? String(fieldId).split('_').pop() : String(fieldId);

      let success = false;

      const tryNativeAR = (win) => {
        try {
          if (!win) return false;
          if (typeof win.ARSetText === 'function') {
            win.ARSetText(3, sfx, value);
            win.ARSetText('3', sfx, value);
            win.ARSetText(5, sfx, value);
            win.ARSetText('5', sfx, value);
            if (sfx === '2000002850') {
              try { win.ARSetText(3, 2000002850, 3); } catch(e){}
              try { win.ARSetText(3, '2000002850', 3); } catch(e){}
            }
            return true;
          }
          if (typeof win.ARSetFullText === 'function') {
            win.ARSetFullText(3, sfx, value);
            win.ARSetFullText(5, sfx, value);
            return true;
          }
        } catch(e) {}
        return false;
      };

      try {
        tryNativeAR(window);
        if (window.top) tryNativeAR(window.top);
      } catch(e) {}

      const setOnDoc = (doc) => {
        if (!doc) return false;
        const els = Array.from(doc.querySelectorAll(`[id$="_${sfx}"], [id*="_${sfx}"]`));
        let setAny = false;

        els.forEach(el => {
          const win = el.ownerDocument?.defaultView || window;

          try {
            if (typeof win.ARSetText === 'function') {
              win.ARSetText(3, sfx, value);
              win.ARSetText('3', sfx, value);
              if (sfx === '2000002850') {
                try { win.ARSetText(3, 2000002850, 3); } catch(e){}
              }
            }
          } catch(e) {}

          try { el.focus(); } catch(e) {}

          if (el.tagName === 'SELECT') {
            let found = false;
            const valLower = String(value).trim().toLowerCase();
            for (let i = 0; i < el.options.length; i++) {
              if (el.options[i].value === value || el.options[i].text.trim().toLowerCase() === valLower) {
                el.selectedIndex = i;
                found = true;
                break;
              }
            }
            if (!found) {
              el.value = value;
              try { el.setAttribute('value', value); } catch(e) {}
            }
          } else {
            if (el.readOnly || el.hasAttribute('readonly')) {
              try { el.removeAttribute('readonly'); } catch(e){}
            }
            el.value = value;
            try { el.setAttribute('value', value); } catch(e) {}
            try { el.title = value; } catch(e) {}
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
            } catch (e) { }
          });

          setAny = true;
        });

        try {
          const frames = doc.querySelectorAll('iframe, frame');
          frames.forEach(f => {
            try {
              const fDoc = f.contentDocument || f.contentWindow?.document;
              if (setOnDoc(fDoc)) setAny = true;
            } catch(e) {}
          });
        } catch(e) {}

        return setAny;
      };

      try {
        if (setOnDoc(document)) success = true;
        if (window.top && window.top.document && setOnDoc(window.top.document)) success = true;
      } catch(e) {}

      return success;
    };

    let filledCount = 0;
    Object.keys(indexMap).forEach(idxStr => {
      const idx = parseInt(idxStr, 10);
      const val = indexMap[idx];
      if (!val) return;

      const sfx = suffixMap[idx];
      let targetEl = allElements[idx - 1];
      if (!targetEl || (sfx && !targetEl.id.includes(sfx))) {
        targetEl = findRemedyField(sfx);
      }

      const targetId = targetEl ? targetEl.id : (sfx ? `arid_WIN_3_${sfx}` : '');
      const ok = setRemedyFieldComplete(sfx || targetId, val);

      if (ok) {
        console.log(`📝 [FILL_ARCONTE] Índice [${idx}] (Sufijo/ID: ${sfx || targetId}) -> Valor: "${val}" ✅ RELLENADO`);
        filledCount++;
      } else {
        console.warn(`❌ [FILL_ARCONTE] No se pudo rellenar el índice [${idx}]`);
      }
    });

    console.log(`🎉 [FILL_ARCONTE] Resumen final: ${filledCount} campos rellenados en la web.`);
  };

})();
