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

const CONTROL =
  'w-full rounded-lg border border-card-border bg-card px-3 py-2 text-[15px] shadow-soft focus:outline-none focus:ring-2 focus:ring-marigold'

export function FormField(props: Props) {
  return (
    <label className="block">
      <span className="block text-[13px] font-semibold text-ink mb-1 leading-tight">
        {props.label}
        {!props.required && (
          <span className="ml-1 text-[11px] font-normal text-ink-soft">
            (optional)
          </span>
        )}
      </span>
      {props.type === 'select' ? (
        <select
          name={props.name}
          defaultValue={props.defaultValue ?? ''}
          required={props.required}
          className={`${CONTROL} appearance-none`}
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
          className={CONTROL}
        />
      ) : (
        <input
          type="text"
          name={props.name}
          placeholder={props.placeholder}
          defaultValue={props.defaultValue}
          maxLength={60}
          className={CONTROL}
        />
      )}
      {props.helper && (
        <span className="mt-1 block text-[11px] text-ink-soft leading-snug">
          {props.helper}
        </span>
      )}
    </label>
  )
}
