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
    const [warning, setWarning] = useState<string | undefined>()

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

    const updateWarning = async (value: string) => {
        const trimWarning = getTrailingWhitespaceWarning(value)
        setWarning(
            trimWarning ??
                (needsUniquenessCheck
                    ? await checkNameDuplicate(value)
                    : undefined)
        )
    }

    return (
        <FieldRFF name="name" validate={validator}>
            {({ input, meta }) => {
                const hasBlockingError = meta.touched && meta.invalid
                return (
                    <InputFieldFF
                        input={{
                            ...input,
                            onChange: (value: string) => {
                                input.onChange(value)
                                updateWarning(value)
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
                        validationText={hasBlockingError ? undefined : warning}
                        warning={!hasBlockingError && !!warning}
                    />
                )
            }}
        </FieldRFF>
    )
}
