/**
 * The built-in sample the converter runs on at page load: a real CC0 photograph (a macaw, rich in
 * fine feather detail and smooth background blur, so lossy compression shows honestly). Source,
 * author and licence: public/samples/CREDITS.md.
 */
export const SAMPLE_URL = "/samples/macaw.jpg";
export const SAMPLE_NAME = "sample-macaw.jpg";

export async function makeSampleImage(): Promise<File | null> {
  try {
    const res = await fetch(SAMPLE_URL);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new File([blob], SAMPLE_NAME, { type: blob.type || "image/jpeg" });
  } catch {
    return null;
  }
}
