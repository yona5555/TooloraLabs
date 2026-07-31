import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";
import QRCode from "qrcode";

export type QRCodeGeneratorInput = {
  text: string;
};

export type QRCodeGeneratorOutput = {
  svg: string;
};

export class QRCodeGenerator extends BaseTool<
  QRCodeGeneratorInput,
  QRCodeGeneratorOutput
> {
  metadata = {
    id: "qr-code-generator",
    slug: "qr-code-generator",
    name: "QR Code Generator",
    category: "ai-tools",
    description: "Generate QR codes instantly.",
    version: "1.0.0",
  };

  async execute(
    input: QRCodeGeneratorInput,
    _context: ToolContext
  ): Promise<ToolResult<QRCodeGeneratorOutput>> {
    const text = input.text.trim();
    if (!text) {
      return {
        success: false,
        data: { svg: "" },
        metadata: { error: "Text is required" },
      };
    }
    if (text.length > 2000) {
      return {
        success: false,
        data: { svg: "" },
        metadata: { error: "Text is too long" },
      };
    }

    try {
      const svg = await QRCode.toString(text, { type: "svg", margin: 1 });
      return { success: true, data: { svg }, metadata: {} };
    } catch (error) {
      return {
        success: false,
        data: { svg: "" },
        metadata: {
          error: error instanceof Error ? error.message : "Failed to generate QR code",
        },
      };
    }
  }
}
