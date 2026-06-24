import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useFormState } from 'react-final-form'
import {
    SectionedFormSection,
    StandardFormSectionTitle,
    StandardFormSectionDescription,
    StandardFormField,
    NameField,
    CodeField,
    DescriptionField,
    ValueTypeField,
} from '../../../components'
import {
    SECTIONS_MAP,
    useGivenShemaOrSchemaSectionHandleOrThrow,
} from '../../../lib'

export const BasicInfoFormContents = React.memo(
    function OptionSetSetupFormContents({ name }: { name: string }) {
        const schemaSection = useGivenShemaOrSchemaSectionHandleOrThrow({
            section: SECTIONS_MAP.optionSet,
        })
        const { values } = useFormState({ subscription: { values: true } })

        const isEdit = Boolean(values.id)

        return (
            <SectionedFormSection name={name}>
                <StandardFormSectionTitle>
                    {i18n.t('Basic Information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this option set.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <NameField schemaSection={schemaSection} />
                </StandardFormField>

                <StandardFormField>
                    <CodeField schemaSection={schemaSection} />
                </StandardFormField>

                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>

                <StandardFormField>
                    <ValueTypeField
                        disabled={isEdit}
                        disabledText={i18n.t(
                            'Value type cannot be edited after an option set has been created.'
                        )}
                        section={schemaSection}
                    />
                </StandardFormField>
            </SectionedFormSection>
        )
    }
)
