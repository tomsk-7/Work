document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const inputArea = document.getElementById('inventory-input');
  const statLines = document.getElementById('stat-lines');
  const statChars = document.getElementById('stat-chars');
  const statIps = document.getElementById('stat-ips');
  const statMacs = document.getElementById('stat-macs');
  const statSerials = document.getElementById('stat-serials');

  const btnExecute = document.getElementById('btn-execute');
  const btnExample = document.getElementById('btn-example');
  const btnClear = document.getElementById('btn-clear');
  const btnCopyOutput = document.getElementById('btn-copy-output');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnOpenExtension = document.getElementById('btn-open-extension');

  const emptyState = document.getElementById('empty-state');
  const resultsContent = document.getElementById('results-content');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // RegEx Patterns
  const IP_REGEX = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
  const MAC_REGEX = /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b|\b[0-9a-fA-F]{4}\.[0-9a-fA-F]{4}\.[0-9a-fA-F]{4}\b/g;
  const SERIAL_REGEX = /\b(?:SN|S\/N|SERIAL|SERIE)[:\s]*([A-Za-z0-9\-_]{6,20})\b|\b([A-Z0-9]{8,14})\b/gi;

  let processedData = [];

  // 1. Toast Notification Helper
  function showToast(message) {
    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // 2. Storage Helpers (Chrome extension or localStorage fallback)
  function saveDraft(text) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ inventory_draft: text });
    } else {
      localStorage.setItem('inventory_draft', text);
    }
  }

  function loadDraft() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['inventory_draft'], (res) => {
        if (res && res.inventory_draft) {
          inputArea.value = res.inventory_draft;
          analyzeTextLive();
        }
      });
    } else {
      const saved = localStorage.getItem('inventory_draft');
      if (saved) {
        inputArea.value = saved;
        analyzeTextLive();
      }
    }
  }

  // Check URL params if text was passed directly
  const urlParams = new URLSearchParams(window.location.search);
  const initialText = urlParams.get('text');
  if (initialText) {
    inputArea.value = decodeURIComponent(initialText);
  } else {
    loadDraft();
  }

  // 3. Live Text Analysis (Lectura en tiempo real)
  function analyzeTextLive() {
    const text = inputArea.value || '';
    saveDraft(text);

    const lines = text ? text.split('\n').filter(l => l.trim().length > 0).length : 0;
    const chars = text.length;

    const ips = (text.match(IP_REGEX) || []);
    const macs = (text.match(MAC_REGEX) || []);
    
    // Serials count
    let serialMatches = 0;
    let match;
    const serialRegexCopy = new RegExp(SERIAL_REGEX);
    while ((match = serialRegexCopy.exec(text)) !== null) {
      if (match[1] || match[2]) serialMatches++;
    }

    statLines.textContent = lines.toLocaleString();
    statChars.textContent = chars.toLocaleString();
    statIps.textContent = ips.length;
    statMacs.textContent = macs.length;
    statSerials.textContent = serialMatches;
  }

  inputArea.addEventListener('input', analyzeTextLive);

  // 4. Execution Processing (Botón de Ejecución)
  function executeInventoryProcess() {
    const text = inputArea.value.trim();

    if (!text) {
      showToast('Por favor, ingresa texto para procesar el inventario.');
      return;
    }

    const rawLines = text.split('\n');
    processedData = [];

    rawLines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const ips = trimmed.match(IP_REGEX) || [];
      const macs = trimmed.match(MAC_REGEX) || [];

      // Extract serials
      const serials = [];
      const sRegex = new RegExp(SERIAL_REGEX);
      let m;
      while ((m = sRegex.exec(trimmed)) !== null) {
        const val = m[1] || m[2];
        if (val && !ips.includes(val) && !macs.includes(val)) {
          serials.push(val);
        }
      }

      // Determine main classification tag
      let mainTag = 'DISPOSITIVO';
      let tagClass = 'badge-text';

      if (macs.length > 0) {
        mainTag = 'MAC / RED';
        tagClass = 'badge-mac';
      } else if (ips.length > 0) {
        mainTag = 'IP HOST';
        tagClass = 'badge-ip';
      } else if (serials.length > 0) {
        mainTag = 'EQUIPO S/N';
        tagClass = 'badge-sn';
      }

      processedData.push({
        id: index + 1,
        raw: trimmed,
        tag: mainTag,
        tagClass: tagClass,
        ip: ips.join(', ') || '-',
        mac: macs.join(', ') || '-',
        serial: serials.join(', ') || '-'
      });
    });

    renderResults();
    showToast(`Ejecución finalizada: ${processedData.length} elementos procesados.`);
  }

  // 5. Render Results Table
  function renderResults() {
    if (processedData.length === 0) {
      emptyState.style.display = 'flex';
      resultsContent.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    resultsContent.style.display = 'block';

    let tableHtml = `
      <table class="table-cyber">
        <thead>
          <tr>
            <th>#</th>
            <th>Tipo</th>
            <th>Descripción / Raw</th>
            <th>IP</th>
            <th>MAC</th>
            <th>S/N</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
    `;

    processedData.forEach(item => {
      tableHtml += `
        <tr>
          <td style="color: var(--text-dim);">${item.id}</td>
          <td><span class="badge-tag ${item.tagClass}">${item.tag}</span></td>
          <td style="word-break: break-word; max-width: 250px;">${escapeHtml(item.raw)}</td>
          <td style="color: var(--accent-green);">${item.ip}</td>
          <td style="color: var(--accent-purple);">${item.mac}</td>
          <td style="color: var(--accent-red);">${item.serial}</td>
          <td>
            <button class="copy-mini" data-copy="${escapeHtml(item.raw)}" title="Copiar fila">
              <i class="ph ph-copy"></i>
            </button>
          </td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    resultsContent.innerHTML = tableHtml;

    // Attach copy listeners
    resultsContent.querySelectorAll('.copy-mini').forEach(btn => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy');
        navigator.clipboard.writeText(textToCopy);
        showToast('Copiado al portapapeles');
      });
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  // 6. Action Handlers
  btnExecute.addEventListener('click', executeInventoryProcess);

  btnExample.addEventListener('click', () => {
    inputArea.value = 
`WO:
TIPO: ALTA ARCONTE
EU: NOMBRE SEU
COMPANY: NOMBRE COMPANY
ORGANIZATION: NOMBRE ORGANIZATION
DEPARTAMENT: NOMBRE DEPARTAMENT
CODI SEU: $SEU.000000$
Nombre de sala: SALA DE VISTES 09 PLANTA 1 %ESP.00000.00%
Hostname: VIGSV00VX
DDI: 000000000
plataforma = %PLATAFORMA VIDEOCONFERENCIA CORPORATIVA%`;
    analyzeTextLive();
    showToast('Ejemplo de WO inventario cargado.');
  });

  btnClear.addEventListener('click', () => {
    inputArea.value = '';
    processedData = [];
    analyzeTextLive();
    renderResults();
    showToast('Pantalla limpiada.');
  });

  btnCopyOutput.addEventListener('click', () => {
    if (processedData.length === 0) {
      showToast('No hay datos procesados para copiar.');
      return;
    }
    const cleanOutput = processedData.map(i => `${i.id}. [${i.tag}] ${i.raw}`).join('\n');
    navigator.clipboard.writeText(cleanOutput);
    showToast('Resultados copiados al portapapeles.');
  });

  btnExportCsv.addEventListener('click', () => {
    if (processedData.length === 0) {
      showToast('No hay datos para exportar.');
      return;
    }
    let csv = 'ID,Tipo,Texto,IP,MAC,Serial\n';
    processedData.forEach(i => {
      csv += `"${i.id}","${i.tag}","${i.raw.replace(/"/g, '""')}","${i.ip}","${i.mac}","${i.serial}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV exportado correctamente.');
  });

  btnOpenExtension.addEventListener('click', () => {
    showToast('Módulo aislado de inventariado activo.');
  });
});
