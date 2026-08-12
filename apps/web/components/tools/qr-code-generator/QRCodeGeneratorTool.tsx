"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { QRCodeGenerator, type QRErrorCorrectionLevel } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import QRInputPanel, { type QRFormState } from "./QRInputPanel";
import QRResult from "./QRResult";
import QRCustomizePanel from "./QRCustomizePanel";

const tool = new QRCodeGenerator();

const INITIAL_FORM: QRFormState = {
  contentType: "url",
  text: "https://tooloralabs.com",
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
};

export default function QRCodeGeneratorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.qr-code-generator");
  const tNav = useTranslations("tools.qr-code-generator.nav");

  const [form, setForm] = useState<QRFormState>(INITIAL_FORM);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<QRErrorCorrectionLevel>("M");
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");

  const [svg, setSvg] = useState("");
  const [payload, setPayload] = useState("");
  const [hasError, setHasError] = useState(false);
  const requestId = useRef(0);

  function patchForm(patch: Partial<QRFormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  useEffect(() => {
    const id = ++requestId.current;

    tool
      .execute({ ...form, errorCorrectionLevel, darkColor, lightColor }, { locale: "en-US" })
      .then((output) => {
        if (id !== requestId.current) return;
        if (!output.success) {
          setSvg("");
          setPayload("");
          setHasError(true);
          return;
        }
        setSvg(output.data.svg);
        setPayload(output.data.payload);
        setHasError(false);
      });
  }, [form, errorCorrectionLevel, darkColor, lightColor]);

  const error = hasError ? t("errors.required") : "";

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<QRInputPanel form={form} onChange={patchForm} />}
          result={<QRResult svg={svg} payload={payload} error={error} />}
          sidebar={<RelatedToolsSidebar currentSlug="qr-code-generator" category="ai-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <QRCustomizePanel
                errorCorrectionLevel={errorCorrectionLevel}
                onErrorCorrectionLevelChange={setErrorCorrectionLevel}
                darkColor={darkColor}
                onDarkColorChange={setDarkColor}
                lightColor={lightColor}
                onLightColorChange={setLightColor}
              />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
