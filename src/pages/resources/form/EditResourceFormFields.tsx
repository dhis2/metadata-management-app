import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import {
    CustomAttributesSection,
    CodeField,
    NameField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionTitle,
} from '../../../components'
import { SCHEMA_SECTIONS } from '../../../lib'

const section = SCHEMA_SECTIONS.document

export function EditResourceFormFields() {
    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>

                <StandardFormField>
                    <NameField schemaSection={section} />
                </StandardFormField>
                <StandardFormField>
                    <CodeField schemaSection={section} />
                </StandardFormField>
                <StandardFormField>
                    <Field
                        required
                        component={InputFieldFF}
                        inputWidth="400px"
                        name="url"
                        label={i18n.t('URL')}
                        dataTest="formfields-url"
                    />
                </StandardFormField>
            </StandardFormSection>

            <CustomAttributesSection schemaSection={section} />
        </>
    )
}
