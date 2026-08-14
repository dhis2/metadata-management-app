import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import {
    SchemaSection,
    getTrailingWhitespaceWarning,
    useFieldWarning,
} from '../../../lib'
import { useValidator } from '../../../lib/models/useFieldValidators'

export function CodeField({
    schemaSection,
    helpText,
    modelId,
    required = false,
    disabled = false,
}: {
    schemaSection: SchemaSection
    helpText?: string
    modelId?: string
    required?: boolean
    disabled?: boolean
}) {
    const validator = useValidator({ schemaSection, property: 'code', modelId })
    const { input, meta } = useField<string>('code', {
        validate: async (code?: string) => {
            const validationError = await validator(code)
            const whitespaceWarning = getTrailingWhitespaceWarning(code)
            return validationError && whitespaceWarning
                ? `${validationError} ${whitespaceWarning}`
                : validationError
        },
        validateFields: [],
    })
    const { onChange, validationText, warning } = useFieldWarning(
        meta,
        getTrailingWhitespaceWarning
    )

    const helpString = helpText || i18n.t('An optional unique identifier.')

    return (
        <InputFieldFF
            input={{
                ...input,
                onChange: (value: string) => {
                    input.onChange(value)
                    onChange(value)
                },
            }}
            meta={meta}
            dataTest="formfields-code"
            inputWidth="150px"
            label={i18n.t('Code')}
            helpText={helpString}
            required={required}
            disabled={disabled}
            validationText={validationText}
            warning={warning}
        />
    )
}
