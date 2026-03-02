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

const DataTableFacetedFilter = ({ column, title, options }) => {
    const facets = column?.getFacetedUniqueValues()
    const selectedValues = new Set(column?.getFilterValue() || [])

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed border-green-300 hover:bg-green-50 hover:text-green-700">
                    <PlusCircledIcon className="mr-2 h-4 w-4 text-green-600" />
                    {title}
                    {selectedValues?.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4 bg-green-200" />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden bg-green-100 text-green-700"
                            >
                                {selectedValues.size}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selectedValues.size > 2 ? (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal bg-green-100 text-green-700 hover:bg-green-200"
                                    >
                                        {selectedValues.size} đã chọn
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option) => selectedValues.has(option.value))
                                        .map((option) => (
                                            <Badge
                                                variant="secondary"
                                                key={option.value}
                                                className="rounded-sm px-1 font-normal bg-green-100 text-green-700 hover:bg-green-200"
                                            >
                                                {option.label}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 border-green-200" align="start">
                <Command>
                    <CommandInput placeholder={title} className="focus-visible:ring-green-500" />
                    <CommandList>
                        <CommandEmpty>Không có kết quả nào.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selectedValues.has(option.value)
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            if (isSelected) {
                                                selectedValues.delete(option.value)
                                            } else {
                                                selectedValues.add(option.value)
                                            }
                                            const filterValues = Array.from(selectedValues)
                                            column?.setFilterValue(
                                                filterValues.length ? filterValues : undefined,
                                            )
                                        }}
                                        className="aria-selected:bg-green-50"
                                    >
                                        <div
                                            className={cn(
                                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-green-600',
                                                isSelected
                                                    ? 'bg-green-600 text-white'
                                                    : 'opacity-50 [&_svg]:invisible',
                                            )}
                                        >
                                            <CheckIcon className={cn('h-4 w-4')} />
                                        </div>
                                        {option.icon && (
                                            <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span>{option.label}</span>
                                        {facets?.get(option.value) && (
                                            <span className="font-mono ml-auto flex h-4 w-4 items-center justify-center text-xs">
                                                {facets.get(option.value)}
                                            </span>
                                        )}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                        {selectedValues.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => column?.setFilterValue(undefined)}
                                        className="justify-center text-center text-green-600 hover:bg-green-50 aria-selected:bg-green-50"
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

export { DataTableFacetedFilter }
