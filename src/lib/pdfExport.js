function escapePdfText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildPdfDocument(lines) {
  const maxLines = 46;
  const renderedLines = lines.slice(0, maxLines);
  const truncated = lines.length > maxLines;

  if (truncated) {
    renderedLines.push(`... ${lines.length - maxLines} more row(s) not shown`);
  }

  const contentLines = ['BT', '/F1 10 Tf', '40 770 Td', '12 TL'];
  renderedLines.forEach((line, idx) => {
    if (idx === 0) {
      contentLines.push(`(${escapePdfText(line)}) Tj`);
    } else {
      contentLines.push('T*');
      contentLines.push(`(${escapePdfText(line)}) Tj`);
    }
  });
  contentLines.push('ET');

  const contentStream = contentLines.join('\n');

  const objects = [];
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  objects.push('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >> endobj');
  objects.push(`4 0 obj << /Length ${contentStream.length} >> stream\n${contentStream}\nendstream endobj`);
  objects.push('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

export function exportRowsToPdf({ title, headers = [], rows = [], filename = 'export.pdf' }) {
  const normalizedFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
  const lines = [
    `${title || 'Export'} - ${new Date().toLocaleString()}`,
    '',
    headers.join(' | ')
  ];

  rows.forEach((row) => {
    const line = row.map((cell) => String(cell ?? '').replace(/\s+/g, ' ').trim()).join(' | ');
    lines.push(line.slice(0, 130));
  });

  const pdf = buildPdfDocument(lines);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = normalizedFilename;
  a.click();
  URL.revokeObjectURL(url);
}
