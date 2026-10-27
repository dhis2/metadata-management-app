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
    FEATURES,
    SCHEMA_SECTIONS,
    Section,
    useFeatureAvailable,
    useGivenShemaOrSchemaSectionHandleOrThrow,
    useValidator,
} from '../../../../lib'
import { LabelField } from '../trackerProgram/fields'

export const EventProgramCustomizationFormContents = React.memo(
    function EventProgramCustomizationFormContents({
        name,
        section,
    }: {
        name: string
        section?: Section
    }) {
        useGivenShemaOrSchemaSectionHandleOrThrow({ section })
        const showPluralLabels = useFeatureAvailable(
            FEATURES.customTerminologyPlurals
        )
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
                        label={i18n.t('Custom label for "report date"')}
                        helpText={i18n.t(
                            'Used as the label for the event date (report date) shown in the Capture app'
                        )}
                        dataTest="formfields-executionDateLabel"
                        validate={reportDateLabelValidator}
                    />
                </StandardFormField>

                <LabelField
                    name="eventLabel"
                    label={i18n.t('Custom label for "event" (singular)')}
                    helpText={i18n.t('Example use: Schedule a new event', {
                        nsSeparator: '~:~',
                    })}
                />
                {showPluralLabels && (
                    <LabelField
                        name="eventsLabel"
                        label={i18n.t('Custom label for "events" (plural)')}
                        helpText={i18n.t('Example use: See all events', {
                            nsSeparator: '~:~',
                        })}
                    />
                )}

                <LabelField
                    name="orgUnitLabel"
                    label={i18n.t('Custom label for "organisation unit"')}
                    helpText={i18n.t(
                        'Used to customize the label for the organisation unit that registers the enrollment or event'
                    )}
                />

                <LabelField
                    name="relationshipLabel"
                    label={i18n.t('Custom label for "relationship" (singular)')}
                    helpText={i18n.t(
                        'Used to customize the label for a relationship between tracked entities'
                    )}
                />
                {showPluralLabels && (
                    <LabelField
                        name="relationshipsLabel"
                        label={i18n.t(
                            'Custom label for "relationships" (plural)'
                        )}
                        helpText={i18n.t('Example use: See all relationships', {
                            nsSeparator: '~:~',
                        })}
                    />
                )}

                <LabelField
                    name="noteLabel"
                    label={i18n.t('Custom label for "note" (singular)')}
                    helpText={i18n.t(
                        'Used to customize the label for a note or comment added to an enrollment or event'
                    )}
                />
                {showPluralLabels && (
                    <LabelField
                        name="notesLabel"
                        label={i18n.t('Custom label for "notes" (plural)')}
                        helpText={i18n.t('Example use: See all notes', {
                            nsSeparator: '~:~',
                        })}
                    />
                )}
            </SectionedFormSection>
        )
    }
)
