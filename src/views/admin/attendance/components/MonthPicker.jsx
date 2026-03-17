import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function MonthPicker({ value, onChange, className }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentDate = new Date();
  const initialYear = value ? parseInt(value.split('-')[0], 10) : currentDate.getFullYear();
  const [viewYear, setViewYear] = useState(initialYear);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleMonthSelect = (monthNum) => {
    const newMonthStr = `${viewYear}-${monthNum.toString().padStart(2, '0')}`;
    onChange(newMonthStr);
    setIsOpen(false);
  };

  const currentSelectedMonth = value ? parseInt(value.split('-')[1], 10) : null;
  const currentSelectedYear = value ? parseInt(value.split('-')[0], 10) : null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
            className={cn(
                "mt-1 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-base font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800 transition-colors",
                !value && "text-gray-500",
                className
            )}
        >
          <span className="truncate">
            {value ? `Tháng ${currentSelectedMonth.toString().padStart(2, '0')}/${currentSelectedYear}` : "Chọn tháng..."}
          </span>
          <CalendarIcon className="h-5 w-5 opacity-50 text-gray-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-4" align="start">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between space-x-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              className="h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100"
              onClick={() => setViewYear(viewYear - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-base font-semibold text-gray-900 dark:text-white">Năm {viewYear}</div>
            <Button
              variant="outline"
              className="h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100"
              onClick={() => setViewYear(viewYear + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {months.map((month) => {
               const isSelected = currentSelectedMonth === month && currentSelectedYear === viewYear;
               const isCurrentMonth = currentDate.getMonth() + 1 === month && currentDate.getFullYear() === viewYear;
               return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : isCurrentMonth ? "secondary" : "ghost"}
                  className={cn(
                      "h-12 w-full text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800", 
                      isSelected && "bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                  )}
                  onClick={() => handleMonthSelect(month)}
                >
                  {month}
                </Button>
               )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
