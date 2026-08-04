import { drawGaugeCanvas, type GaugeSpec } from "./gauge";

export type PdfRow = { label: string; value: string };

export type GenerateToolPdfOptions = {
  locale: string;
  toolName: string;
  inputs: PdfRow[];
  results: PdfRow[];
  gauge?: GaugeSpec;
  filename: string;
};

const BRAND = {
  siteUrl: "tooloralabs.com",
  email: "info@tooloralabs.com",
};

const COPY = {
  en: {
    generatedOn: "Generated on",
    inputsTitle: "Your Inputs",
    resultsTitle: "Results",
    field: "Field",
    value: "Value",
    footer: `© ${new Date().getFullYear()} TooloraLabs. All rights reserved.`,
  },
  ar: {
    generatedOn: "تاريخ الإنشاء",
    inputsTitle: "بياناتك المدخلة",
    resultsTitle: "النتائج",
    field: "الحقل",
    value: "القيمة",
    footer: `© ${new Date().getFullYear()} TooloraLabs. جميع الحقوق محفوظة`,
  },
};

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function buildSectionTitle(text: string): HTMLElement {
  const el = document.createElement("h2");
  el.textContent = text;
  el.style.cssText = "font-size:14px; font-weight:700; color:#2563eb; margin:22px 0 8px 0;";
  return el;
}

function buildTable(rows: PdfRow[], copy: { field: string; value: string }): HTMLTableElement {
  const table = document.createElement("table");
  table.style.cssText = "width:100%; border-collapse:collapse; font-size:13px;";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th style="text-align:start; padding:8px 12px; background:#eff6ff; border:1px solid #dbeafe; font-weight:600; color:#1e3a8a;">${escapeHtml(copy.field)}</th>
      <th style="text-align:start; padding:8px 12px; background:#eff6ff; border:1px solid #dbeafe; font-weight:600; color:#1e3a8a;">${escapeHtml(copy.value)}</th>
    </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.style.background = i % 2 === 0 ? "#ffffff" : "#fafafa";
    tr.innerHTML = `
      <td style="padding:8px 12px; border:1px solid #e4e4e7; color:#3f3f46;">${escapeHtml(row.label)}</td>
      <td style="padding:8px 12px; border:1px solid #e4e4e7; font-weight:600; color:#18181b;">${escapeHtml(row.value)}</td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table;
}

/**
 * Builds a branded, tabular one-page(+) summary as a hidden real DOM node,
 * rasterizes it with html2canvas, and assembles a multi-page PDF with jsPDF.
 *
 * Deliberately not done with jsPDF's own text/table APIs: jsPDF has no
 * Arabic shaping (each letter renders in its isolated form, unreadable to
 * an Arabic reader) even with a custom font loaded. Rendering real HTML in
 * the actual browser first means the browser's own text engine — already
 * loaded with the site's Arabic font — does correct shaping/bidi, and
 * html2canvas just screenshots the already-correct result.
 */
export async function generateToolPdf(options: GenerateToolPdfOptions): Promise<void> {
  const { locale, toolName, inputs, results, gauge, filename } = options;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const copy = locale === "ar" ? COPY.ar : COPY.en;

  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro"),
  ]);

  const localeRoot = document.querySelector("[lang]") as HTMLElement | null;
  const fontFamily = localeRoot ? getComputedStyle(localeRoot).fontFamily : "Arial, sans-serif";

  const container = document.createElement("div");
  container.dir = dir;
  container.lang = locale;
  container.style.cssText = `
    position: fixed; top: 0; left: -10000px; width: 800px;
    background: #ffffff; color: #18181b; font-family: ${fontFamily};
    padding: 40px; box-sizing: border-box;
  `;

  const header = document.createElement("div");
  header.style.cssText =
    "display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #2563eb; padding-bottom:16px; margin-bottom:24px;";
  header.innerHTML = `
    <div>
      <div style="font-size:22px; font-weight:700;">
        <span style="color:#18181b;">Toolora</span><span style="color:#2563eb;">Labs</span>
      </div>
      <div style="font-size:12px; color:#71717a; margin-top:4px;">${BRAND.siteUrl} · ${BRAND.email}</div>
    </div>
    <div style="font-size:12px; color:#71717a; text-align:${dir === "rtl" ? "left" : "right"};">
      ${escapeHtml(copy.generatedOn)}<br/>
      <span style="font-weight:600; color:#18181b;">${escapeHtml(new Date().toLocaleString(locale === "ar" ? "ar" : "en-US"))}</span>
    </div>
  `;
  container.appendChild(header);

  const title = document.createElement("h1");
  title.textContent = toolName;
  title.style.cssText = "font-size:22px; font-weight:700; margin:0 0 8px 0; color:#18181b;";
  container.appendChild(title);

  if (inputs.length > 0) {
    container.appendChild(buildSectionTitle(copy.inputsTitle));
    container.appendChild(buildTable(inputs, copy));
  }

  if (results.length > 0) {
    container.appendChild(buildSectionTitle(copy.resultsTitle));
    container.appendChild(buildTable(results, copy));
  }

  if (gauge) {
    const gaugeWrap = document.createElement("div");
    gaugeWrap.style.cssText = "margin:24px 0 0 0; display:flex; justify-content:center;";
    gaugeWrap.appendChild(drawGaugeCanvas(gauge, 640));
    container.appendChild(gaugeWrap);
  }

  const footer = document.createElement("div");
  footer.style.cssText =
    "margin-top:32px; padding-top:16px; border-top:1px solid #e4e4e7; font-size:11px; color:#a1a1aa; text-align:center;";
  footer.textContent = copy.footer;
  container.appendChild(footer);

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });

    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidthMM = pdf.internal.pageSize.getWidth();
    const pageHeightMM = pdf.internal.pageSize.getHeight();
    const pxPerMM = canvas.width / pageWidthMM;
    const pageHeightPx = Math.floor(pageHeightMM * pxPerMM);

    let renderedHeight = 0;
    let firstPage = true;
    while (renderedHeight < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext("2d");
      ctx?.drawImage(canvas, 0, renderedHeight, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      if (!firstPage) pdf.addPage();
      pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pageWidthMM, sliceHeight / pxPerMM);

      renderedHeight += sliceHeight;
      firstPage = false;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
