#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function main() {
  const options = parseArgs();
  const templatePath = path.resolve(__dirname, 'report-template.html');
  const dataPath = options.dataPath
    ? path.resolve(options.dataPath)
    : path.resolve(__dirname, 'sample-data.json');

  const data = loadData(dataPath);
  const html = buildHtml(templatePath, data);

  await renderPdf(html, options.outputPath, options.showBrowser);
  console.log(`PDF zapisany do: ${options.outputPath}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dataPath: null,
    outputPath: path.resolve('docs', 'raport-puppeteer.pdf'),
    showBrowser: false
  };

  for (let i = 0; i < args.length; i++) {
    const current = args[i];
    const next = args[i + 1];

    if ((current === '--data' || current === '-d') && next) {
      options.dataPath = next;
      i++;
      continue;
    }

    if ((current === '--out' || current === '-o') && next) {
      options.outputPath = path.resolve(next);
      i++;
      continue;
    }

    if (current === '--open' || current === '--show-browser') {
      options.showBrowser = true;
      continue;
    }
  }

  return options;
}

function loadData(dataPath) {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Nie moge odczytac pliku z danymi: ${dataPath}\n${err.message}`);
  }
}

function buildHtml(templatePath, data) {
  const template = fs.readFileSync(templatePath, 'utf8');

  const summaryCards = renderSummaryCards(data.summary);
  const metrics = renderMetricItems(data.metrics);
  const bars = renderBars(Array.isArray(data.bars) ? data.bars : [], data.summary);
  const rows = renderRows(Array.isArray(data.rows) ? data.rows : []);

  const replacements = {
    TITLE: escapeHtml(data.title || 'Raport kampanii'),
    GENERATED_AT: escapeHtml(data.generatedAt || new Date().toLocaleString()),
    FILTER_CAMPAIGN: escapeHtml(data.filters?.campaign || 'Wszystkie'),
    FILTER_GROUP: escapeHtml(data.filters?.group || 'Wszystkie'),
    FILTER_RANGE: escapeHtml(data.filters?.range || '--'),
    SUMMARY_CARDS: summaryCards,
    METRIC_ITEMS: metrics,
    BARS: bars,
    ROWS: rows
  };

  return Object.entries(replacements).reduce((html, [token, value]) => {
    return html.replace(new RegExp(`{{${token}}}`, 'g'), value);
  }, template);
}

function renderSummaryCards(summary) {
  const stats = [
    { label: 'Wysłane', value: summary?.sent ?? 0 },
    { label: 'Otwarcia', value: summary?.opened ?? 0 },
    { label: 'Kliknięcia', value: summary?.clicked ?? 0 }
  ];

  return stats
    .map(
      stat => `
        <div class="card">
          <div class="label">${escapeHtml(stat.label)}</div>
          <div class="value">${formatNumber(stat.value)}</div>
        </div>
      `.trim()
    )
    .join('\n');
}

function renderMetricItems(metrics = {}) {
  const items = [
    { label: 'Open rate (otwarcia / wysłane)', value: metrics.openRate ?? 0, suffix: '%' },
    { label: 'CTR (kliknięcia / wysłane)', value: metrics.clickRate ?? 0, suffix: '%' },
    { label: 'CTOR (kliknięcia / otwarcia)', value: metrics.clickToOpenRate ?? 0, suffix: '%' }
  ];

  return items
    .map(
      item => `
        <div class="metric">
          <div class="label">${escapeHtml(item.label)}</div>
          <div class="value">${formatNumber(item.value)}${item.suffix}</div>
        </div>
      `.trim()
    )
    .join('\n');
}

function renderBars(bars, summary) {
  const fallbackBars = [
    {
      label: 'Wysłane',
      value: summary?.sent ?? 0,
      colorStart: '#0f172a',
      colorEnd: '#334155'
    },
    {
      label: 'Otwarcia',
      value: summary?.opened ?? 0,
      colorStart: '#1d4ed8',
      colorEnd: '#60a5fa'
    },
    {
      label: 'Kliknięcia',
      value: summary?.clicked ?? 0,
      colorStart: '#0f766e',
      colorEnd: '#14b8a6'
    }
  ];

  const dataset = bars.length ? bars : fallbackBars;
  const max = Math.max(...dataset.map(item => item.value || 0), 1);
  const sentTotal = Number(summary?.sent) || max;

  return dataset
    .map(bar => {
      const value = Number(bar.value) || 0;
      const heightPercent = Math.max(4, Math.round((value / max) * 100));
      const shareOfMax = (value / max) * 100;
      const shareOfSent = sentTotal > 0 ? (value / sentTotal) * 100 : null;

      const shareText = [
        `${formatNumber(shareOfMax, true)}% względem najwyższej wartości`,
        shareOfSent !== null ? `${formatNumber(shareOfSent, true)}% względem wysłanych` : null
      ].filter(Boolean).join(' · ');

      return `
        <div class="bar-card">
          <p class="bar-title">${escapeHtml(bar.label || '')}</p>
          <div class="bar-stack">
            <div
              class="pillar"
              style="--height:${heightPercent}%; --bar-start:${sanitizeColor(bar.colorStart)}; --bar-end:${sanitizeColor(
        bar.colorEnd
      )};">
            </div>
          </div>
          <div class="bar-value">${formatNumber(value)}</div>
          <div class="bar-subtext">${escapeHtml(shareText)}</div>
          <div class="bar-legend">
            <span class="bar-dot" style="--color:${sanitizeColor(bar.colorStart)}"></span>
            <span>Wartość: ${formatNumber(value)} | Udział: ${formatNumber(shareOfMax, true)}%</span>
          </div>
        </div>
      `.trim();
    })
    .join('\n');
}

function renderRows(rows) {
  if (!rows.length) {
    return `
      <tr>
        <td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">
          Brak danych do wyświetlenia.
        </td>
      </tr>
    `.trim();
  }

  return rows
    .map(
      row => `
        <tr>
          <td>${escapeHtml(row.recipient || '')}</td>
          <td>
            <span class="status" style="border-color:${sanitizeColor(row.statusColor)}; color:${sanitizeColor(
        row.statusColor
      )};">
              <span class="status-dot" style="background:${sanitizeColor(row.statusColor)};"></span>
              ${escapeHtml(row.status || '')}
            </span>
          </td>
          <td>${escapeHtml(row.sent || '--')}</td>
          <td>${escapeHtml(row.opened || '--')}</td>
          <td>${escapeHtml(row.clicked || '--')}</td>
        </tr>
      `.trim()
    )
    .join('\n');
}

function escapeHtml(input) {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeColor(value) {
  const text = String(value || '').trim();
  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(text) || /^rgb[a]?\(/i.test(text)) {
    return text;
  }
  return '#0f172a';
}

function formatNumber(value, forceDecimal = false) {
  const num = Number(value) || 0;
  const hasFraction = forceDecimal || Math.abs(num % 1) > 0;
  const formatter = new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: hasFraction ? 1 : 0,
    maximumFractionDigits: hasFraction ? 1 : 0
  });
  return formatter.format(num);
}

async function renderPdf(html, outputPath, showBrowser) {
  const browser = await puppeteer.launch({
    headless: showBrowser ? false : 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1440 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        bottom: '14mm',
        left: '12mm',
        right: '12mm'
      }
    });
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('[PDF] Blad generowania:', err.message);
  process.exitCode = 1;
});
