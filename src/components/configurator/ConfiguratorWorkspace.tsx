import type { FestivalConfig } from "../../types/festival";
import { StagesList } from "./tabs/StagesList";
import { ArtistsList } from "./tabs/ArtistsList";
import { VendorsList } from "./tabs/VendorsList";
import { SponsorsList } from "./tabs/SponsorsList.tsx";
import { ToiletsList } from "./tabs/ToiletsList";
import { SecurityList } from "./tabs/SecurityList";
import { MedicalStaffList } from "./tabs/MedicalStaffList.tsx";
import { ParkingList } from "./tabs/ParkingList.tsx";
import { WifiList } from "./tabs/WifiList.tsx";
import type { ConfiguratorTab } from "./ConfiguratorSidebar";

interface WorkspaceProps {
  config: FestivalConfig;
  activeTab: ConfiguratorTab;
  onConfigChange: (config: FestivalConfig) => void;
}

export function ConfiguratorWorkspace({
  config,
  activeTab,
  onConfigChange,
}: WorkspaceProps) {
  return (
    <main className="flex-1 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        {activeTab === "stages" && "Stages & Venues"}
        {activeTab === "artists" && "Lineup"}
        {activeTab === "vendors" && "Vendors"}
        {activeTab === "sponsors" && "Sponsors"}
        {activeTab === "toilets" && "Restroom Facilities"}
        {activeTab === "security" && "Security"}
        {activeTab === "medical" && "Medical Staff & Units"}
        {activeTab === "parking" && "Parking"}
        {activeTab === "wifi" && "WiFi"}
      </h2>

      <div className="space-y-4">
        {activeTab === "stages" && (
          <StagesList config={config} onConfigChange={onConfigChange} />
        )}
        {activeTab === "artists" && (
          <ArtistsList config={config} onConfigChange={onConfigChange} />
        )}
        {activeTab === "vendors" && (
          <VendorsList config={config} onConfigChange={onConfigChange} />
        )}
        {activeTab === "sponsors" && (
          <SponsorsList config={config} onConfigChange={onConfigChange} />
        )}
        {activeTab === "toilets" && (
          <ToiletsList config={config} onConfigChange={onConfigChange} />
        )}
        {activeTab === "security" && (
          <SecurityList config={config} onConfigChange={onConfigChange} />
        )}
        {activeTab === "medical" && (
          <MedicalStaffList config={config} onConfigChange={onConfigChange} />
        )}
        {activeTab === "parking" && (
          <ParkingList config={config} onConfigChange={onConfigChange} />
        )}
        {activeTab === "wifi" && (
          <WifiList config={config} onConfigChange={onConfigChange} />
        )}
      </div>
    </main>
  );
}
