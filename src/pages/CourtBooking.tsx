import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { PixelInput } from '@/components/ui/PixelInput';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBackButton } from '@/components/ui/PixelBackButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { CourtCard } from '@/components/courts/CourtCard';
import { CourtBookingModal } from '@/components/courts/CourtBookingModal';

interface Court {
  name: string;
  address: string;
  distance: string;
  rating: number;
  pricePerHour: number;
  availableSlots: number;
  amenities: string[];
  imageUrl: string;
  type: 'indoor' | 'outdoor';
}

const mockCourts: Court[] = [
  {
    name: '강남 풋살파크',
    address: '서울 강남구 역삼동 123-45',
    distance: '1.2km',
    rating: 4.8,
    pricePerHour: 80000,
    availableSlots: 5,
    amenities: ['wifi', 'parking', 'shower'],
    imageUrl: 'https://images.unsplash.com/photo-1624880357913-a8539238245b?w=600',
    type: 'indoor',
  },
  {
    name: '마포 실내풋살장',
    address: '서울 마포구 상암동 789-12',
    distance: '2.5km',
    rating: 4.5,
    pricePerHour: 60000,
    availableSlots: 2,
    amenities: ['parking', 'locker'],
    imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600',
    type: 'indoor',
  },
  {
    name: '송파 스포츠센터',
    address: '서울 송파구 잠실동 456-78',
    distance: '3.8km',
    rating: 4.7,
    pricePerHour: 70000,
    availableSlots: 8,
    amenities: ['wifi', 'shower', 'locker'],
    imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600',
    type: 'outdoor',
  },
  {
    name: '잠실 야외 풋살장',
    address: '서울 송파구 잠실동 100-2',
    distance: '4.1km',
    rating: 4.3,
    pricePerHour: 50000,
    availableSlots: 12,
    amenities: ['parking'],
    imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600',
    type: 'outdoor',
  },
];

type FilterType = 'all' | 'indoor' | 'outdoor' | 'parking' | 'shower';

export default function CourtBooking() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const [bookingCourt, setBookingCourt] = useState<Court | null>(null);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'indoor', label: '실내' },
    { key: 'outdoor', label: '실외' },
    { key: 'parking', label: '주차가능' },
    { key: 'shower', label: '샤워실' },
  ];

  // Filter courts
  const filteredCourts = mockCourts.filter(court => {
    if (searchQuery && !court.name.includes(searchQuery) && !court.address.includes(searchQuery)) {
      return false;
    }
    if (activeFilter === 'indoor') return court.type === 'indoor';
    if (activeFilter === 'outdoor') return court.type === 'outdoor';
    if (activeFilter === 'parking') return court.amenities.includes('parking');
    if (activeFilter === 'shower') return court.amenities.includes('shower');
    return true;
  });

  // Sort courts
  const sortedCourts = [...filteredCourts].sort((a, b) => {
    if (sortBy === 'price') return a.pricePerHour - b.pricePerHour;
    if (sortBy === 'rating') return b.rating - a.rating;
    return parseFloat(a.distance) - parseFloat(b.distance);
  });

  return (
    <div className="pb-20 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <PixelBackButton variant="green" />
          <h2 className="font-pixel text-xs text-foreground flex items-center gap-2">
            <span className="text-primary">📍</span>
            코트 예약
          </h2>
        </div>

        {/* Search & Location */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <PixelInput
              placeholder="코트 검색..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <PixelButton variant="default" className="px-3">
            <SlidersHorizontal size={16} />
          </PixelButton>
        </div>

        {/* Current Location */}
        <PixelCard className="flex items-center gap-3 py-3">
          <div className="w-10 h-10 bg-accent border-2 border-accent-dark flex items-center justify-center shadow-pixel-sm animate-pixel-pulse">
            <MapPin size={18} className="text-accent-foreground" />
          </div>
          <div>
            <p className="font-pixel text-[8px] text-muted-foreground">현재 위치</p>
            <p className="font-body text-sm text-foreground">서울 강남구 역삼동</p>
          </div>
          <PixelButton variant="ghost" size="sm" className="ml-auto">
            변경
          </PixelButton>
        </PixelCard>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {filters.map(f => (
          <PixelButton
            key={f.key}
            variant={activeFilter === f.key ? 'primary' : 'default'}
            size="sm"
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </PixelButton>
        ))}
      </div>

      {/* Results Count & Sort */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-muted-foreground">
          주변 <span className="text-primary font-pixel">{sortedCourts.length}</span>개 코트
        </p>
        <div className="flex gap-1">
          {[
            { key: 'distance' as const, label: '거리순' },
            { key: 'price' as const, label: '가격순' },
            { key: 'rating' as const, label: '평점순' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-2 py-1 font-pixel text-[8px] border transition-colors ${
                sortBy === s.key
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Court List */}
      <div className="space-y-4">
        {sortedCourts.map((court, index) => (
          <CourtCard
            key={index}
            {...court}
            onBook={() => setBookingCourt(court)}
          />
        ))}
      </div>

      {/* Empty State */}
      {sortedCourts.length === 0 && (
        <div className="text-center py-8 bg-card border-3 border-border-dark"
          style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
        >
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-pixel text-[10px] text-muted-foreground">
            조건에 맞는 코트가 없습니다
          </p>
        </div>
      )}

      {/* Load More */}
      {sortedCourts.length > 0 && (
        <div className="mt-6 text-center">
          <PixelButton variant="default">
            더 보기
          </PixelButton>
        </div>
      )}

      {/* Booking Modal */}
      {bookingCourt && (
        <CourtBookingModal
          isOpen={!!bookingCourt}
          onClose={() => setBookingCourt(null)}
          courtName={bookingCourt.name}
          courtAddress={bookingCourt.address}
          pricePerHour={bookingCourt.pricePerHour}
        />
      )}
    </div>
  );
}
