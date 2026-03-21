import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

/**
 * Standalone faceted filter (not tied to @tanstack/react-table).
 * Works with a simple `value` (single select string) and `onChange` callback.
 *
 * @param {string} title - Button label
 * @param {Array<{value: string, label: string, icon?: React.ComponentType}>} options
 * @param {string} value - Currently selected value ('' or 'all' means none selected)
 * @param {(value: string) => void} onChange
 */
export function StatusFacetedFilter({ title, options, value, onChange }) {
    const [open, setOpen] = useState(false)
    const isFiltered = value && value !== 'all'

    const selectedOption = options.find((o) => o.value === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <PlusCircledIcon className="mr-2 h-4 w-4" />
                    {title}
                    {isFiltered && selectedOption && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal"
                            >
                                {selectedOption.label}
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList>
                        <CommandEmpty>Không có kết quả nào.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = value === option.value
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            onChange(isSelected ? 'all' : option.value)
                                            setOpen(false)
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                                isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'opacity-50 [&_svg]:invisible',
                                            )}
                                        >
                                            <CheckIcon className={cn('h-4 w-4')} />
                                        </div>
                                        {option.icon && (
                                            <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span>{option.label}</span>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                        {isFiltered && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => {
                                            onChange('all')
                                            setOpen(false)
                                        }}
                                        className="justify-center text-center"
                                    >
                                        Xóa bộ lọc
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
