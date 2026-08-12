"use client";
import { useTranslations } from "next-intl";
import type { QRContentType, QRWifiEncryption } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

const CONTENT_TYPES: QRContentType[] = ["url", "text", "wifi", "contact", "email", "sms"];
const WIFI_ENCRYPTIONS: QRWifiEncryption[] = ["WPA", "WEP", "nopass"];

export type QRFormState = {
  contentType: QRContentType;
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
};

type QRInputPanelProps = {
  form: QRFormState;
  onChange: (patch: Partial<QRFormState>) => void;
};

const selectClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export default function QRInputPanel({ form, onChange }: QRInputPanelProps) {
  const t = useTranslations("tools.qr-code-generator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="flex flex-wrap gap-2">
        {CONTENT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ contentType: type })}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              form.contentType === type
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {t(`contentTypes.${type}`)}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {(form.contentType === "url" || form.contentType === "text") && (
          <label className="block space-y-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {form.contentType === "url" ? t("urlLabel") : t("textLabel")}
            </span>
            <textarea
              value={form.text}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder={form.contentType === "url" ? t("urlPlaceholder") : t("textPlaceholder")}
              rows={3}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            />
          </label>
        )}

        {form.contentType === "wifi" && (
          <>
            <ToolInput label={t("wifiSsidLabel")} value={form.wifiSsid} onChange={(e) => onChange({ wifiSsid: e.target.value })} />
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("wifiEncryptionLabel")}</span>
              <select
                value={form.wifiEncryption}
                onChange={(e) => onChange({ wifiEncryption: e.target.value as QRWifiEncryption })}
                className={selectClass}
              >
                {WIFI_ENCRYPTIONS.map((enc) => (
                  <option key={enc} value={enc}>
                    {t(`wifiEncryptions.${enc}`)}
                  </option>
                ))}
              </select>
            </label>
            {form.wifiEncryption !== "nopass" && (
              <ToolInput
                label={t("wifiPasswordLabel")}
                value={form.wifiPassword}
                onChange={(e) => onChange({ wifiPassword: e.target.value })}
              />
            )}
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={form.wifiHidden}
                onChange={(e) => onChange({ wifiHidden: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
              />
              {t("wifiHiddenLabel")}
            </label>
          </>
        )}

        {form.contentType === "contact" && (
          <>
            <ToolInput label={t("contactNameLabel")} value={form.contactName} onChange={(e) => onChange({ contactName: e.target.value })} />
            <ToolInput label={t("contactPhoneLabel")} value={form.contactPhone} onChange={(e) => onChange({ contactPhone: e.target.value })} />
            <ToolInput label={t("contactEmailLabel")} value={form.contactEmail} onChange={(e) => onChange({ contactEmail: e.target.value })} />
            <ToolInput label={t("contactOrgLabel")} value={form.contactOrg} onChange={(e) => onChange({ contactOrg: e.target.value })} />
          </>
        )}

        {form.contentType === "email" && (
          <>
            <ToolInput label={t("emailAddressLabel")} value={form.emailAddress} onChange={(e) => onChange({ emailAddress: e.target.value })} />
            <ToolInput label={t("emailSubjectLabel")} value={form.emailSubject} onChange={(e) => onChange({ emailSubject: e.target.value })} />
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("emailBodyLabel")}</span>
              <textarea
                value={form.emailBody}
                onChange={(e) => onChange({ emailBody: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
              />
            </label>
          </>
        )}

        {form.contentType === "sms" && (
          <>
            <ToolInput label={t("smsPhoneLabel")} value={form.smsPhone} onChange={(e) => onChange({ smsPhone: e.target.value })} />
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("smsMessageLabel")}</span>
              <textarea
                value={form.smsMessage}
                onChange={(e) => onChange({ smsMessage: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
              />
            </label>
          </>
        )}
      </div>
    </SectionCard>
  );
}
