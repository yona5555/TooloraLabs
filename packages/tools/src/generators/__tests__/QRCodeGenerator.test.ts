import { describe, it, expect } from "vitest";
import { QRCodeGenerator } from "../QRCodeGenerator";
import type { QRCodeGeneratorInput } from "../QRCodeGenerator";

const tool = new QRCodeGenerator();
const ctx = { locale: "en-US" };

const BASE: QRCodeGeneratorInput = {
  contentType: "text",
  text: "",
  wifiSsid: "",
  wifiPassword: "",
  wifiEncryption: "WPA",
  wifiHidden: false,
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  contactOrg: "",
  emailAddress: "",
  emailSubject: "",
  emailBody: "",
  smsPhone: "",
  smsMessage: "",
  errorCorrectionLevel: "M",
  darkColor: "#000000",
  lightColor: "#ffffff",
};

describe("QRCodeGenerator", () => {
  it("generates an SVG QR code for a URL", async () => {
    const output = await tool.execute({ ...BASE, contentType: "url", text: "https://tooloralabs.com" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.svg).toContain("<svg");
    expect(output.data.svg).toContain("</svg>");
    expect(output.data.payload).toBe("https://tooloralabs.com");
  });

  it("returns a failure result for empty text", async () => {
    const output = await tool.execute({ ...BASE, contentType: "text", text: "   " }, ctx);
    expect(output.success).toBe(false);
    expect(output.data.svg).toBe("");
  });

  it("returns a failure result for content that is too long", async () => {
    const output = await tool.execute({ ...BASE, contentType: "text", text: "a".repeat(2001) }, ctx);
    expect(output.success).toBe(false);
  });

  it("builds a standard WIFI: payload", async () => {
    const output = await tool.execute(
      { ...BASE, contentType: "wifi", wifiSsid: "My Network", wifiPassword: "s3cr3t", wifiEncryption: "WPA" },
      ctx
    );
    expect(output.data.payload).toBe("WIFI:T:WPA;S:My Network;P:s3cr3t;H:false;;");
  });

  it("escapes special characters in the WIFI: payload", async () => {
    const output = await tool.execute(
      { ...BASE, contentType: "wifi", wifiSsid: "Ann;e's Wifi", wifiPassword: "a:b,c", wifiEncryption: "WPA" },
      ctx
    );
    expect(output.data.payload).toBe("WIFI:T:WPA;S:Ann\\;e's Wifi;P:a\\:b\\,c;H:false;;");
  });

  it("omits the password field for an open (nopass) Wi-Fi network", async () => {
    const output = await tool.execute(
      { ...BASE, contentType: "wifi", wifiSsid: "Open Network", wifiEncryption: "nopass" },
      ctx
    );
    expect(output.data.payload).toBe("WIFI:T:nopass;S:Open Network;H:false;;");
  });

  it("builds a vCard payload for a contact", async () => {
    const output = await tool.execute(
      { ...BASE, contentType: "contact", contactName: "Jane Doe", contactPhone: "+1234567890", contactEmail: "jane@example.com" },
      ctx
    );
    expect(output.data.payload).toBe(
      "BEGIN:VCARD\nVERSION:3.0\nFN:Jane Doe\nTEL:+1234567890\nEMAIL:jane@example.com\nEND:VCARD"
    );
  });

  it("builds a mailto: payload with subject and body", async () => {
    const output = await tool.execute(
      { ...BASE, contentType: "email", emailAddress: "hi@example.com", emailSubject: "Hello", emailBody: "World" },
      ctx
    );
    expect(output.data.payload).toBe("mailto:hi@example.com?subject=Hello&body=World");
  });

  it("builds an SMSTO: payload", async () => {
    const output = await tool.execute(
      { ...BASE, contentType: "sms", smsPhone: "+1234567890", smsMessage: "Hi there" },
      ctx
    );
    expect(output.data.payload).toBe("SMSTO:+1234567890:Hi there");
  });

  it("applies a custom error correction level and colors", async () => {
    const output = await tool.execute(
      { ...BASE, contentType: "text", text: "hello", errorCorrectionLevel: "H", darkColor: "#123456", lightColor: "#abcdef" },
      ctx
    );
    expect(output.success).toBe(true);
    expect(output.data.svg.toLowerCase()).toContain("#123456");
  });
});
