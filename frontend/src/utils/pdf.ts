import html2pdf from 'html2pdf.js';

export async function generatePdf(
  element: HTMLElement,
  filename: string = 'documento.pdf',
  options?: { margin?: number; scale?: number }
) {
  const opt: Record<string, unknown> = {
    margin: options?.margin ?? 10,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: options?.scale ?? 2,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff',
    },
    jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  return html2pdf().set(opt).from(element).save();
}
