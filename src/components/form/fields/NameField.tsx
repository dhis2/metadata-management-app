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
    const [warning, setWarning] = useState<string | undefined>()

    const checkNameDuplicate = useIsFieldValueUnique({
        model: schemaSection.namePlural,
        field: 'name',
        message: i18n.t(
            'This name is already in use. Consider updating the name to avoid a duplication.'
        ),
        caseSensitive: caseSensitiveUniqueness,
    })
    const uniquenessWarner = propertyDetails.unique
        ? undefined
        : checkNameDuplicate

    return (
        <FieldRFF name="name" validate={validator}>
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
                    dataTest="formfields-name"
                    required
                    inputWidth="400px"
                    label={i18n.t('{{fieldLabel}}', {
                        fieldLabel: i18n.t('Name'),
                    })}
                    helpText={helpText}
                    validationText={
                        meta.touched && meta.invalid ? undefined : warning
                    }
                    warning={!(meta.touched && meta.invalid) && !!warning}
                />
            )}
        </FieldRFF>
    )
}
