import i18n from '@dhis2/d2-i18n'
import { InputFieldFF, Validator } from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF } from 'react-final-form'
import { SchemaSection } from '../../../../lib'
import { useValidator } from '../../../../lib/models/useFieldValidators'

export function OptionCodeField({
    schemaSection,
    helpText,
    modelId,
    required = false,
    disabled = false,
    additionalCodeUniquenessConstraint,
}: {
    schemaSection: SchemaSection
    helpText?: string
    modelId?: string
    required?: boolean
    disabled?: boolean
    additionalCodeUniquenessConstraint?: string
}) {
    const validator = useValidator({
        schemaSection,
        property: 'code',
        modelId,
        customFilterUniqueness: additionalCodeUniquenessConstraint,
    })

    const helpString = helpText || i18n.t('An optional unique identifier.')

    return (
        <FieldRFF
            component={InputFieldFF}
            dataTest="formfields-code"
            inputWidth="150px"
            name="code"
            label={i18n.t('Code')}
            helpText={helpString}
            validateFields={[]}
            validate={(code?: string) => validator(code)}
            required={required}
            disabled={disabled}
        />
    )
}
