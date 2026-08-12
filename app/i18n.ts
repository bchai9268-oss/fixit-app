export type Language = "th" | "en";

export const LANGUAGE_STORAGE_KEY = "fixit-language";

export const commonText = {
  th: { languageButton: "EN", languageLabel: "เปลี่ยนภาษาเป็นอังกฤษ", backHome: "กลับหน้าหลัก", loading: "กำลังโหลด..." },
  en: { languageButton: "TH", languageLabel: "Switch language to Thai", backHome: "Back to home", loading: "Loading..." },
} as const;

