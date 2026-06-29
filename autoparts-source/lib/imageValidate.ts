// Validate ảnh upload toàn hệ thống: chỉ nhận đúng định dạng ảnh + giới hạn dung lượng.
export const IMG_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml";

const OK_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

/** Trả về chuỗi lỗi (tiếng Việt) nếu tệp KHÔNG hợp lệ, hoặc null nếu hợp lệ. */
export function validateImageFile(file: File | null | undefined, maxMB = 5): string | null {
  if (!file) return "Chưa chọn tệp ảnh.";
  const type = (file.type || "").toLowerCase();
  if (!type.startsWith("image/") || !OK_TYPES.includes(type)) {
    return "Tệp không phải ảnh hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP, GIF hoặc SVG.";
  }
  if (file.size > maxMB * 1024 * 1024) {
    return `Ảnh vượt quá ${maxMB}MB. Vui lòng chọn ảnh nhỏ hơn.`;
  }
  return null;
}

/** Báo lỗi qua toast toàn cục (dùng khi component không có hook toast riêng). */
export function imageError(msg: string) {
  try { window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: msg, type: "warning" } })); } catch {}
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });
}

/** Kiểm tra ảnh có chứa MÃ QR không (dùng BarcodeDetector của trình duyệt).
 *  true = có QR · false = KHÔNG có QR · null = trình duyệt không hỗ trợ (không kết luận được). */
export async function detectQrCode(dataUrl: string): Promise<boolean | null> {
  try {
    if (typeof window === "undefined") return null;
    const BD = (window as any).BarcodeDetector;
    if (!BD) return null;
    try {
      const formats = await BD.getSupportedFormats?.();
      if (Array.isArray(formats) && formats.length && !formats.includes("qr_code")) return null;
    } catch {}
    const img: HTMLImageElement | null = await new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = dataUrl; });
    if (!img) return null;
    const detector = new BD({ formats: ["qr_code"] });
    let target: any = img;
    try { target = await createImageBitmap(img); } catch {}
    const codes = await detector.detect(target);
    return Array.isArray(codes) && codes.length > 0;
  } catch { return null; }
}
