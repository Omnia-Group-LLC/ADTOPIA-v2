import QRCode from "qrcode";

export async function generateQRCode(data: string): Promise<string> {
  return await QRCode.toDataURL(data, { 
    errorCorrectionLevel: "M", 
    margin: 1, 
    scale: 6,
    color: {
      dark: '#1f2937', // dark gray for better contrast
      light: '#ffffff'
    }
  });
}

/**
 * Future: Swap to Nayuki's QR-Code-generator
 * 1) Add the UMD script to index.html (exposes 'qrcodegen')
 * 2) Replace generateQRCode() with:
 *    const segs = qrcodegen.QrSegment.makeSegments(data);
 *    const qr = qrcodegen.QrCode.encodeSegments(segs, qrcodegen.Ecc.MEDIUM);
 *    // draw to canvas and return canvas.toDataURL()
 */