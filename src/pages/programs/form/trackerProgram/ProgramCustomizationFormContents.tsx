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
    useFeatureAvailable,
    useSchemaSectionHandleOrThrow,
    useValidator,
} from '../../../../lib'
import {
    EnrollmentLabelField,
    EnrollmentsLabelField,
    EventLabelField,
    EventsLabelField,
    ProgramStageLabelField,
    ProgramStagesLabelField,
    FollowUpLabelField,
    OrgUnitLabelField,
    RelationshipLabelField,
    RelationshipsLabelField,
    NoteLabelField,
    NotesLabelField,
    TrackedEntityAttributeLabelField,
    TrackedEntityAttributesLabelField,
} from './fields'

export const ProgramCustomizationFormContents = React.memo(
    function ProgramCustomizationFormContents({ name }: { name: string }) {
        const schemaSection = useSchemaSectionHandleOrThrow()
        const showPluralLabels = useFeatureAvailable(
            FEATURES.customTerminologyPlurals
        )
        const incidentDateLabelValidator = useValidator({
            schemaSection,
            property: 'incidentDateLabel',
        })
        const enrollmentDateLabelValidator = useValidator({
            schemaSection,
            property: 'enrollmentDateLabel',
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
                        label={i18n.t('Custom label for "Incident date"')}
                        helpText={i18n.t(
                            'Used as an additional registration date for enrollments'
                        )}
                        dataTest="formfields-incidentDateLabel"
                        validate={incidentDateLabelValidator}
                    />
                </StandardFormField>

                <StandardFormField>
                    <Field
                        component={InputFieldFF}
                        name="enrollmentDateLabel"
                        inputWidth="400px"
                        label={i18n.t('Custom label for "Enrollment date"')}
                        helpText={i18n.t(
                            'Used as the default registration date for enrollments'
                        )}
                        dataTest="formfields-enrollmentDateLabel"
                        validate={enrollmentDateLabelValidator}
                    />
                </StandardFormField>

                <EnrollmentLabelField />
                {showPluralLabels && <EnrollmentsLabelField />}

                <EventLabelField />
                {showPluralLabels && <EventsLabelField />}

                <ProgramStageLabelField />
                {showPluralLabels && <ProgramStagesLabelField />}

                <FollowUpLabelField />

                <OrgUnitLabelField />

                <RelationshipLabelField />
                {showPluralLabels && <RelationshipsLabelField />}

                <NoteLabelField />
                {showPluralLabels && <NotesLabelField />}

                <TrackedEntityAttributeLabelField />
                {showPluralLabels && <TrackedEntityAttributesLabelField />}
            </SectionedFormSection>
        )
    }
)
