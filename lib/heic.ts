export function isHeicFile(file: File) {
  return file.type === "image/heic" || file.type === "image/heif" || isHeicFileName(file.name);
}

// For files already sitting in storage (uploaded before conversion was
// added, or a failed conversion that fell back to the original) -- all we
// have there is the stored file name, not a File object to inspect.
export function isHeicFileName(name: string) {
  return /\.(heic|heif)$/i.test(name);
}

// Browsers can't render HEIC/HEIF (the default photo format on iPhones) in
// an <img> tag, so a photo uploaded straight from an iPhone camera roll
// shows as a broken thumbnail. Converting to JPEG client-side before upload
// means the stored file is always something every browser can display.
export async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const newName = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
