import i18n from '@dhis2/d2-i18n'
import { createMaxCharacterLength, TextAreaFieldFF } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import { getTrailingWhitespaceWarning, useFieldWarning } from '../../../lib'

const validateMaxLength = createMaxCharacterLength(2000)

export function DescriptionField({ helpText }: { helpText?: string }) {
    const { input, meta } = useField<string>('description', {
        validate: validateMaxLength,
        validateFields: [],
    })
    const { onChange, validationText, warning } = useFieldWarning(
        meta,
        getTrailingWhitespaceWarning
    )

    return (
        <TextAreaFieldFF
            input={{
                ...input,
                onChange: (value: string) => {
                    input.onChange(value)
                    onChange(value)
                },
            }}
            meta={meta}
            dataTest="formfields-description"
            inputWidth="400px"
            label={i18n.t('Description')}
            helpText={helpText}
            validationText={validationText}
            warning={warning}
        />
    )
}
