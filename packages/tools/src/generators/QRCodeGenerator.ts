import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";
import QRCode from "qrcode";

export type QRContentType = "url" | "text" | "wifi" | "contact" | "email" | "sms";
export type QRWifiEncryption = "WPA" | "WEP" | "nopass";
export type QRErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type QRCodeGeneratorInput = {
  contentType: QRContentType;
  /** Used directly for "url" and "text". */
  text: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiEncryption: QRWifiEncryption;
  wifiHidden: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactOrg: string;
  emailAddress: string;
  emailSubject: string;
  emailBody: string;
  smsPhone: string;
  smsMessage: string;
  errorCorrectionLevel: QRErrorCorrectionLevel;
  /** Hex color, e.g. "#000000". */
  darkColor: string;
  /** Hex color, e.g. "#ffffff". */
  lightColor: string;
};

export type QRCodeGeneratorOutput = {
  svg: string;
  /** The raw string actually encoded into the QR symbol — useful to show what will be scanned. */
  payload: string;
};

const MAX_LENGTH = 2000;

/** Escapes the four characters the WIFI: and vCard mini-languages treat as delimiters. */
function escapeQrField(value: string): string {
  return value.replace(/([\\;,:])/g, "\\$1");
}

function buildPayload(input: QRCodeGeneratorInput): string {
  switch (input.contentType) {
    case "url":
    case "text":
      return input.text.trim();

    case "wifi": {
      const auth = input.wifiEncryption === "nopass" ? "nopass" : input.wifiEncryption;
      const password = input.wifiEncryption === "nopass" ? "" : `P:${escapeQrField(input.wifiPassword)};`;
      return `WIFI:T:${auth};S:${escapeQrField(input.wifiSsid)};${password}H:${input.wifiHidden ? "true" : "false"};;`;
    }

    case "contact": {
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${input.contactName.trim()}`,
        input.contactPhone.trim() ? `TEL:${input.contactPhone.trim()}` : "",
        input.contactEmail.trim() ? `EMAIL:${input.contactEmail.trim()}` : "",
        input.contactOrg.trim() ? `ORG:${input.contactOrg.trim()}` : "",
        "END:VCARD",
      ];
      return lines.filter(Boolean).join("\n");
    }

    case "email": {
      const params = new URLSearchParams();
      if (input.emailSubject.trim()) params.set("subject", input.emailSubject.trim());
      if (input.emailBody.trim()) params.set("body", input.emailBody.trim());
      const query = params.toString();
      return `mailto:${input.emailAddress.trim()}${query ? `?${query}` : ""}`;
    }

    case "sms":
      return `SMSTO:${input.smsPhone.trim()}:${input.smsMessage.trim()}`;
  }
}

export class QRCodeGenerator extends BaseTool<QRCodeGeneratorInput, QRCodeGeneratorOutput> {
  metadata = {
    id: "qr-code-generator",
    slug: "qr-code-generator",
    name: "QR Code Generator",
    category: "ai-tools",
    description: "Generate QR codes for URLs, text, Wi-Fi networks, contact cards, email, and SMS.",
    version: "2.0.0",
  };

  async execute(input: QRCodeGeneratorInput, _context: ToolContext): Promise<ToolResult<QRCodeGeneratorOutput>> {
    const payload = buildPayload(input);

    if (!payload || !payload.trim()) {
      return {
        success: false,
        data: { svg: "", payload: "" },
        metadata: { error: "No content to encode" },
      };
    }
    if (payload.length > MAX_LENGTH) {
      return {
        success: false,
        data: { svg: "", payload: "" },
        metadata: { error: "Content is too long" },
      };
    }

    try {
      const svg = await QRCode.toString(payload, {
        type: "svg",
        margin: 1,
        errorCorrectionLevel: input.errorCorrectionLevel || "M",
        color: {
          dark: input.darkColor || "#000000",
          light: input.lightColor || "#ffffff",
        },
      });
      return { success: true, data: { svg, payload }, metadata: {} };
    } catch (error) {
      return {
        success: false,
        data: { svg: "", payload: "" },
        metadata: {
          error: error instanceof Error ? error.message : "Failed to generate QR code",
        },
      };
    }
  }
}
