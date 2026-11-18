import { CurrencyCard } from "./currency-card";
import { PlatformForm } from "./platform-form";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <CurrencyCard />
      <PlatformForm />
    </div>
  );
}
