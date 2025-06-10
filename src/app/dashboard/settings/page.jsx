import { getAllSystemSettings } from "@/lib/actions/settings";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const settings = await getAllSystemSettings();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <SettingsForm initialSettings={settings} />
    </div>
  );
} 