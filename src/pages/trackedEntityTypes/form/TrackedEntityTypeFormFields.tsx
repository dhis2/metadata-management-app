import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
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
    useSchemaSectionHandleOrThrow,
    useSectionedFormContext,
    useSyncSelectedSectionWithScroll,
    useValidator,
} from '../../../lib'
import {
    AttributesTransferField,
    AttributesConfigurationField,
    AllowAuditLogField,
    MinAttributesRequiredField,
    MaxTeiCountField,
} from '../fields'
import { TrackedEntityTypeFormDescriptor } from './formDescriptor'

export function TrackedEntityTypeFormFields() {
    const schemaSection = useSchemaSectionHandleOrThrow()
    const descriptor =
        useSectionedFormContext<typeof TrackedEntityTypeFormDescriptor>()
    useSyncSelectedSectionWithScroll()
    const showPluralLabels = useFeatureAvailable(
        FEATURES.customTerminologyPlurals
    )
    const trackedEntityTypesLabelValidator = useValidator({
        schemaSection,
        property: 'trackedEntityTypesLabel',
    })

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
                    <StandardFormField>
                        <Field
                            component={InputFieldFF}
                            name="trackedEntityTypesLabel"
                            inputWidth="400px"
                            label={i18n.t('Name (Plural)')}
                            dataTest="formfields-trackedEntityTypesLabel"
                            validate={trackedEntityTypesLabelValidator}
                        />
                    </StandardFormField>
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

                <StandardFormField>
                    <AttributesTransferField />
                </StandardFormField>

                <StandardFormField>
                    <AttributesConfigurationField />
                </StandardFormField>
            </SectionedFormSection>

            <CustomAttributesSection
                schemaSection={SECTIONS_MAP.trackedEntityType}
                sectionedLayout
            />
        </SectionedFormSections>
    )
}
