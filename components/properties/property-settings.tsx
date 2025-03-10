'use client';

import { useState } from 'react';
import { Property } from '@/lib/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Heating',
  'Kitchen',
  'Washer',
  'Dryer',
  'TV',
  'Parking',
  'Gym',
  'Pool',
  'Security',
  'Elevator',
] as const;

type Amenity = typeof AMENITIES[number];

interface PropertySettingsProps {
  property: Property;
  onUpdate: () => void;
}

export function PropertySettings({ property, onUpdate }: PropertySettingsProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: property.name,
    description: property.description,
    address: property.address,
    daily_rate: property.daily_rate.toString(),
    weekly_rate: property.weekly_rate.toString(),
    monthly_rate: property.monthly_rate.toString(),
    status: property.status,
    amenities: property.amenities as Amenity[],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          daily_rate: parseFloat(formData.daily_rate),
          weekly_rate: parseFloat(formData.weekly_rate),
          monthly_rate: parseFloat(formData.monthly_rate),
        }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating property:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleAmenityChange(checked: boolean, amenity: Amenity) {
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity),
    }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily_rate">Daily Rate ($)</Label>
              <Input
                id="daily_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.daily_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, daily_rate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekly_rate">Weekly Rate ($)</Label>
              <Input
                id="weekly_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.weekly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, weekly_rate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_rate">Monthly Rate ($)</Label>
              <Input
                id="monthly_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, monthly_rate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Property['status']) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(checked as boolean, amenity)}
                  />
                  <Label htmlFor={amenity}>{amenity}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 