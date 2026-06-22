import { Input, InputProps } from '@dhis2/ui'
import React from 'react'
import { FieldRenderProps } from 'react-final-form'
import { FieldWrapper } from '../../form'

type FinalFormFieldProps = Pick<FieldRenderProps<string>, 'input' | 'meta'>

export type TimeFieldProps = {
    // this is not exposed in CalendarInputProps - but it should be
    label?: string
    required?: boolean
} & FinalFormFieldProps

export function TimeFieldFF({ meta, input, label, required }: TimeFieldProps) {
    return (
        <FieldWrapper meta={meta} {...input} label={label} required={required}>
            <TimeInput
                name={input.name}
                onChange={(payload) => input.onChange(payload.value)}
                value={input.value}
                clearable
            />
        </FieldWrapper>
    )
}

export const TimeInput = (inputProps: InputProps) => {
    return <Input {...inputProps} type="time" />
}
