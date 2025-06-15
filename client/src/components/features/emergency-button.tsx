import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, Shield, CheckCircle } from "lucide-react";

type EmergencyState = "ready" | "connecting" | "connected";

export default function EmergencyButton() {
  const { toast } = useToast();
  const [emergencyState, setEmergencyState] = useState<EmergencyState>("ready");
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);

  const emergencyMutation = useMutation({
    mutationFn: async (data: { type: string; location: string }) => {
      const response = await apiRequest("POST", "/api/v1/emergency", data);
      return response.json();
    },
    onSuccess: () => {
      setEmergencyState("connected");
      toast({
        title: "Emergency Alert Sent",
        description: "Security has been notified. Help is on the way.",
      });
    },
    onError: (error: any) => {
      setEmergencyState("ready");
      setIsHolding(false);
      toast({
        variant: "destructive",
        title: "Emergency Alert Failed",
        description: error.message || "Failed to send emergency alert",
      });
    },
  });

  const startEmergencyHold = () => {
    if (emergencyState !== "ready") return;

    setIsHolding(true);
    holdStartTimeRef.current = Date.now();

    holdTimerRef.current = setTimeout(() => {
      triggerEmergency();
    }, 3000);
  };

  const stopEmergencyHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (emergencyState === "ready") {
      setIsHolding(false);
    }
  };

  const triggerEmergency = () => {
    setEmergencyState("connecting");
    setIsHolding(false);

    // Simulate connection process
    setTimeout(() => {
      emergencyMutation.mutate({
        type: "general",
        location: "Current Location", // In a real app, this would be actual location
      });
    }, 2000);
  };

  const resetEmergencyState = () => {
    setEmergencyState("ready");
    setIsHolding(false);
  };

  const renderEmergencyStatus = () => {
    switch (emergencyState) {
      case "ready":
        return (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              Press and hold the emergency button for 3 seconds to connect with security
            </p>
          </div>
        );
      case "connecting":
        return (
          <div className="text-center">
            <p className="text-sm text-red-600 font-medium mb-2">
              Connecting to nearest admin...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        );
      case "connected":
        return (
          <div className="text-center">
            <Card className="bg-green-500 text-white mb-4">
              <CardContent className="p-4">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">Connected to Admin</p>
                <p className="text-sm opacity-90">Security Officer: John Smith</p>
                <p className="text-sm opacity-90">Badge #5678</p>
              </CardContent>
            </Card>
            <p className="text-sm text-gray-600">
              Help is on the way. Stay calm and wait for assistance.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold mb-8">Emergency Services</h2>

      <div className="mb-8">
        {renderEmergencyStatus()}
      </div>

      {/* Emergency Button */}
      <div className="relative flex items-center justify-center mb-8">
        <svg className="absolute" width="140" height="140">
          <circle
            cx="70"
            cy="70"
            r="65"
            stroke="#f44336"
            strokeWidth="4"
            fill="none"
            className={`emergency-circle ${isHolding ? "animate-pulse" : ""}`}
            strokeLinecap="round"
            style={{
              strokeDasharray: isHolding ? "408 408" : "0 408",
              transform: "rotate(-90deg)",
              transformOrigin: "70px 70px",
              transition: isHolding ? "stroke-dasharray 3s ease-in-out" : "stroke-dasharray 0.3s ease",
            }}
          />
        </svg>
        <Button
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-lg relative z-10 transition-all ${
            emergencyState === "ready"
              ? "bg-red-500 hover:bg-red-600 text-white"
              : emergencyState === "connecting"
              ? "bg-red-600 text-white animate-pulse"
              : "bg-green-500 text-white"
          } ${isHolding ? "scale-105" : "scale-100"}`}
          onMouseDown={startEmergencyHold}
          onMouseUp={stopEmergencyHold}
          onMouseLeave={stopEmergencyHold}
          onTouchStart={startEmergencyHold}
          onTouchEnd={stopEmergencyHold}
          onClick={emergencyState === "connected" ? resetEmergencyState : undefined}
          disabled={emergencyMutation.isPending}
        >
          {emergencyState === "connected" ? (
            <>
              <CheckCircle className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium">CONNECTED</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium">EMERGENCY</span>
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2 text-left">When to use Emergency:</h3>
          <ul className="text-sm text-gray-700 space-y-1 text-left">
            <li>• Immediate danger or threat</li>
            <li>• Medical emergency</li>
            <li>• Fire or safety hazard</li>
            <li>• Witnessing a crime in progress</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
