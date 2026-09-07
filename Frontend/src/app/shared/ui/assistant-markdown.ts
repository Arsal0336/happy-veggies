/**
 * Lightweight markdown → safe HTML for assistant replies.
 * Supports headings, paragraphs, lists (incl. •), tables, fenced/inline code, emphasis.
 */
export function renderAssistantMarkdown(source: string): string {
  const text = (source || '').replace(/\r\n/g, '\n').trim();
  if (!text) return '';

  const blocks: string[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';

    // Fenced code block
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const lang = fence[1] || '';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i] ?? '')) {
        codeLines.push(lines[i] ?? '');
        i++;
      }
      i++; // closing fence
      const code = escapeHtml(codeLines.join('\n'));
      const langAttr = lang ? ` data-lang="${escapeAttr(lang)}"` : '';
      blocks.push(`<pre class="md-pre"${langAttr}><code>${code}</code></pre>`);
      continue;
    }

    // Table (header + divider row)
    if (isTableRow(line) && i + 1 < lines.length && isTableDivider(lines[i + 1] ?? '')) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableRow(lines[i] ?? '')) {
        tableLines.push(lines[i] ?? '');
        i++;
      }
      blocks.push(renderTable(tableLines));
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1]!.length, 3);
      blocks.push(`<h${level} class="md-h${level}">${inline(heading[2]!)}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule (not a table divider)
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line) && !isTableDivider(line)) {
      blocks.push('<hr class="md-hr" />');
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i] ?? '')) {
        quote.push((lines[i] ?? '').replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(`<blockquote class="md-quote">${inline(quote.join(' '))}</blockquote>`);
      continue;
    }

    // Unordered list (- * + •)
    if (isUnorderedItem(line)) {
      const items: string[] = [];
      while (i < lines.length && isUnorderedItem(lines[i] ?? '')) {
        items.push(stripUnorderedMarker(lines[i] ?? ''));
        i++;
        // Allow a single blank line inside a list without breaking it
        while (i < lines.length && !(lines[i] ?? '').trim() && i + 1 < lines.length && isUnorderedItem(lines[i + 1] ?? '')) {
          i++;
        }
      }
      blocks.push(
        `<ul class="md-ul">${items.map((it) => `<li>${inline(it)}</li>`).join('')}</ul>`,
      );
      continue;
    }

    // Ordered list (1. 1) ۱. etc.)
    if (isOrderedItem(line)) {
      const items: string[] = [];
      while (i < lines.length && isOrderedItem(lines[i] ?? '')) {
        items.push(stripOrderedMarker(lines[i] ?? ''));
        i++;
        while (i < lines.length && !(lines[i] ?? '').trim() && i + 1 < lines.length && isOrderedItem(lines[i + 1] ?? '')) {
          i++;
        }
      }
      blocks.push(
        `<ol class="md-ol">${items.map((it) => `<li>${inline(it)}</li>`).join('')}</ol>`,
      );
      continue;
    }

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph (consume consecutive non-special lines)
    const para: string[] = [];
    while (i < lines.length) {
      const l = lines[i] ?? '';
      if (
        !l.trim() ||
        /^```/.test(l) ||
        /^(#{1,4})\s+/.test(l) ||
        /^>\s?/.test(l) ||
        isUnorderedItem(l) ||
        isOrderedItem(l) ||
        (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(l) && !isTableDivider(l)) ||
        (isTableRow(l) && i + 1 < lines.length && isTableDivider(lines[i + 1] ?? ''))
      ) {
        break;
      }
      para.push(l);
      i++;
    }
    blocks.push(`<p class="md-p">${inline(para.join(' '))}</p>`);
  }

  return blocks.join('');
}

export function looksRtl(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text || '');
}

function inline(text: string): string {
  let s = escapeHtml(text);
  // inline code first
  s = s.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');
  // bold
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  // italic
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/(^|[\s(])_([^_]+)_(?=[\s).,]|$)/g, '$1<em>$2</em>');
  // links [text](url) — only http(s)
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return s;
}

function renderTable(rows: string[]): string {
  if (rows.length < 2) return `<p class="md-p">${inline(rows.join(' '))}</p>`;
  const header = splitRow(rows[0]!);
  const bodyRows = rows.slice(2).map(splitRow);
  const colCount = Math.max(header.length, ...bodyRows.map((r) => r.length));
  const pad = (cells: string[]) => {
    const copy = [...cells];
    while (copy.length < colCount) copy.push('');
    return copy.slice(0, colCount);
  };
  const thead = `<thead><tr>${pad(header)
    .map((c) => `<th>${inline(c)}</th>`)
    .join('')}</tr></thead>`;
  const tbody = `<tbody>${bodyRows
    .map((r) => `<tr>${pad(r).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
    .join('')}</tbody>`;
  return `<div class="md-table-wrap"><table class="md-table">${thead}${tbody}</table></div>`;
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  if (!t.includes('|')) return false;
  // avoid treating bare ---|--- as a data row when alone (divider handles that)
  if (isTableDivider(t)) return true;
  return /^\s*\|?.+\|.+\|?\s*$/.test(line);
}

function isTableDivider(line: string): boolean {
  const t = line.trim();
  if (!t.includes('-')) return false;
  return /^\|?[\s:|-]+\|[\s:|-]+\|?$/.test(t) && /-+/.test(t);
}

function isUnorderedItem(line: string): boolean {
  return /^\s*([-*+]|•|●|◦)\s+/.test(line);
}

function stripUnorderedMarker(line: string): string {
  return line.replace(/^\s*([-*+]|•|●|◦)\s+/, '');
}

function isOrderedItem(line: string): boolean {
  // Latin digits, Eastern Arabic, and common "a)" style skipped — digits only
  return /^\s*(\d+|[\u06F0-\u06F9]+)[.)]\s+/.test(line);
}

function stripOrderedMarker(line: string): string {
  return line.replace(/^\s*(\d+|[\u06F0-\u06F9]+)[.)]\s+/, '');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}
