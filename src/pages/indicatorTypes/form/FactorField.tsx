import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React, { useState } from 'react'
import { useField } from 'react-final-form'
import { useIsFieldValueUnique, SchemaSection } from '../../../lib'
import { useValidator } from '../../../lib/models/useFieldValidators'

export const FactorField = ({
    schemaSection,
}: {
    schemaSection: SchemaSection
}) => {
    const fieldName = 'factor'
    const validate = useValidator({ schemaSection, property: 'factor' })
    const [warning, setWarning] = useState<string | undefined>()
    const checkFactorDuplicate = useIsFieldValueUnique({
        model: schemaSection.namePlural,
        field: 'factor',
        message: i18n.t('An indicator type with this factor already exists'),
    })

    const { input, meta } = useField(fieldName, {
        validate,
        type: 'number',
        format: (value) => value?.toString(),
    })

    return (
        <InputFieldFF
            input={{
                ...input,
                onChange: async (value: string) => {
                    input.onChange(value)
                    if (meta.initial?.toString() !== value) {
                        const warning = await checkFactorDuplicate(value)
                        setWarning(warning)
                    }
                },
            }}
            meta={meta}
            warning={!!warning}
            validationText={warning}
            inputWidth="400px"
            label={i18n.t('Factor')}
            required
            dataTest="formfields-factor"
        />
    )
}
