import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState(value);

  const commonLocations = [
    "Main Entrance Gate",
    "Building A Lobby",
    "Building B Lobby", 
    "Parking Garage Level 1",
    "Parking Garage Level 2",
    "Community Pool Area",
    "Playground",
    "Tennis Court",
    "Gym/Fitness Center",
    "Mail Room",
    "Other (specify in description)",
  ];

  const handleSelectLocation = (location: string) => {
    setTempLocation(location);
    onChange(location);
    setIsOpen(false);
  };

  const handleCustomLocation = () => {
    onChange(tempLocation);
    setIsOpen(false);
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="relative">
            <Input
              value={value}
              placeholder="Tap to select location on map"
              readOnly
              className="bg-gray-50 cursor-pointer pr-10"
            />
            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Common Locations:</label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {commonLocations.map((location) => (
                  <Button
                    key={location}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto py-2 px-3 text-left"
                    onClick={() => handleSelectLocation(location)}
                  >
                    {location}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-2 block">Custom Location:</label>
              <div className="flex space-x-2">
                <Input
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  placeholder="Enter custom location"
                  className="flex-1"
                />
                <Button onClick={handleCustomLocation} disabled={!tempLocation.trim()}>
                  Set
                </Button>
              </div>
            </div>

            {/* Map Integration Placeholder */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-2 block">Interactive Map:</label>
              <Card className="h-32 bg-gray-100 cursor-pointer">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Map integration coming soon</p>
                    <p className="text-xs text-gray-500">Tap to select exact location</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
