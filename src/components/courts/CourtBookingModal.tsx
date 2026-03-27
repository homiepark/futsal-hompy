import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Clock, MapPin, Users } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';

interface TimeSlot {
  time: string;
  status: 'available' | 'booked' | 'selected';
  price: number;
}

interface CourtBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtName: string;
  courtAddress: string;
  pricePerHour: number;
}

const generateTimeSlots = (price: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    const isPeakHour = (hour >= 18 && hour <= 21) || (hour >= 10 && hour <= 12);
    const slotPrice = isPeakHour ? Math.round(price * 1.3) : price;
    // Randomly mark some as booked for demo
    const randomBooked = [8, 10, 14, 19, 20].includes(hour);
    slots.push({
      time: `${String(hour).padStart(2, '0')}:00`,
      status: randomBooked ? 'booked' : 'available',
      price: slotPrice,
    });
  }
  return slots;
};

export function CourtBookingModal({ isOpen, onClose, courtName, courtAddress, pricePerHour }: CourtBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [teamSize, setTeamSize] = useState('10');

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  const timeSlots = generateTimeSlots(pricePerHour);

  const handleSlotToggle = (time: string, status: string) => {
    if (status === 'booked') return;
    setSelectedSlots(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time].sort()
    );
  };

  const totalPrice = selectedSlots.reduce((sum, time) => {
    const slot = timeSlots.find(s => s.time === time);
    return sum + (slot?.price || 0);
  }, 0);

  const handleConfirm = () => {
    toast.success('예약이 완료되었습니다! ⚽', {
      description: `${courtName} | ${format(selectedDate, 'M월 d일')} ${selectedSlots[0]}~${parseInt(selectedSlots[selectedSlots.length - 1]) + 1}:00`,
    });
    setSelectedSlots([]);
    setStep('select');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-lg bg-card border-t-4 border-border-dark rounded-t-xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{ boxShadow: '0 -4px 20px hsl(var(--pixel-shadow) / 0.3)' }}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-pixel text-[10px]">{courtName}</h3>
            <div className="flex items-center gap-1 mt-1 opacity-80">
              <MapPin size={10} />
              <span className="font-pixel text-[7px]">{courtAddress}</span>
            </div>
          </div>
          <button onClick={onClose} className="hover:opacity-80">
            <X size={18} />
          </button>
        </div>

        {step === 'select' ? (
          <>
            {/* Date Selector */}
            <div className="px-4 py-3 border-b-2 border-border shrink-0">
              <h4 className="font-pixel text-[8px] text-muted-foreground mb-2">날짜 선택</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dates.map((date) => {
                  const isSelected = isSameDay(date, selectedDate);
                  const dayName = format(date, 'EEE', { locale: ko });
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => { setSelectedDate(date); setSelectedSlots([]); }}
                      className={`shrink-0 w-14 py-2 border-2 text-center transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary-dark'
                          : 'bg-secondary border-border-dark hover:bg-muted'
                      }`}
                      style={{ boxShadow: isSelected ? '2px 2px 0 hsl(var(--primary-dark))' : '1px 1px 0 hsl(var(--pixel-shadow))' }}
                    >
                      <span className={`font-pixel text-[8px] block ${isWeekend && !isSelected ? 'text-accent' : ''}`}>
                        {dayName}
                      </span>
                      <span className="font-pixel text-[11px] block mt-0.5">
                        {format(date, 'd')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots Grid */}
            <div className="px-4 py-3 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-pixel text-[8px] text-muted-foreground">
                  {format(selectedDate, 'M월 d일 (EEE)', { locale: ko })} 시간대
                </h4>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-primary/20 border border-primary/40" />
                    <span className="font-pixel text-[7px] text-muted-foreground">선택</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-muted border border-border-dark opacity-50" />
                    <span className="font-pixel text-[7px] text-muted-foreground">예약됨</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlots.includes(slot.time);
                  const isBooked = slot.status === 'booked';
                  return (
                    <button
                      key={slot.time}
                      onClick={() => handleSlotToggle(slot.time, slot.status)}
                      disabled={isBooked}
                      className={`p-2 border-2 text-center transition-all ${
                        isBooked
                          ? 'bg-muted border-border opacity-40 cursor-not-allowed line-through'
                          : isSelected
                            ? 'bg-primary/15 border-primary text-primary'
                            : 'bg-secondary border-border-dark hover:border-primary/50'
                      }`}
                      style={{ boxShadow: isSelected ? '2px 2px 0 hsl(var(--primary-dark) / 0.3)' : '1px 1px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                    >
                      <span className="font-pixel text-[10px] block">{slot.time}</span>
                      <span className={`font-pixel text-[7px] block mt-0.5 ${isBooked ? 'text-muted-foreground' : 'text-accent'}`}>
                        {isBooked ? '마감' : `₩${(slot.price / 10000).toFixed(1)}만`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Bar */}
            {selectedSlots.length > 0 && (
              <div className="px-4 py-3 border-t-3 border-border-dark bg-card shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-pixel text-[8px] text-muted-foreground">
                      {selectedSlots.length}시간 선택
                    </span>
                    <span className="font-pixel text-[8px] text-foreground ml-2">
                      {selectedSlots[0]} - {parseInt(selectedSlots[selectedSlots.length - 1]) + 1}:00
                    </span>
                  </div>
                  <span className="font-pixel text-xs text-accent">
                    ₩{totalPrice.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setStep('confirm')}
                  className="w-full py-3 bg-accent text-accent-foreground font-pixel text-[10px] border-3 border-accent-dark hover:brightness-110 transition-all"
                  style={{ boxShadow: '3px 3px 0 hsl(var(--accent-dark))' }}
                >
                  예약 진행하기
                </button>
              </div>
            )}
          </>
        ) : (
          /* Confirmation Step */
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <h4 className="font-pixel text-[10px] text-foreground text-center">예약 확인</h4>

            {/* Summary Card */}
            <div className="bg-secondary border-3 border-border-dark p-4 space-y-3"
              style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary shrink-0" />
                <div>
                  <span className="font-pixel text-[9px] text-foreground block">{courtName}</span>
                  <span className="font-pixel text-[7px] text-muted-foreground">{courtAddress}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-accent shrink-0" />
                <div>
                  <span className="font-pixel text-[9px] text-foreground block">
                    {format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                  </span>
                  <span className="font-pixel text-[7px] text-muted-foreground">
                    {selectedSlots[0]} - {parseInt(selectedSlots[selectedSlots.length - 1]) + 1}:00 ({selectedSlots.length}시간)
                  </span>
                </div>
              </div>
            </div>

            {/* Team Size */}
            <div>
              <label className="font-pixel text-[8px] text-muted-foreground mb-2 block">인원 수</label>
              <div className="flex gap-2">
                {['5', '6', '8', '10', '12'].map(size => (
                  <button
                    key={size}
                    onClick={() => setTeamSize(size)}
                    className={`flex-1 py-2 border-2 font-pixel text-[9px] transition-all ${
                      teamSize === size
                        ? 'bg-primary text-primary-foreground border-primary-dark'
                        : 'bg-secondary border-border-dark hover:bg-muted'
                    }`}
                    style={{ boxShadow: teamSize === size ? '2px 2px 0 hsl(var(--primary-dark))' : '1px 1px 0 hsl(var(--pixel-shadow))' }}
                  >
                    <Users size={10} className="mx-auto mb-0.5" />
                    {size}명
                  </button>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-accent/10 border-2 border-accent/30 p-3">
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[9px] text-foreground">총 결제 금액</span>
                <span className="font-pixel text-sm text-accent">₩{totalPrice.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="font-pixel text-[7px] text-muted-foreground">
                  1인당 ₩{Math.round(totalPrice / parseInt(teamSize)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setStep('select')}
                className="flex-1 py-3 bg-secondary text-foreground font-pixel text-[10px] border-3 border-border-dark hover:bg-muted transition-all"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                ← 뒤로
              </button>
              <button
                onClick={handleConfirm}
                className="flex-[2] py-3 bg-accent text-accent-foreground font-pixel text-[10px] border-3 border-accent-dark hover:brightness-110 transition-all"
                style={{ boxShadow: '3px 3px 0 hsl(var(--accent-dark))' }}
              >
                ⚽ 예약 확정하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
