import { useEffect, useState } from 'react'
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Controller } from 'react-hook-form'

const thousandSeparator = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function MoneyInput({
  control,
  name,
  label,
  required = false,
  placeholder = '0',
  description = '',
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, value, ...field },
        fieldState: { error },
      }) => {
        const [displayValue, setDisplayValue] = useState('')

        useEffect(() => {
          if (value != null && value !== '') {
            setDisplayValue(thousandSeparator(value))
          } else {
            setDisplayValue('')
          }
        }, [value])

        const handleChange = (e) => {
          const rawValue = e.target.value.replace(/\./g, '')
          const numValue = rawValue === '' ? '' : Number(rawValue)

          setDisplayValue(rawValue ? thousandSeparator(rawValue) : '')
          onChange(numValue)
        }

        return (
          <FormItem className="mb-2 space-y-1">
            <FormLabel required={required}>{label}</FormLabel>
            <FormControl>
              <Input
                className="font-medium"
                placeholder={placeholder}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                {...field}
              />
            </FormControl>
            {description && (
              <FormDescription className="text-primary">
                {description}
              </FormDescription>
            )}
            {error && <FormMessage>{error.message}</FormMessage>}
          </FormItem>
        )
      }}
    />
  )
}
