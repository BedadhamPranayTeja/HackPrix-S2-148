import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { History as HistoryIcon, FileText, AlertTriangle, Calendar, User, UserCheck } from "lucide-react";
import type { Report, Emergency } from "@shared/schema";

type FilterType = "all" | "reports" | "emergency";

export default function History() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedItem, setSelectedItem] = useState<Report | Emergency | null>(null);

  const { data: history, isLoading } = useQuery({
    queryKey: ["/api/v1/history"],
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      resolved: "bg-blue-100 text-blue-800",
      denied: "bg-red-100 text-red-800",
      active: "bg-red-100 text-red-800",
      responded: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isReport = (item: Report | Emergency): item is Report => {
    return 'title' in item;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilteredItems = () => {
    if (!history) return [];

    const allItems: (Report | Emergency)[] = [];

    if (filter === "all" || filter === "reports") {
      allItems.push(...(history.reports || []));
    }

    if (filter === "all" || filter === "emergency") {
      allItems.push(...(history.emergencies || []));
    }

    return allItems.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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

  const filteredItems = getFilteredItems();

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-6">History</h2>

      {/* Filter Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "reports" ? "default" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setFilter("reports")}
        >
          Reports
        </Button>
        <Button
          variant={filter === "emergency" ? "default" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setFilter("emergency")}
        >
          Emergency
        </Button>
      </div>

      {/* History Items */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HistoryIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No history items found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Dialog key={`${isReport(item) ? 'report' : 'emergency'}-${item.id}`}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isReport(item) ? "bg-primary" : "bg-red-500"
                      }`}>
                        {isReport(item) ? (
                          <FileText className="w-5 h-5 text-white" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-sm">
                              {isReport(item) ? item.title : `Emergency #${item.id}`}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {formatDate(item.createdAt)}
                            </p>
                            {user?.role === "user" ? (
                              <p className="text-xs text-gray-600">
                                <UserCheck className="w-3 h-3 inline mr-1" />
                                {isReport(item) ? "Reviewed by Admin" : "Attended by Security"}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-600">
                                <User className="w-3 h-3 inline mr-1" />
                                {isReport(item) ? `Report #${item.id}` : `Emergency Response #${item.id}`}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {isReport(item) ? "Report Details" : "Emergency Details"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {isReport(item) ? (
                    <>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>Category:</strong> {item.category}</p>
                        <p><strong>Location:</strong> {item.location}</p>
                        <p><strong>Submitted:</strong> {formatDate(item.createdAt)}</p>
                        <p><strong>Status:</strong> {item.status}</p>
                        {item.adminResponse && (
                          <div>
                            <p className="font-medium">Admin Response:</p>
                            <p className="text-gray-600">{item.adminResponse}</p>
                          </div>
                        )}
                      </div>
                      {item.evidenceUrl && (
                        <div>
                          <p className="text-sm font-medium mb-2">Evidence:</p>
                          <img
                            src={item.evidenceUrl}
                            alt="Evidence"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p><strong>Type:</strong> {item.type}</p>
                      <p><strong>Location:</strong> {item.location}</p>
                      <p><strong>Created:</strong> {formatDate(item.createdAt)}</p>
                      <p><strong>Status:</strong> {item.status}</p>
                      {item.resolvedAt && (
                        <p><strong>Resolved:</strong> {formatDate(item.resolvedAt)}</p>
                      )}
                      {item.responseNotes && (
                        <div>
                          <p className="font-medium">Response Notes:</p>
                          <p className="text-gray-600">{item.responseNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
