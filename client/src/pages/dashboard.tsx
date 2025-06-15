import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import Home from "@/components/features/home";
import ReportForm from "@/components/features/report-form";
import AdminReports from "@/components/features/admin-reports";
import EmergencyButton from "@/components/features/emergency-button";
import AdminEmergency from "@/components/features/admin-emergency";
import History from "@/components/features/history";
import Profile from "@/components/features/profile";

type Screen = "home" | "report" | "emergency" | "history" | "profile";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeScreen, setActiveScreen] = useState<Screen>("home");

  if (!user) {
    return null;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case "home":
        return <Home />;
      case "report":
        return user.role === "admin" ? <AdminReports /> : <ReportForm />;
      case "emergency":
        return user.role === "admin" ? <AdminEmergency /> : <EmergencyButton />;
      case "history":
        return <History />;
      case "profile":
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <Header />
      
      <main className="pb-20 min-h-screen">
        {renderScreen()}
      </main>

      <BottomNav activeScreen={activeScreen} onScreenChange={setActiveScreen} />
    </div>
  );
}
