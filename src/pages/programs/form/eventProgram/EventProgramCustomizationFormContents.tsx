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
    SCHEMA_SECTIONS,
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
        useGivenShemaOrSchemaSectionHandleOrThrow({ section })
        const reportDateLabelValidator = useValidator({
            schemaSection: SCHEMA_SECTIONS.programStage,
            property: 'executionDateLabel',
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
                        name="programStages[0].executionDateLabel"
                        inputWidth="400px"
                        label={i18n.t('Custom label for "Report date"')}
                        helpText={i18n.t(
                            'Used as the label for the event date (report date) shown in the Capture app'
                        )}
                        dataTest="formfields-executionDateLabel"
                        validate={reportDateLabelValidator}
                    />
                </StandardFormField>
            </SectionedFormSection>
        )
    }
)
