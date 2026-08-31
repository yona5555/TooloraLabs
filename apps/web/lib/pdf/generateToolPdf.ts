import { drawGaugeCanvas, type GaugeSpec } from "./gauge";

export type PdfRow = { label: string; value: string };

export type PdfTable = { title: string; columns: string[]; rows: string[][] };

export type GenerateToolPdfOptions = {
  locale: string;
  toolName: string;
  inputs: PdfRow[];
  results: PdfRow[];
  gauge?: GaugeSpec;
  /** Optional wide multi-column table (e.g. a full year-by-year schedule) rendered after results. Paginated row-aware: a row is never split across two pages, and its header repeats on every page it continues onto. */
  table?: PdfTable;
  /** Optional "prepared for" rows (already-translated label/value pairs) — callers filter out empty fields themselves. Rendered near the top, right after the title, only when non-empty. */
  preparedFor?: PdfRow[];
  /** Section title for `preparedFor`; ignored if `preparedFor` is empty. */
  preparedForTitle?: string;
  /**
   * Opt-in trial branding: moves the site URL and email out of the header and into a
   * small line in the footer instead of appearing in both places. Defaults to false so
   * existing callers' PDF output (URL/email in the header) is unchanged.
   */
  brandingEnhancements?: boolean;
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
    preparedForTitle: "Prepared For",
    field: "Field",
    value: "Value",
    footer: `© ${new Date().getFullYear()} TooloraLabs. All rights reserved.`,
  },
  ar: {
    generatedOn: "تاريخ الإنشاء",
    preparedForTitle: "معدّ لـ",
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

/** Marks the wide schedule table so it can be found again post-insertion for row-aware pagination measurements. */
const SCHEDULE_TABLE_SELECTOR = '[data-schedule-table="true"]';

function buildWideTable(spec: PdfTable): HTMLTableElement {
  const table = document.createElement("table");
  table.setAttribute("data-schedule-table", "true");
  table.style.cssText = "width:100%; border-collapse:collapse; font-size:11px;";

  const thead = document.createElement("thead");
  const headerCells = spec.columns
    .map(
      (col) =>
        `<th style="text-align:start; padding:6px 8px; background:#eff6ff; border:1px solid #dbeafe; font-weight:600; color:#1e3a8a;">${escapeHtml(col)}</th>`
    )
    .join("");
  thead.innerHTML = `<tr>${headerCells}</tr>`;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  spec.rows.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.style.background = i % 2 === 0 ? "#ffffff" : "#fafafa";
    tr.innerHTML = row
      .map(
        (cell) =>
          `<td style="padding:6px 8px; border:1px solid #e4e4e7; color:#3f3f46;">${escapeHtml(cell)}</td>`
      )
      .join("");
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
 *
 * The main content strip is rasterized once and then sliced into per-page
 * images. Naive fixed-height slicing would cut a schedule-table row in half
 * whenever a page boundary happened to fall mid-row, so when `table` is
 * supplied, each schedule-table row's real on-screen boundary (measured via
 * `getBoundingClientRect`, before rasterizing) is recorded, and every slice
 * boundary that would fall inside the table's row region snaps down to the
 * nearest row boundary instead. The table's `<thead>` is rasterized
 * separately once and redrawn at the top of every subsequent page the table
 * continues onto, so column headers stay visible without re-measuring text.
 *
 * The footer is rasterized separately too, from a detached element never
 * appended into the main content flow, and is redrawn fixed to the bottom of
 * every page in the pagination loop below — its height is reserved out of
 * every page's usable content area up front, so it never overlaps real
 * content and never merely appears once whenever the content canvas happens
 * to end.
 */
export async function generateToolPdf(options: GenerateToolPdfOptions): Promise<void> {
  const { locale, toolName, inputs, results, gauge, table, preparedFor, preparedForTitle, brandingEnhancements, filename } =
    options;
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
      ${brandingEnhancements ? "" : `<div style="font-size:12px; color:#71717a; margin-top:4px;">${BRAND.siteUrl} · ${BRAND.email}</div>`}
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

  if (preparedFor && preparedFor.length > 0) {
    container.appendChild(buildSectionTitle(preparedForTitle ?? copy.preparedForTitle));
    container.appendChild(buildTable(preparedFor, copy));
  }

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

  if (table && table.rows.length > 0) {
    container.appendChild(buildSectionTitle(table.title));
    container.appendChild(buildWideTable(table));
  }

  // Rendered as a separate off-screen element (not appended into `container`'s scrollable
  // content) and rasterized on its own, so it can be redrawn fixed to the bottom of *every*
  // page below — rather than appearing once, inline, wherever the content canvas happened to
  // end (which left every page but the last with no footer at all, and stranded it mid-page
  // with blank space beneath it whenever content ended short of a full page).
  const footerWrap = document.createElement("div");
  footerWrap.dir = dir;
  footerWrap.lang = locale;
  footerWrap.style.cssText = `
    position: fixed; top: 0; left: -10000px; width: 800px;
    background: #ffffff; color: #18181b; font-family: ${fontFamily};
    padding: 0 40px; box-sizing: border-box;
  `;
  const footer = document.createElement("div");
  footer.style.cssText = "padding:16px 0; border-top:1px solid #e4e4e7; text-align:center;";
  footer.innerHTML = brandingEnhancements
    ? `
      <div style="font-size:8px; color:#a1a1aa;">${escapeHtml(BRAND.siteUrl)} &middot; ${escapeHtml(BRAND.email)}</div>
      <div style="font-size:11px; color:#a1a1aa; margin-top:4px;">${escapeHtml(copy.footer)}</div>
    `
    : escapeHtml(copy.footer);
  footerWrap.appendChild(footer);

  document.body.appendChild(container);
  document.body.appendChild(footerWrap);

  try {
    const scale = 2;

    // Measure the schedule table's row boundaries and header height in the live DOM,
    // in canvas-pixel space, before rasterizing — html2canvas's own coordinate system
    // matches getBoundingClientRect() scaled by the same `scale` factor.
    let scheduleHeaderCanvas: HTMLCanvasElement | null = null;
    let scheduleHeaderHeightPx = 0;
    let scheduleHeaderLeftPx = 0;
    let scheduleHeaderWidthPx = 0;
    let scheduleTableTopPx = 0;
    let scheduleTableBottomPx = 0;
    let scheduleRowBottomsPx: number[] = [];

    const scheduleTableEl = container.querySelector<HTMLTableElement>(SCHEDULE_TABLE_SELECTOR);
    if (scheduleTableEl) {
      const containerRect = container.getBoundingClientRect();
      const theadEl = scheduleTableEl.querySelector("thead") as HTMLElement;
      const theadRect = theadEl.getBoundingClientRect();
      scheduleTableTopPx = (theadRect.top - containerRect.top) * scale;
      scheduleHeaderHeightPx = theadRect.height * scale;
      // The header snapshot is captured from just the <thead> (narrower than the full
      // padded container), so its placement must be offset/sized to that same region —
      // otherwise it would stretch across the full page width and misalign with the
      // row columns below it.
      scheduleHeaderLeftPx = (theadRect.left - containerRect.left) * scale;
      scheduleHeaderWidthPx = theadRect.width * scale;

      const bodyRows = Array.from(scheduleTableEl.querySelectorAll("tbody tr"));
      scheduleRowBottomsPx = bodyRows.map((tr) => (tr.getBoundingClientRect().bottom - containerRect.top) * scale);
      scheduleTableBottomPx = scheduleRowBottomsPx[scheduleRowBottomsPx.length - 1] ?? scheduleTableTopPx;

      scheduleHeaderCanvas = await html2canvas(theadEl, { scale, backgroundColor: "#ffffff" });
    }

    const canvas = await html2canvas(container, { scale, backgroundColor: "#ffffff" });
    const footerCanvas = await html2canvas(footerWrap, { scale, backgroundColor: "#ffffff" });

    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidthMM = pdf.internal.pageSize.getWidth();
    const pageHeightMM = pdf.internal.pageSize.getHeight();
    const pxPerMM = canvas.width / pageWidthMM;
    const pageHeightPx = Math.floor(pageHeightMM * pxPerMM);
    // footerCanvas shares the same 800px width basis and `scale` as the main content canvas
    // (footerWrap mirrors container's outer width exactly), so its pixel height is already in
    // the same coordinate space as pageHeightPx/pxPerMM — no separate unit conversion needed.
    const footerHeightPx = footerCanvas.height;
    const footerHeightMM = footerHeightPx / pxPerMM;
    const usablePageHeightPx = pageHeightPx - footerHeightPx;

    let renderedHeight = 0;
    let firstPage = true;
    while (renderedHeight < canvas.height) {
      // The table's own header is already visible in-place the first time this page's
      // range crosses it; only repeat it on later pages that continue mid-table.
      const repeatsHeader =
        !firstPage &&
        scheduleHeaderCanvas !== null &&
        renderedHeight >= scheduleTableTopPx &&
        renderedHeight < scheduleTableBottomPx;
      const headerOverlayPx = repeatsHeader ? scheduleHeaderHeightPx : 0;

      const availablePagePx = usablePageHeightPx - headerOverlayPx;
      const remainingContentPx = canvas.height - renderedHeight;
      let sliceHeight = Math.min(availablePagePx, remainingContentPx);

      // Only snap to a row boundary when the page height is actually the limiting
      // factor — i.e. pagination is genuinely forced here. If all remaining content
      // already fits within this page, leave it alone so nothing gets needlessly cut
      // off before the end.
      const wasPageLimited = availablePagePx < remainingContentPx;
      if (wasPageLimited) {
        const naiveEnd = renderedHeight + sliceHeight;
        const crossesTableRows = naiveEnd > scheduleTableTopPx && renderedHeight < scheduleTableBottomPx;
        if (crossesTableRows) {
          const fittingBoundaries = scheduleRowBottomsPx.filter((b) => b > renderedHeight && b <= naiveEnd);
          if (fittingBoundaries.length > 0) {
            sliceHeight = fittingBoundaries[fittingBoundaries.length - 1] - renderedHeight;
          } else {
            const nextBoundary = scheduleRowBottomsPx.find((b) => b > renderedHeight);
            if (nextBoundary !== undefined) sliceHeight = nextBoundary - renderedHeight;
          }
        }
      }

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext("2d");
      ctx?.drawImage(canvas, 0, renderedHeight, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      if (!firstPage) pdf.addPage();

      let yOffsetMM = 0;
      if (repeatsHeader && scheduleHeaderCanvas) {
        const headerHeightMM = headerOverlayPx / pxPerMM;
        const headerXmm = scheduleHeaderLeftPx / pxPerMM;
        const headerWidthMM = scheduleHeaderWidthPx / pxPerMM;
        pdf.addImage(scheduleHeaderCanvas.toDataURL("image/png"), "PNG", headerXmm, 0, headerWidthMM, headerHeightMM);
        yOffsetMM = headerHeightMM;
      }
      pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, yOffsetMM, pageWidthMM, sliceHeight / pxPerMM);

      // Drawn fixed to the bottom of every single page (not just the last one, and not
      // wherever the content canvas happened to end) — content height was already reserved
      // above via usablePageHeightPx, so this never overlaps real content.
      pdf.addImage(footerCanvas.toDataURL("image/png"), "PNG", 0, pageHeightMM - footerHeightMM, pageWidthMM, footerHeightMM);

      renderedHeight += sliceHeight;
      firstPage = false;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
    document.body.removeChild(footerWrap);
  }
}
