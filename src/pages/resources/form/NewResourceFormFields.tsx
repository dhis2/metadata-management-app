import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF, InputFieldFF, SingleSelectFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field, useField } from 'react-final-form'
import {
    CustomAttributesSection,
    CodeField,
    NameField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionTitle,
} from '../../../components'
import { SCHEMA_SECTIONS } from '../../../lib'
import { ResourceFileField } from './ResourceFileField'
import { ResourceType, resourceTypeOptions } from './resourceSchema'

const section = SCHEMA_SECTIONS.document

export function NewResourceFormFields() {
    const { input: resourceTypeInput } = useField<ResourceType>('resourceType')

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
                    {/* validateOnBlur is on for this app's forms, and a select's
                        onChange alone doesn't blur it - blur manually so the
                        resourceType-conditional url/file requirement revalidates
                        immediately instead of staying stale until another field
                        is blurred. */}
                    <Field name="resourceType">
                        {({ input, meta }) => (
                            <SingleSelectFieldFF
                                required
                                input={{
                                    ...input,
                                    onChange: (value: ResourceType) => {
                                        input.onChange(value)
                                        input.onBlur()
                                    },
                                }}
                                meta={meta}
                                inputWidth="400px"
                                label={i18n.t('Resource type')}
                                dataTest="formfields-resourceType"
                                options={resourceTypeOptions}
                            />
                        )}
                    </Field>
                </StandardFormField>

                {resourceTypeInput.value === ResourceType.URL && (
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
                )}

                {resourceTypeInput.value === ResourceType.FILE && (
                    <>
                        <StandardFormField>
                            <Field
                                component={CheckboxFieldFF}
                                type="checkbox"
                                name="attachment"
                                label={i18n.t('Use the file as an attachment')}
                                dataTest="formfields-attachment"
                            />
                        </StandardFormField>
                        <StandardFormField>
                            <ResourceFileField />
                        </StandardFormField>
                    </>
                )}
            </StandardFormSection>

            <CustomAttributesSection schemaSection={section} />
        </>
    )
}
