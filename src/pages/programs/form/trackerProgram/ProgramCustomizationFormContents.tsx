import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    SectionedFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import { FEATURES, useFeatureAvailable } from '../../../../lib'
import { LabelField } from './fields'

export const ProgramCustomizationFormContents = React.memo(
    function ProgramCustomizationFormContents({ name }: { name: string }) {
        const showPluralLabels = useFeatureAvailable(
            FEATURES.customTerminologyPlurals
        )

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

                <LabelField
                    name="incidentDateLabel"
                    label={i18n.t('Custom label for "Incident date"')}
                    helpText={i18n.t(
                        'Used as an additional registration date for enrollments'
                    )}
                />
                <LabelField
                    name="enrollmentDateLabel"
                    label={i18n.t('Custom label for "Enrollment date"')}
                    helpText={i18n.t(
                        'Used as the default registration date for enrollments'
                    )}
                />

                <LabelField
                    name="enrollmentLabel"
                    label={i18n.t('Custom label for "Enrollment"')}
                    helpText={i18n.t(
                        'Example use: See all data in this enrollment',
                        { nsSeparator: '~:~' }
                    )}
                />
                {showPluralLabels && (
                    <LabelField
                        name="enrollmentsLabel"
                        label={i18n.t('Custom label for "Enrollment" (plural)')}
                        helpText={i18n.t('Example use: See all enrollments', {
                            nsSeparator: '~:~',
                        })}
                    />
                )}

                <LabelField
                    name="eventLabel"
                    label={i18n.t('Custom label for "Event"')}
                    helpText={i18n.t('Example use: Schedule a new event', {
                        nsSeparator: '~:~',
                    })}
                />
                {showPluralLabels && (
                    <LabelField
                        name="eventsLabel"
                        label={i18n.t('Custom label for "Event" (plural)')}
                        helpText={i18n.t('Example use: See all events', {
                            nsSeparator: '~:~',
                        })}
                    />
                )}

                <LabelField
                    name="programStageLabel"
                    label={i18n.t('Custom label for "Program stage"')}
                    helpText={i18n.t(
                        'Example use: See all data in this program stage',
                        { nsSeparator: '~:~' }
                    )}
                />
                {showPluralLabels && (
                    <LabelField
                        name="programStagesLabel"
                        label={i18n.t(
                            'Custom label for "Program stage" (plural)'
                        )}
                        helpText={i18n.t(
                            'Example use: See all program stages',
                            { nsSeparator: '~:~' }
                        )}
                    />
                )}

                <LabelField
                    name="followUpLabel"
                    label={i18n.t('Custom label for "Follow-up"')}
                    helpText={i18n.t(
                        'Used to customize the label for a follow-up event or activity'
                    )}
                />

                <LabelField
                    name="orgUnitLabel"
                    label={i18n.t('Custom label for "Registering unit"')}
                    helpText={i18n.t(
                        'Used to customize the label for the organisation unit that registers the enrollment or event'
                    )}
                />

                <LabelField
                    name="relationshipLabel"
                    label={i18n.t('Custom label for "Relationship"')}
                    helpText={i18n.t(
                        'Used to customize the label for a relationship between tracked entities'
                    )}
                />
                {showPluralLabels && (
                    <LabelField
                        name="relationshipsLabel"
                        label={i18n.t(
                            'Custom label for "Relationship" (plural)'
                        )}
                        helpText={i18n.t(
                            'Example use: See all relationships',
                            { nsSeparator: '~:~' }
                        )}
                    />
                )}

                <LabelField
                    name="noteLabel"
                    label={i18n.t('Custom label for "Note"')}
                    helpText={i18n.t(
                        'Used to customize the label for a note or comment added to an enrollment or event'
                    )}
                />
                {showPluralLabels && (
                    <LabelField
                        name="notesLabel"
                        label={i18n.t('Custom label for "Note" (plural)')}
                        helpText={i18n.t('Example use: See all notes', {
                            nsSeparator: '~:~',
                        })}
                    />
                )}

                <LabelField
                    name="trackedEntityAttributeLabel"
                    label={i18n.t('Custom label for "Attribute"')}
                    helpText={i18n.t(
                        'Used to customize the label for a tracked entity attribute'
                    )}
                />
                {showPluralLabels && (
                    <LabelField
                        name="trackedEntityAttributesLabel"
                        label={i18n.t('Custom label for "Attribute" (plural)')}
                        helpText={i18n.t('Example use: See all attributes', {
                            nsSeparator: '~:~',
                        })}
                    />
                )}
            </SectionedFormSection>
        )
    }
)
