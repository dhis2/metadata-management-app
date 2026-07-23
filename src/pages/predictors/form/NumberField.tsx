import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { FieldMetaState, useField } from 'react-final-form'

export const NumberField = ({
    fieldName,
    label,
    helpText,
    required = false,
    defaultValue = 0,
}: {
    fieldName: string
    label: string
    helpText?: string
    required?: boolean
    defaultValue?: number
}) => {
    const fallbackValue = required ? defaultValue : undefined
    const { input, meta } = useField(fieldName, {
        parse: (value?: string) =>
            value === undefined || value === ''
                ? fallbackValue
                : Number.parseFloat(value),
        type: 'number',
        format: (value) => value?.toString(),
    })

    return (
        <InputFieldFF
            input={input}
            meta={meta as unknown as FieldMetaState<string | undefined>}
            inputWidth="250px"
            label={label}
            helpText={helpText}
            required={required}
            dataTest={`formfields-${fieldName}`}
        />
    )
}
