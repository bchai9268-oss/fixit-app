import { env } from "cloudflare:workers";

export type PaymentConfig = {
  configured: boolean;
  bankName: string;
  accountName: string;
  accountNumber: string;
  promptPayId: string;
};

function value(key: "PAYMENT_BANK_NAME" | "PAYMENT_ACCOUNT_NAME" | "PAYMENT_ACCOUNT_NUMBER" | "PAYMENT_PROMPTPAY_ID") {
  const current = env[key];
  return typeof current === "string" ? current.trim() : "";
}

export function getPaymentConfig(): PaymentConfig {
  const bankName = value("PAYMENT_BANK_NAME");
  const accountName = value("PAYMENT_ACCOUNT_NAME");
  const accountNumber = value("PAYMENT_ACCOUNT_NUMBER");
  const promptPayId = value("PAYMENT_PROMPTPAY_ID");
  return { configured: Boolean((bankName && accountName && accountNumber) || promptPayId), bankName, accountName, accountNumber, promptPayId };
}

