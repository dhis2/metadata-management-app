import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React, { useState } from 'react'
import { Field as FieldRFF } from 'react-final-form'
import { SchemaSection, getTrailingWhitespaceWarning } from '../../../lib'
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
    const [warning, setWarning] = useState<string | undefined>()

    const helpString = helpText || i18n.t('An optional unique identifier.')

    return (
        <FieldRFF
            name="code"
            validateFields={[]}
            validate={(code?: string) => validator(code)}
        >
            {({ input, meta }) => {
                const hasBlockingError = meta.touched && meta.invalid
                return (
                    <InputFieldFF
                        input={{
                            ...input,
                            onChange: (value: string) => {
                                input.onChange(value)
                                setWarning(getTrailingWhitespaceWarning(value))
                            },
                        }}
                        meta={meta}
                        dataTest="formfields-code"
                        inputWidth="150px"
                        label={i18n.t('Code')}
                        helpText={helpString}
                        required={required}
                        disabled={disabled}
                        validationText={hasBlockingError ? undefined : warning}
                        warning={!hasBlockingError && !!warning}
                    />
                )
            }}
        </FieldRFF>
    )
}
