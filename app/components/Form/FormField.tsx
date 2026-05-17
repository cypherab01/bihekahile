'use client'

import type { ReactNode } from 'react'

interface Option {
  value: string
  label: string
}

interface BaseProps {
  name: string
  label: string
  helper?: ReactNode
  required?: boolean
}

interface SelectProps extends BaseProps {
  type: 'select'
  options: readonly Option[]
  defaultValue?: string
}

interface NumberProps extends BaseProps {
  type: 'number'
  min?: number
  max?: number
  defaultValue?: number
}

interface TextProps extends BaseProps {
  type: 'text'
  placeholder?: string
  defaultValue?: string
}

type Props = SelectProps | NumberProps | TextProps

export function FormField(props: Props) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink mb-1.5">
        {props.label}
        {!props.required && (
          <span className="ml-1 text-xs font-normal text-ink-soft">
            (optional)
          </span>
        )}
      </span>
      {props.type === 'select' ? (
        <select
          name={props.name}
          defaultValue={props.defaultValue ?? ''}
          required={props.required}
          className="w-full rounded-xl border border-card-border bg-card px-3 py-2.5 text-base shadow-soft focus:outline-none focus:ring-2 focus:ring-marigold appearance-none"
        >
          <option value="" disabled>
            Choose…
          </option>
          {props.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : props.type === 'number' ? (
        <input
          type="number"
          name={props.name}
          min={props.min}
          max={props.max}
          defaultValue={props.defaultValue}
          required={props.required}
          inputMode="numeric"
          className="w-full rounded-xl border border-card-border bg-card px-3 py-2.5 text-base shadow-soft focus:outline-none focus:ring-2 focus:ring-marigold"
        />
      ) : (
        <input
          type="text"
          name={props.name}
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
          maxLength={60}
          className="w-full rounded-xl border border-card-border bg-card px-3 py-2.5 text-base shadow-soft focus:outline-none focus:ring-2 focus:ring-marigold"
        />
      )}
      {props.helper && (
        <span className="mt-1.5 block text-xs text-ink-soft">
          {props.helper}
        </span>
      )}
    </label>
  )
}
