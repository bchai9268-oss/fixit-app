import RepairWizard from "./RepairWizard";

export default async function NewRepairPage({ searchParams }: { searchParams: Promise<{ device?: string }> }) {
  const { device = "phone" } = await searchParams;
  return <RepairWizard initialDevice={device} />;
}
