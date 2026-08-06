import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    SectionedFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import { FEATURES, useFeatureAvailable } from '../../../../lib'
import {
    EnrollmentDateLabelField,
    EnrollmentLabelField,
    EnrollmentsLabelField,
    EventLabelField,
    EventsLabelField,
    FollowUpLabelField,
    IncidentDateLabelField,
    NoteLabelField,
    NotesLabelField,
    OrgUnitLabelField,
    ProgramStageLabelField,
    ProgramStagesLabelField,
    RelationshipLabelField,
    RelationshipsLabelField,
    TrackedEntityAttributeLabelField,
    TrackedEntityAttributesLabelField,
} from './fields'

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

                <IncidentDateLabelField />
                <EnrollmentDateLabelField />

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
