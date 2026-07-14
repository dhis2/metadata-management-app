import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React, { useState } from 'react'
import { Field as FieldRFF } from 'react-final-form'
import {
    SchemaSection,
    getTrailingWhitespaceWarning,
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
    const [warning, setWarning] = useState<string | undefined>()

    const checkShortNameDuplicate = useIsFieldValueUnique({
        model: schemaSection.namePlural,
        field: 'shortName',
        message: i18n.t(
            'This short name is already in use. Consider updating the name to avoid a duplication.'
        ),
        caseSensitive: caseSensitiveUniqueness,
    })
    const uniquenessWarner = propertyDetails.unique
        ? undefined
        : checkShortNameDuplicate

    const helpString =
        helpText ||
        i18n.t(
            'A short, unique name. Displayed in analytics apps where space is limited, depending on user or system settings.'
        )

    return (
        <FieldRFF name="shortName" validate={validator}>
            {({ input, meta }) => (
                <InputFieldFF
                    input={{
                        ...input,
                        onChange: async (value: string) => {
                            input.onChange(value)
                            const trimWarning =
                                getTrailingWhitespaceWarning(value)
                            if (trimWarning) {
                                setWarning(trimWarning)
                                return
                            }
                            setWarning(
                                uniquenessWarner
                                    ? await uniquenessWarner(value)
                                    : undefined
                            )
                        },
                    }}
                    meta={meta}
                    loading={meta.validating}
                    validateFields={[]}
                    dataTest="formfields-shortName"
                    required={isRequired}
                    inputWidth="400px"
                    label={i18n.t('Short name')}
                    helpText={helpString}
                    validationText={
                        meta.touched && meta.invalid ? undefined : warning
                    }
                    warning={!(meta.touched && meta.invalid) && !!warning}
                />
            )}
        </FieldRFF>
    )
}
