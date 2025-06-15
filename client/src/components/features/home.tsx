import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, Shield, CheckCircle, MapPin } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/v1/admin/reports"],
    enabled: user?.role === "admin",
  });

  const { data: userHistory } = useQuery({
    queryKey: ["/api/v1/history"],
    enabled: user?.role === "user",
  });

  return (
    <div>
      {/* Welcome Section */}
      <div className="p-6 bg-gradient-to-r from-primary to-blue-600 text-white">
        <h2 className="text-xl font-semibold mb-2">Welcome back, {user?.name}!</h2>
        <p className="text-sm opacity-90">Your community is secure and monitored.</p>
      </div>

      {/* Quick Stats */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {user?.role === "admin" ? stats?.length || 0 : userHistory?.reports?.length || 0}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.role === "admin" ? "Total Reports" : "My Reports"}
                </p>
              </div>
              <FileText className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">2.3m</p>
                <p className="text-xs text-gray-600">Avg Response</p>
              </div>
              <Clock className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Map */}
      <div className="mx-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <MapPin className="w-4 h-4 text-primary mr-2" />
              Coverage Area
            </h3>
            <div className="h-48 bg-gray-100 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-primary bg-opacity-20"></div>
              <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs">
                <Shield className="w-3 h-3 text-primary mr-1 inline" />
                Fully Protected
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mx-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System Status: All Clear</p>
                  <p className="text-xs text-gray-600">Security systems operational</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Security patrol completed</p>
                  <p className="text-xs text-gray-600">All areas checked</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
