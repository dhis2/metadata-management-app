import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import {
    SectionedFormSection,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import {
    Section,
    useGivenShemaOrSchemaSectionHandleOrThrow,
    useValidator,
} from '../../../../lib'

export const EventProgramCustomizationFormContents = React.memo(
    function EventProgramCustomizationFormContents({
        name,
        section,
    }: {
        name: string
        section?: Section
    }) {
        const schemaSection = useGivenShemaOrSchemaSectionHandleOrThrow({
            section,
        })
        const reportDateLabelValidator = useValidator({
            schemaSection,
            property: 'incidentDateLabel',
        })

        return (
            <SectionedFormSection name={name}>
                <StandardFormSectionTitle>
                    {i18n.t('Customization')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Override default labels with program-specific terms.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <Field
                        component={InputFieldFF}
                        name="incidentDateLabel"
                        inputWidth="400px"
                        label={i18n.t('Custom label for "Report date"')}
                        helpText={i18n.t(
                            'Used as the default registration date for events'
                        )}
                        dataTest="formfields-incidentDateLabel"
                        validate={reportDateLabelValidator}
                    />
                </StandardFormField>
            </SectionedFormSection>
        )
    }
)
