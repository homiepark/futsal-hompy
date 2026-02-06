import { useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from '@/components/ui/PixelButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface HomeGroundSelectorProps {
  groundName: string;
  groundAddress: string;
  onGroundNameChange: (name: string) => void;
  onGroundAddressChange: (address: string) => void;
}

// Mock search results - would be replaced with actual API calls
const mockSearchResults = [
  { name: '용산 풋살장', address: '서울 용산구 이촌로 123' },
  { name: '강남 스포츠센터', address: '서울 강남구 역삼동 456' },
  { name: '마포 축구장', address: '서울 마포구 상암동 789' },
  { name: '송파 실내풋살장', address: '서울 송파구 잠실동 101' },
  { name: '동작 풋살파크', address: '서울 동작구 사당동 202' },
];

export function HomeGroundSelector({
  groundName,
  groundAddress,
  onGroundNameChange,
  onGroundAddressChange,
}: HomeGroundSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof mockSearchResults>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API search delay
    setTimeout(() => {
      const results = mockSearchResults.filter(
        r => r.name.includes(searchQuery) || r.address.includes(searchQuery)
      );
      // If no matches, show all mock results
      setSearchResults(results.length > 0 ? results : mockSearchResults);
      setIsSearching(false);
    }, 500);
  };

  const handleSelectLocation = (name: string, address: string) => {
    onGroundNameChange(name);
    onGroundAddressChange(address);
    setIsOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClear = () => {
    onGroundNameChange('');
    onGroundAddressChange('');
  };

  return (
    <div className="space-y-2">
      <label className="font-pixel text-[9px] text-muted-foreground flex items-center gap-1">
        <MapPin size={12} />
        주 훈련 구장
      </label>

      {/* Selected Location Display */}
      {groundName ? (
        <div
          className="flex items-center gap-2 p-3 bg-primary/10 border-3 border-primary"
          style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
        >
          <div className="w-8 h-8 bg-primary/20 border-2 border-primary-dark flex items-center justify-center">
            <MapPin size={14} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-pixel text-[10px] text-foreground truncate">{groundName}</p>
            <p className="font-pixel text-[8px] text-muted-foreground truncate">{groundAddress}</p>
          </div>
          <button
            onClick={handleClear}
            className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded"
          >
            <X size={12} className="text-muted-foreground" />
          </button>
        </div>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={cn(
                'w-full flex items-center gap-2 px-3 py-3',
                'bg-input border-3 border-border-dark',
                'font-pixel text-[10px] text-muted-foreground',
                'hover:border-primary transition-colors'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              <MapPin size={14} />
              <span>훈련 구장 검색하기...</span>
            </button>
          </DialogTrigger>

          <DialogContent 
            className="max-w-md mx-4 bg-card border-4 border-border-dark p-0 overflow-hidden"
            style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
          >
            <DialogHeader className="bg-primary/20 border-b-4 border-border-dark p-4">
              <DialogTitle className="font-pixel text-[11px] text-foreground flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                구장 검색
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="구장 이름 또는 주소 검색..."
                  className={cn(
                    'w-full pl-9 pr-3 py-2',
                    'bg-input border-3 border-border-dark',
                    'font-pixel text-[10px] placeholder:text-muted-foreground',
                    'focus:outline-none focus:border-primary'
                  )}
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                />
              </div>

              <PixelButton
                type="button"
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? '검색 중...' : '🔍 검색'}
              </PixelButton>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <p className="font-pixel text-[8px] text-muted-foreground">
                    검색 결과 ({searchResults.length}개)
                  </p>
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation(result.name, result.address)}
                      className={cn(
                        'w-full flex items-start gap-2 p-2 text-left',
                        'bg-secondary border-2 border-border-dark',
                        'hover:bg-muted hover:border-primary transition-colors'
                      )}
                      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                    >
                      <MapPin size={12} className="text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-pixel text-[9px] text-foreground truncate">{result.name}</p>
                        <p className="font-pixel text-[8px] text-muted-foreground truncate">{result.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Manual Entry Option */}
              <div className="pt-2 border-t-2 border-border">
                <p className="font-pixel text-[8px] text-muted-foreground mb-2">
                  또는 직접 입력:
                </p>
                <input
                  type="text"
                  value={groundName}
                  onChange={(e) => onGroundNameChange(e.target.value)}
                  placeholder="구장 이름"
                  className={cn(
                    'w-full px-3 py-2 mb-2',
                    'bg-input border-3 border-border-dark',
                    'font-pixel text-[10px] placeholder:text-muted-foreground',
                    'focus:outline-none focus:border-primary'
                  )}
                />
                <input
                  type="text"
                  value={groundAddress}
                  onChange={(e) => onGroundAddressChange(e.target.value)}
                  placeholder="주소"
                  className={cn(
                    'w-full px-3 py-2',
                    'bg-input border-3 border-border-dark',
                    'font-pixel text-[10px] placeholder:text-muted-foreground',
                    'focus:outline-none focus:border-primary'
                  )}
                />
                <PixelButton
                  type="button"
                  variant="accent"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setIsOpen(false)}
                  disabled={!groundName.trim()}
                >
                  ✓ 저장
                </PixelButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Change Button when location is selected */}
      {groundName && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="font-pixel text-[8px] text-primary hover:underline"
            >
              📍 구장 변경하기
            </button>
          </DialogTrigger>

          <DialogContent 
            className="max-w-md mx-4 bg-card border-4 border-border-dark p-0 overflow-hidden"
            style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
          >
            <DialogHeader className="bg-primary/20 border-b-4 border-border-dark p-4">
              <DialogTitle className="font-pixel text-[11px] text-foreground flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                구장 검색
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="구장 이름 또는 주소 검색..."
                  className={cn(
                    'w-full pl-9 pr-3 py-2',
                    'bg-input border-3 border-border-dark',
                    'font-pixel text-[10px] placeholder:text-muted-foreground',
                    'focus:outline-none focus:border-primary'
                  )}
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                />
              </div>

              <PixelButton
                type="button"
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? '검색 중...' : '🔍 검색'}
              </PixelButton>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <p className="font-pixel text-[8px] text-muted-foreground">
                    검색 결과 ({searchResults.length}개)
                  </p>
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation(result.name, result.address)}
                      className={cn(
                        'w-full flex items-start gap-2 p-2 text-left',
                        'bg-secondary border-2 border-border-dark',
                        'hover:bg-muted hover:border-primary transition-colors'
                      )}
                      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                    >
                      <MapPin size={12} className="text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-pixel text-[9px] text-foreground truncate">{result.name}</p>
                        <p className="font-pixel text-[8px] text-muted-foreground truncate">{result.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
