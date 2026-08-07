import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import {
    SchemaSection,
    getTrailingWhitespaceWarning,
    useFieldWarning,
    useIsFieldValueUnique,
    useSchema,
} from '../../../lib'
import { useValidator } from '../../../lib/models/useFieldValidators'

export function NameFieldWithAdditionalUniquenessConstraint({
    schemaSection,
    helpText,
    modelId,
    caseSensitiveUniqueness = false,
    additionalNameUniquenessConstraint,
}: {
    helpText?: string
    schemaSection: SchemaSection
    modelId?: string
    caseSensitiveUniqueness?: boolean
    additionalNameUniquenessConstraint?: string
}) {
    const validator = useValidator({
        schemaSection,
        property: 'name',
        modelId,
        caseSensitive: caseSensitiveUniqueness,
        customFilterUniqueness: additionalNameUniquenessConstraint,
    })
    const schema = useSchema(schemaSection.name)
    const propertyDetails = schema.properties['name']
    const { input, meta } = useField<string>('name', {
        validate: async (name?: string) => {
            const validationError = await validator(name)
            const whitespaceWarning = getTrailingWhitespaceWarning(name)
            return validationError && whitespaceWarning
                ? `${validationError} ${whitespaceWarning}`
                : validationError
        },
        validateFields: [],
    })

    const checkNameDuplicate = useIsFieldValueUnique({
        model: schemaSection.namePlural,
        field: 'name',
        message: i18n.t(
            'This name is already in use. Consider updating the name to avoid a duplication.'
        ),
        caseSensitive: caseSensitiveUniqueness,
    })

    const needsUniquenessCheck =
        !propertyDetails.unique && !additionalNameUniquenessConstraint

    const { onChange, validationText, warning } = useFieldWarning(
        meta,
        async (value) => {
            const duplicateWarning = needsUniquenessCheck
                ? await checkNameDuplicate(value)
                : undefined
            const whitespaceWarning = getTrailingWhitespaceWarning(value)
            return duplicateWarning && whitespaceWarning
                ? `${duplicateWarning} ${whitespaceWarning}`
                : duplicateWarning ?? whitespaceWarning
        }
    )

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
            loading={meta.validating}
            dataTest="formfields-name"
            required
            inputWidth="400px"
            label={i18n.t('{{fieldLabel}}', {
                fieldLabel: i18n.t('Name'),
            })}
            helpText={helpText}
            validationText={validationText}
            warning={warning}
        />
    )
}
