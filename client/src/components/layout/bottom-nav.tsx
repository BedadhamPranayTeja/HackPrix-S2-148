import { useAuth } from "@/hooks/use-auth";
import { Home, Send, AlertTriangle, History, User, ClipboardList, Headphones } from "lucide-react";

type Screen = "home" | "report" | "emergency" | "history" | "profile";

interface BottomNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function BottomNav({ activeScreen, onScreenChange }: BottomNavProps) {
  const { user } = useAuth();

  const navItems = [
    {
      id: "home" as Screen,
      icon: Home,
      label: "Home",
    },
    {
      id: "report" as Screen,
      icon: user?.role === "admin" ? ClipboardList : Send,
      label: user?.role === "admin" ? "Reports" : "Report",
    },
    {
      id: "emergency" as Screen,
      icon: user?.role === "admin" ? Headphones : AlertTriangle,
      label: user?.role === "admin" ? "Response" : "Emergency",
    },
    {
      id: "history" as Screen,
      icon: History,
      label: "History",
    },
    {
      id: "profile" as Screen,
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`flex flex-col items-center py-2 px-3 transition-colors ${
                isActive ? "text-primary" : "text-gray-600"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
