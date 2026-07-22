import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    ColorAndIconField,
    StandardFormField,
    StandardFormSectionTitle,
    StandardFormSectionDescription,
    SectionedFormSections,
    SectionedFormSection,
    CustomAttributesSection,
    DescriptionField,
    FeatureTypeField,
    NameField,
    ShortNameField,
} from '../../../components'
import {
    FEATURES,
    SECTIONS_MAP,
    useFeatureAvailable,
    useGivenShemaOrSchemaSectionHandleOrThrow,
    useSectionedFormContext,
    useSyncSelectedSectionWithScroll,
} from '../../../lib'
import {
    AttributesTransferField,
    AttributesConfigurationField,
    AllowAuditLogField,
    MinAttributesRequiredField,
    MaxTeiCountField,
    TrackedEntityTypesLabelField,
    TrackedEntityAttributeLabelField,
    TrackedEntityAttributesLabelField,
} from '../fields'
import { TrackedEntityTypeFormDescriptor } from './formDescriptor'

export function TrackedEntityTypeFormFields() {
    const section = SECTIONS_MAP.trackedEntityType
    const schemaSection = useGivenShemaOrSchemaSectionHandleOrThrow({ section })
    const descriptor =
        useSectionedFormContext<typeof TrackedEntityTypeFormDescriptor>()
    useSyncSelectedSectionWithScroll()
    const showPluralLabels = useFeatureAvailable(
        FEATURES.customTerminologyPlurals
    )

    return (
        <SectionedFormSections>
            <SectionedFormSection
                name={descriptor.getSection('basicInformation').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this tracked entity type.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <NameField schemaSection={schemaSection} />
                </StandardFormField>

                {showPluralLabels && (
                    <TrackedEntityTypesLabelField section={schemaSection} />
                )}

                <StandardFormField>
                    <ShortNameField schemaSection={schemaSection} />
                </StandardFormField>

                <StandardFormField>
                    <ColorAndIconField />
                </StandardFormField>

                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>

                <StandardFormField>
                    <FeatureTypeField />
                </StandardFormField>

                <StandardFormField>
                    <AllowAuditLogField />
                </StandardFormField>

                <StandardFormField>
                    <MinAttributesRequiredField />
                </StandardFormField>

                <StandardFormField>
                    <MaxTeiCountField />
                </StandardFormField>
            </SectionedFormSection>

            <SectionedFormSection
                name={descriptor.getSection('trackedEntityAttributes').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Tracked entity attributes')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose and configure what data can be collected for this tracked entity type.'
                    )}
                </StandardFormSectionDescription>

                <TrackedEntityAttributeLabelField section={schemaSection} />

                {showPluralLabels && (
                    <TrackedEntityAttributesLabelField section={schemaSection} />
                )}

                <StandardFormField>
                    <AttributesTransferField />
                </StandardFormField>

                <StandardFormField>
                    <AttributesConfigurationField />
                </StandardFormField>
            </SectionedFormSection>

            <CustomAttributesSection schemaSection={section} sectionedLayout />
        </SectionedFormSections>
    )
}
