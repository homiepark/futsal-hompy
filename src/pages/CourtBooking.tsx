import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { PixelInput } from '@/components/ui/PixelInput';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBackButton } from '@/components/ui/PixelBackButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { CourtCard } from '@/components/courts/CourtCard';

const mockCourts = [
  {
    name: '강남 풋살파크',
    address: '서울 강남구 역삼동 123-45',
    distance: '1.2km',
    rating: 4.8,
    pricePerHour: 80000,
    availableSlots: 5,
    amenities: ['wifi', 'parking', 'shower'],
    imageUrl: 'https://images.unsplash.com/photo-1624880357913-a8539238245b?w=600',
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
  },
];

export default function CourtBooking() {
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <PixelButton variant="primary" size="sm">전체</PixelButton>
        <PixelButton variant="default" size="sm">실내</PixelButton>
        <PixelButton variant="default" size="sm">실외</PixelButton>
        <PixelButton variant="default" size="sm">주차가능</PixelButton>
        <PixelButton variant="default" size="sm">샤워실</PixelButton>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-muted-foreground">
          주변 <span className="text-primary font-pixel">{mockCourts.length}</span>개 코트
        </p>
        <PixelButton variant="ghost" size="sm">
          거리순
        </PixelButton>
      </div>

      {/* Court List */}
      <div className="space-y-4">
        {mockCourts.map((court, index) => (
          <CourtCard key={index} {...court} />
        ))}
      </div>

      {/* Load More */}
      <div className="mt-6 text-center">
        <PixelButton variant="default">
          더 보기
        </PixelButton>
      </div>
    </div>
  );
}
