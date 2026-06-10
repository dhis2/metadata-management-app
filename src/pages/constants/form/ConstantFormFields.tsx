import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import {
    CustomAttributesSection,
    DefaultIdentifiableFields,
    DescriptionField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import { SECTIONS_MAP } from '../../../lib'

function ConstantFormFields() {
    const section = SECTIONS_MAP.constant
    const { input, meta } = useField('value', {
        type: 'number',
        format: (value) => value?.toString(),
    })

    return (
        <StandardFormSection>
            <StandardFormSectionTitle>
                {i18n.t('Basic information')}
            </StandardFormSectionTitle>
            <StandardFormSectionDescription>
                {i18n.t('Set up the basic information for this constant.')}
            </StandardFormSectionDescription>

            <DefaultIdentifiableFields section={section} />

            <StandardFormField>
                <DescriptionField />
            </StandardFormField>

            <StandardFormField>
                <InputFieldFF
                    input={input}
                    meta={meta}
                    inputWidth="400px"
                    dataTest="formfields-value"
                    type="number"
                    label={i18n.t('Value')}
                    required
                    helpText={i18n.t(
                        'The numeric value to be used as the constant.'
                    )}
                />
            </StandardFormField>

            <CustomAttributesSection schemaSection={section} />
        </StandardFormSection>
    )
}

export default ConstantFormFields
