'use client'

import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { vi } from 'date-fns/locale'

function DatePicker({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  const handleCalendarChange = (_value, _e) => {
    const _event = {
      target: {
        value: String(_value),
      },
    }
    _e(_event)
  }

  return (
    <DayPicker
      locale={vi}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-3',
        caption_start: 'is-start',
        caption_between: 'is-between',
        caption_end: 'is-end',
        caption: 'flex justify-center pt-1 relative items-center gap-1',
        caption_label:
          'flex h-7 text-sm font-medium justify-center items-center grow [.is-multiple_&]:flex',
        caption_dropdowns: 'flex justify-center grow dropdowns pl-7 pr-8',
        multiple_months: 'is-multiple',
        vhidden:
          'hidden [.is-between_&]:flex [.is-end_&]:flex [.is-start.is-end_&]:hidden',
        nav: "flex items-center [&:has([name='previous-month'])]:order-first [&:has([name='next-month'])]:order-last",
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-6 w-6 bg-transparent p-0 text-muted-foreground',
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-1 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside: 'text-muted-foreground opacity-50',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />,
        Dropdown: ({ ...props }) => (
          <Select
            {...props}
            onValueChange={(value) => {
              if (props.onChange) {
                handleCalendarChange(value, props.onChange)
              }
            }}
            value={props.value}
          >
            <SelectTrigger
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'h-7 border-none px-2 py-1 font-medium shadow-none [.is-between_&]:hidden [.is-end_&]:hidden [.is-start.is-end_&]:flex',
              )}
            >
              <SelectValue placeholder={props?.caption}>
                {props?.caption}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="scrolling-auto max-h-[var(--radix-popper-available-height);] min-w-[var(--radix-popper-anchor-width)] overflow-y-auto">
              {props.children &&
                React.Children.map(props.children, (child) => (
                  <SelectItem
                    value={child?.props?.value}
                    className="min-w-[var(--radix-popper-anchor-width)] pr-7"
                  >
                    {child?.props?.children}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        ),
      }}
      {...props}
    />
  )
}
DatePicker.displayName = 'DatePicker'

export { DatePicker }
