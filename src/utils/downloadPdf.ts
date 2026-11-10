/**
 * Triggers a real browser download using Blob URL to ensure modern browsers
 * (Chrome, Safari, Firefox, Edge) actually save the PDF file to the user's
 * Downloads folder instead of just previewing/navigating to it in a tab.
 */
export const downloadPdfFile = async (
  filename = 'Laporan_Konsultasi_Checkpoint_1_Garuda_Mahawira_Sena.pdf'
): Promise<void> => {
  try {
    const rawBase = import.meta.env.BASE_URL || './';
    const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
    const targetUrl = `${baseUrl}${filename}`;

    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF (${response.status} ${response.statusText})`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = blobUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(anchor);
    }, 500);
  } catch (error) {
    console.error('Blob PDF download failed, falling back to direct anchor:', error);
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = `./${filename}`;
    anchor.download = filename;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
};
