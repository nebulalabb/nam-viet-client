import { useState, useEffect } from 'react'
import { CalendarIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'

export function DateRange({ className, onChange, defaultValue }) {
  const [date, setDate] = useState({
    from: defaultValue?.from,
    to: defaultValue?.to,
  })

  useEffect(() => {
    if (defaultValue?.from && defaultValue?.to) {
      setDate(defaultValue)
    } else if (!defaultValue?.from && !defaultValue?.to) {
      setDate({ from: undefined, to: undefined })
    }
  }, [defaultValue])

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate)
    if (onChange) {
      onChange(selectedDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'dd/MM/yyyy')} -{' '}
                {format(date.to, 'dd/MM/yyyy')}
              </>
            ) : (
              format(date.from, 'dd/MM/yyyy')
            )
          ) : (
            <span>Chọn ngày</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleDateChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
