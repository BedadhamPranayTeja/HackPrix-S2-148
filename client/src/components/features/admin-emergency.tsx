import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Headphones, Shield, AlertTriangle, Clock, MapPin } from "lucide-react";
import type { Emergency } from "@shared/schema";

export default function AdminEmergency() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasIncomingEmergency, setHasIncomingEmergency] = useState(false);

  const { data: activeEmergencies = [], isLoading } = useQuery({
    queryKey: ["/api/v1/emergency/admin"],
    refetchInterval: 5000, // Poll every 5 seconds for new emergencies
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, status, responseNotes }: { id: number; status: string; responseNotes?: string }) => {
      const response = await apiRequest("PATCH", `/api/v1/emergency/${id}`, { status, responseNotes });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency Updated",
        description: "Emergency status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/emergency/admin"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update emergency",
      });
    },
  });

  const handleRespond = (emergency: Emergency) => {
    respondMutation.mutate({
      id: emergency.id,
      status: "responded",
      responseNotes: "Admin responding to emergency",
    });
  };

  const handleResolve = (emergency: Emergency) => {
    respondMutation.mutate({
      id: emergency.id,
      status: "resolved",
      responseNotes: "Emergency resolved successfully",
    });
  };

  const toggleIncomingEmergency = () => {
    setHasIncomingEmergency(!hasIncomingEmergency);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-red-100 text-red-800",
      responded: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
    };

    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold mb-8">Emergency Response Center</h2>

      {/* Admin Status */}
      <div className="mb-8">
        {!hasIncomingEmergency && activeEmergencies.length === 0 ? (
          <Card className="bg-blue-500 text-white mb-4">
            <CardContent className="p-4">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">On Duty - Ready to Respond</p>
              <p className="text-sm opacity-90">Monitoring community for emergencies</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-red-500 text-white mb-4 animate-pulse">
            <CardContent className="p-4">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">ACTIVE EMERGENCIES</p>
              <p className="text-sm opacity-90">{activeEmergencies.length} emergency(ies) requiring attention</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Admin Emergency Button */}
      <div className="relative flex items-center justify-center mb-8">
        <Button
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-lg transition-colors ${
            hasIncomingEmergency || activeEmergencies.length > 0
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={toggleIncomingEmergency}
        >
          <Headphones className="w-8 h-8 mb-1 text-white" />
          <span className="text-xs font-medium text-white">RESPOND</span>
        </Button>
      </div>

      {/* Active Emergencies */}
      <Card className="text-left">
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Active Emergencies</h3>
          {activeEmergencies.length === 0 ? (
            <div className="text-sm text-gray-600 text-center py-4">
              <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p>No active emergencies</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeEmergencies.map((emergency: Emergency) => (
                <div key={emergency.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm">Emergency #{emergency.id}</h4>
                      <p className="text-xs text-gray-600">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {emergency.location}
                      </p>
                      <p className="text-xs text-gray-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(emergency.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {getStatusBadge(emergency.status)}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">Type: {emergency.type}</p>
                  <div className="flex space-x-2">
                    {emergency.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() => handleRespond(emergency)}
                        disabled={respondMutation.isPending}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        Respond
                      </Button>
                    )}
                    {emergency.status === "responded" && (
                      <Button
                        size="sm"
                        onClick={() => handleResolve(emergency)}
                        disabled={respondMutation.isPending}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
