"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash } from "lucide-react";

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  status: "available" | "occupied" | "maintenance";
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  images: string[];
  created_at: string;
}

interface PropertyDetailsProps {
  property: Property;
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function onDelete() {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", property.id);

      if (error) {
        throw error;
      }

      toast.success("Property deleted successfully!");
      router.push("/dashboard/properties");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <p className="text-muted-foreground mt-2">{property.address}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Property
          </Button>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete Property
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  property and all associated data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Property"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground mt-1">
                  {property.description}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <Badge
                  variant={getStatusVariant(property.status)}
                  className="mt-1"
                >
                  {property.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Rental Rates</h3>
                <div className="mt-2 space-y-2">
                  {property.daily_rate && (
                    <div className="flex justify-between">
                      <span>Daily rate:</span>
                      <span>{formatCurrency(property.daily_rate)}</span>
                    </div>
                  )}
                  {property.weekly_rate && (
                    <div className="flex justify-between">
                      <span>Weekly rate:</span>
                      <span>{formatCurrency(property.weekly_rate)}</span>
                    </div>
                  )}
                  {property.monthly_rate && (
                    <div className="flex justify-between">
                      <span>Monthly rate:</span>
                      <span>{formatCurrency(property.monthly_rate)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Images</h3>
                {property.images && property.images.length > 0 ? (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {property.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-video rounded-md overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`${property.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-1">No images available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getStatusVariant(status: Property["status"]) {
  switch (status) {
    case "available":
      return "default" as const;
    case "occupied":
      return "secondary" as const;
    case "maintenance":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
} 