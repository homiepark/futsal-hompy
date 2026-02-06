import { MapPin, Clock, Star, Wifi, Car } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { PixelIcon } from '@/components/ui/PixelIcon';

interface CourtCardProps {
  name: string;
  address: string;
  distance: string;
  rating: number;
  pricePerHour: number;
  availableSlots: number;
  amenities: string[];
  imageUrl?: string;
}

const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi,
  parking: Car,
};

export function CourtCard({
  name,
  address,
  distance,
  rating,
  pricePerHour,
  availableSlots,
  amenities,
  imageUrl,
}: CourtCardProps) {
  return (
    <PixelCard className="space-y-3">
      {/* Image */}
      {imageUrl && (
        <div className="border-4 border-border-dark shadow-pixel overflow-hidden -mx-4 -mt-4 mb-4">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-pixel text-[10px] text-foreground">{name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin size={10} />
            <span className="font-body text-xs">{address}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-accent">
            <Star size={12} fill="currentColor" />
            <span className="font-pixel text-[10px]">{rating}</span>
          </div>
          <span className="font-body text-xs text-muted-foreground">{distance}</span>
        </div>
      </div>

      {/* Info Row */}
      <div className="flex flex-wrap gap-2">
        <PixelBadge variant="primary">
          ₩{pricePerHour.toLocaleString()}/시간
        </PixelBadge>
        <PixelBadge variant={availableSlots > 3 ? 'default' : 'accent'}>
          <Clock size={10} className="mr-1" />
          {availableSlots}개 슬롯
        </PixelBadge>
        {amenities.map((amenity) => (
          <PixelBadge key={amenity} variant="default">
            {amenity === 'wifi' && '📶'}
            {amenity === 'parking' && '🅿️'}
            {amenity === 'shower' && '🚿'}
            {amenity === 'locker' && '🔐'}
          </PixelBadge>
        ))}
      </div>

      {/* Action */}
      <PixelButton variant="accent" className="w-full">
        예약하기
      </PixelButton>
    </PixelCard>
  );
}
