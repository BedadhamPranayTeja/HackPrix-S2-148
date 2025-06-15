import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ClipboardList, User, Clock, Camera, CheckCircle, X, MessageSquare } from "lucide-react";
import { useState } from "react";
import type { Report } from "@shared/schema";

export default function AdminReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [responseMessage, setResponseMessage] = useState("");

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/v1/admin/reports"],
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status, adminResponse }: { id: number; status: string; adminResponse?: string }) => {
      const response = await apiRequest("PATCH", `/api/v1/report/${id}`, { status, adminResponse });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Updated",
        description: "Report status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/reports"] });
      setSelectedReport(null);
      setResponseMessage("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update report",
      });
    },
  });

  const handleApprove = () => {
    if (!selectedReport) return;
    updateReportMutation.mutate({
      id: selectedReport.id,
      status: "approved",
      adminResponse: responseMessage || "Report approved and action taken.",
    });
  };

  const handleDeny = () => {
    if (!selectedReport) return;
    updateReportMutation.mutate({
      id: selectedReport.id,
      status: "denied",
      adminResponse: responseMessage || "Report marked as spam or invalid.",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      resolved: "default",
      denied: "destructive",
    };

    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      resolved: "bg-blue-100 text-blue-800",
      denied: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <ClipboardList className="w-5 h-5 text-primary mr-3" />
        Assigned Reports
      </h2>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reports available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report: Report) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {report.evidenceUrl ? (
                      <img
                        src={report.evidenceUrl}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{report.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          <User className="w-3 h-3 inline mr-1" />
                          Report #{report.id}
                        </p>
                        <p className="text-xs text-gray-600">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="flex-1"
                        onClick={() => setSelectedReport(report)}
                      >
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Report Details</DialogTitle>
                      </DialogHeader>
                      {selectedReport && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">{selectedReport.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedReport.description}
                            </p>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><strong>Category:</strong> {selectedReport.category}</p>
                            <p><strong>Location:</strong> {selectedReport.location}</p>
                            <p><strong>Time:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                            <p><strong>Report ID:</strong> #{selectedReport.id}</p>
                          </div>
                          {selectedReport.evidenceUrl && (
                            <div>
                              <p className="text-sm font-medium mb-2">Evidence:</p>
                              <img
                                src={selectedReport.evidenceUrl}
                                alt="Evidence"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <div>
                            <label className="text-sm font-medium">Response Message:</label>
                            <Textarea
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                              placeholder="Add your response..."
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-3">
                            <Button
                              onClick={handleApprove}
                              className="w-full bg-green-600 hover:bg-green-700"
                              disabled={updateReportMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve & Resolve
                            </Button>
                            <Button
                              onClick={handleDeny}
                              variant="destructive"
                              className="w-full"
                              disabled={updateReportMutation.isPending}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Mark as Spam
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
