// Perceptual average-hash (aHash) for image similarity — client-side, no external API/lib.
// Dùng cho "Tìm ảnh": băm ảnh tải lên + ảnh sản phẩm rồi so khoảng cách Hamming.

export function aHashFromImage(img: HTMLImageElement): string | null {
  try {
    const N = 8;
    const c = document.createElement("canvas");
    c.width = N; c.height = N;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, N, N);
    const data = ctx.getImageData(0, 0, N, N).data;
    const gray: number[] = [];
    for (let i = 0; i < data.length; i += 4) gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    const avg = gray.reduce((a, b) => a + b, 0) / gray.length;
    let bits = "";
    for (const g of gray) bits += g >= avg ? "1" : "0";
    let hex = "";
    for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
    return hex; // 16 hex chars = 64 bits
  } catch { return null; }
}

export function aHashFromSrc(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(aHashFromImage(img));
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function hamming(a: string, b: string): number {
  if (!a || !b || a.length !== b.length) return 64;
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) { d += x & 1; x >>= 1; }
  }
  return d;
}
