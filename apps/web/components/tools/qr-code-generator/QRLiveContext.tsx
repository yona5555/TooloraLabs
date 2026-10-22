"use client";
import { useMemo } from "react";
import { analyzeQR, buildQRPayload, type QRAnalysis, type QRErrorCorrectionLevel } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import type { QRFormState } from "./QRInputPanel";

export type QRDraft = QRFormState & { errorCorrectionLevel: QRErrorCorrectionLevel; darkColor: string; lightColor: string };

export const { LiveProvider: QRLiveProvider, useLiveState: useQRLive } = createLiveToolState<QRDraft>();

export type QRModel = {
  draft: QRDraft;
  payload: string;
  /** null when there is nothing to encode or the payload exceeds the generator's limit. */
  a: QRAnalysis | null;
  f: (v: number, max?: number) => string;
  pct: (part: number, whole: number) => string;
};

const nf = (v: number, max = 2) => v.toLocaleString("en-US", { maximumFractionDigits: max });

export function buildQRModel(d: QRDraft): QRModel {
  const payload = buildQRPayload(d);
  let a: QRAnalysis | null = null;
  if (payload.trim() && payload.length <= 2000) {
    try {
      a = analyzeQR(payload, d.errorCorrectionLevel);
    } catch {
      a = null;
    }
  }
  return { draft: d, payload, a, f: nf, pct: (p, w) => `${nf(w ? (p / w) * 100 : 0, 1)}%` };
}

export function useQRModel(): QRModel {
  const { dims } = useQRLive();
  return useMemo(() => buildQRModel(dims), [dims]);
}

export const REGION_FILL = {
  finder: "fill-blue-600 dark:fill-blue-400",
  timing: "fill-amber-500 dark:fill-amber-400",
  alignment: "fill-violet-500 dark:fill-violet-400",
  format: "fill-rose-500 dark:fill-rose-400",
  version: "fill-emerald-600 dark:fill-emerald-400",
  data: "fill-zinc-800 dark:fill-zinc-200",
} as const;

/** Real example payloads: a URL, Wi-Fi join, vCard, mailto and SMS, each in the exact format phones parse. */
export const QR_EXAMPLES: { id: string; patch: Partial<QRFormState> }[] = [
  { id: "url", patch: { contentType: "url", text: "https://tooloralabs.com" } },
  { id: "wifi", patch: { contentType: "wifi", wifiSsid: "Cafe-Guest", wifiPassword: "espresso2026", wifiEncryption: "WPA", wifiHidden: false } },
  { id: "contact", patch: { contentType: "contact", contactName: "Layla Haddad", contactPhone: "+962 6 555 0142", contactEmail: "layla@example.com", contactOrg: "Toolora Labs" } },
  { id: "email", patch: { contentType: "email", emailAddress: "hello@example.com", emailSubject: "Order 1042", emailBody: "Hi, I have a question about my order." } },
  { id: "long", patch: { contentType: "text", text: "QR codes were invented in 1994 by Masahiro Hara at Denso Wave to track automotive parts; ISO/IEC 18004 standardises them today." } },
];
