import RepairStatusClient from "./RepairStatusClient";

export default async function RepairStatusPage({ params }: { params: Promise<{ repairId: string }> }) {
  const { repairId } = await params;
  return <RepairStatusClient repairId={decodeURIComponent(repairId)} />;
}
