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

export function ShortNameField({
    helpText,
    schemaSection,
    isRequired = true,
    caseSensitiveUniqueness = false,
}: {
    helpText?: string
    schemaSection: SchemaSection
    isRequired?: boolean
    caseSensitiveUniqueness?: boolean
}) {
    const validator = useValidator({
        schemaSection,
        property: 'shortName',
        caseSensitive: caseSensitiveUniqueness,
    })
    const schema = useSchema(schemaSection.name)
    const propertyDetails = schema.properties['shortName']
    const { input, meta } = useField<string>('shortName', {
        validate: validator,
        validateFields: [],
    })

    const checkShortNameDuplicate = useIsFieldValueUnique({
        model: schemaSection.namePlural,
        field: 'shortName',
        message: i18n.t(
            'This short name is already in use. Consider updating the name to avoid a duplication.'
        ),
        caseSensitive: caseSensitiveUniqueness,
    })
    const needsUniquenessCheck = !propertyDetails.unique

    const { onChange, validationText, warning } = useFieldWarning(
        meta,
        async (value) =>
            getTrailingWhitespaceWarning(value) ??
            (needsUniquenessCheck
                ? await checkShortNameDuplicate(value)
                : undefined)
    )

    const helpString =
        helpText ||
        i18n.t(
            'A short, unique name. Displayed in analytics apps where space is limited, depending on user or system settings.'
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
            dataTest="formfields-shortName"
            required={isRequired}
            inputWidth="400px"
            label={i18n.t('Short name')}
            helpText={helpString}
            validationText={validationText}
            warning={warning}
        />
    )
}
