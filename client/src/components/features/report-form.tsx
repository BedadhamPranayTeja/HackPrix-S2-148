import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { insertReportSchema, type InsertReport } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Send, MapPin, Camera } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import LocationSelector from "@/components/ui/location-selector";

export default function ReportForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [useMyDetails, setUseMyDetails] = useState(true);

  const form = useForm<InsertReport>({
    resolver: zodResolver(insertReportSchema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
      location: "",
      evidenceUrl: "",
      victimName: "",
      victimContact: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertReport) => {
      const response = await apiRequest("POST", "/api/v1/report", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Your report has been submitted successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/report/user"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit report",
      });
    },
  });

  const onSubmit = async (data: InsertReport) => {
    if (useMyDetails) {
      data.victimName = user?.name || "";
      data.victimContact = user?.phoneNumber || "";
    }
    mutation.mutate(data);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Send className="w-5 h-5 text-primary mr-3" />
        Submit Report
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="assault">Assault</SelectItem>
                    <SelectItem value="vandalism">Vandalism</SelectItem>
                    <SelectItem value="suspicious">Suspicious Activity</SelectItem>
                    <SelectItem value="noise">Noise Complaint</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Brief description of incident" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Provide detailed description of the incident..."
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <LocationSelector
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="evidenceUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evidence (Optional)</FormLabel>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Victim Information</FormLabel>
            <div className="space-y-3 mt-2">
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant={useMyDetails ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setUseMyDetails(true)}
                >
                  Use My Details
                </Button>
                <Button
                  type="button"
                  variant={!useMyDetails ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setUseMyDetails(false)}
                >
                  Enter Manually
                </Button>
              </div>
              
              {!useMyDetails && (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="victimName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Victim name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="victimContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="Contact number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
