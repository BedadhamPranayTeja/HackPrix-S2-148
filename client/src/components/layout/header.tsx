import { useAuth } from "@/hooks/use-auth";
import { Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-primary text-white p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">SecureGate</h1>
          <p className="text-xs opacity-90">Sunset Heights Community</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-xs opacity-90">{user?.role === "admin" ? "Admin" : "Resident"}</p>
          <p className="text-xs font-medium">{user?.name}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-blue-600 p-2"
        >
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
