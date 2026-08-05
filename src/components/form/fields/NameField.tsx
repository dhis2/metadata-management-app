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

export function NameField({
    schemaSection,
    helpText,
    modelId,
    caseSensitiveUniqueness = false,
}: {
    helpText?: string
    schemaSection: SchemaSection
    modelId?: string
    caseSensitiveUniqueness?: boolean
}) {
    const validator = useValidator({
        schemaSection,
        property: 'name',
        modelId,
        caseSensitive: caseSensitiveUniqueness,
    })
    const schema = useSchema(schemaSection.name)
    const propertyDetails = schema.properties['name']
    const { input, meta } = useField<string>('name', {
        validate: validator,
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
    const needsUniquenessCheck = !propertyDetails.unique

    const { onChange, validationText, warning } = useFieldWarning(
        meta,
        async (value) =>
            (needsUniquenessCheck
                ? await checkNameDuplicate(value)
                : undefined) ?? getTrailingWhitespaceWarning(value)
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
