import { getAllSystemSettings } from "@/lib/actions/settings";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getAllSystemSettings();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <SettingsForm initialSettings={settings} />
    </div>
  );
} 