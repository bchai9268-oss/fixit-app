import { getPaymentConfig } from "../payment-config";
import { getRepair, type RepairJob } from "../repairs";
import PaymentClient, { type PaymentRepair } from "./PaymentClient";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ repairId?: string }> }) {
  const { repairId = "" } = await searchParams;
  let repair: RepairJob | null = null;
  if (repairId) {
    try { repair = await getRepair(repairId); } catch (error) { console.error("Unable to load payment repair", error); }
  }
  const paymentRepair: PaymentRepair | null = repair ? { id: repair.id, deviceType: repair.deviceType, deviceModel: repair.deviceModel, symptoms: repair.symptoms, finalPrice: repair.finalPrice, paymentStatus: repair.paymentStatus } : null;
  return <PaymentClient repair={paymentRepair} requestedRepairId={repairId} config={getPaymentConfig()} />;
}
