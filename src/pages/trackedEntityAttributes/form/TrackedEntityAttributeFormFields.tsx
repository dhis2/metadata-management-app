import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF, useField } from 'react-final-form'
import {
    AggregationTypeFieldByValueType,
    CodeField,
    DescriptionField,
    ModelTransferField,
    NameField,
    SectionedFormSection,
    ShortNameField,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    ValueTypeField,
} from '../../../components'
import { FEATURES, SECTIONS_MAP, useFeatureAvailable } from '../../../lib'
import { TrackedEntityAttribute } from '../../../types/generated'
import {
    BlockedSearchOperatorsField,
    FieldMaskField,
    FormNameField,
    InheritField,
    MinCharactersToSearchField,
    OptionSetField,
    PatternField,
    PreferredSearchOperatorField,
    TrackedEntityTypeField,
    TrigramIndexableField,
    UniqueRadioFields,
} from '../fields'

export const TrackedEntityAttributeFormFields = ({
    basicSectionName,
    dataCollectionSectionName,
    dataHandlingSectionName,
    searchPerformanceSectionName,
    legendsSectionName,
}: {
    basicSectionName: string
    dataCollectionSectionName: string
    dataHandlingSectionName: string
    searchPerformanceSectionName?: string
    legendsSectionName: string
}) => {
    const section = SECTIONS_MAP.trackedEntityAttribute
    const { input: valueTypeInput } = useField('valueType')
    const { input: uniqueInput } = useField('unique')
    const { input: orgunitScopeInput } = useField('orgunitScope')
    const { input: generatedInput } = useField('generated')

    const valueType = valueTypeInput.value
    const isSkipAnalyticsAvailable = useFeatureAvailable(FEATURES.skipAnalytics)
    const isUnique = uniqueInput.value
    const isOrgunitScope = orgunitScopeInput.value
    const isGenerated = generatedInput.value
    const showTrackedEntityType =
        valueType === TrackedEntityAttribute.valueType.TRACKER_ASSOCIATE

    const uniqueDisabled =
        valueType === TrackedEntityAttribute.valueType.TRACKER_ASSOCIATE ||
        valueType === TrackedEntityAttribute.valueType.USERNAME

    const isSearchPerformanceSectionAvailable = useFeatureAvailable(
        FEATURES.searchPerformance
    )

    return (
        <>
            <SectionedFormSection name={basicSectionName}>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this tracked entity attribute.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <NameField
                        schemaSection={section}
                        caseSensitiveUniqueness={true}
                    />
                </StandardFormField>

                <StandardFormField>
                    <FormNameField />
                </StandardFormField>

                <StandardFormField>
                    <ShortNameField
                        schemaSection={section}
                        caseSensitiveUniqueness={true}
                    />
                </StandardFormField>

                <StandardFormField>
                    <CodeField schemaSection={section} />
                </StandardFormField>

                <StandardFormField>
                    <DescriptionField
                        helpText={i18n.t(
                            'Used to provide more information when collecting data.'
                        )}
                    />
                </StandardFormField>
            </SectionedFormSection>

            <SectionedFormSection name={dataCollectionSectionName}>
                <StandardFormSectionTitle>
                    {i18n.t('Data collection')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        "Configure how this tracked entity attribute's data is collected."
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <OptionSetField />
                </StandardFormField>

                <StandardFormField>
                    <ValueTypeField section={section} />
                </StandardFormField>

                {showTrackedEntityType && (
                    <StandardFormField>
                        <TrackedEntityTypeField />
                    </StandardFormField>
                )}

                <StandardFormField>
                    <FieldRFF
                        component={CheckboxFieldFF}
                        dataTest="formfields-unique"
                        name="unique"
                        label={i18n.t('Unique values only')}
                        type="checkbox"
                        disabled={uniqueDisabled}
                        validateFields={[]}
                    />
                </StandardFormField>

                {isUnique && !uniqueDisabled && (
                    <StandardFormField>
                        <div style={{ marginLeft: '24px' }}>
                            <UniqueRadioFields />
                        </div>
                    </StandardFormField>
                )}

                {isUnique && !isOrgunitScope && (
                    <StandardFormField>
                        <FieldRFF
                            component={CheckboxFieldFF}
                            dataTest="formfields-generated"
                            name="generated"
                            label={i18n.t('Automatically generate values')}
                            type="checkbox"
                            validateFields={[]}
                        />
                    </StandardFormField>
                )}

                {isGenerated && (
                    <StandardFormField>
                        <div style={{ marginLeft: '24px' }}>
                            <PatternField />
                        </div>
                    </StandardFormField>
                )}

                <StandardFormField>
                    <FieldMaskField />
                </StandardFormField>
            </SectionedFormSection>

            <SectionedFormSection name={dataHandlingSectionName}>
                <StandardFormSectionTitle>
                    {i18n.t('Data handling')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Configure how values are displayed, inherited, and synchronized.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <InheritField />
                </StandardFormField>

                <StandardFormField>
                    <FieldRFF
                        component={CheckboxFieldFF}
                        dataTest="formfields-displayInListNoProgram"
                        name="displayInListNoProgram"
                        label={i18n.t(
                            'Show in lists and search results when no program is selected'
                        )}
                        type="checkbox"
                        validateFields={[]}
                    />
                </StandardFormField>

                <StandardFormField>
                    <FieldRFF
                        component={CheckboxFieldFF}
                        dataTest="formfields-skipSynchronization"
                        name="skipSynchronization"
                        label={i18n.t(
                            'Skip synchronization for this attribute and its values'
                        )}
                        type="checkbox"
                        validateFields={[]}
                    />
                </StandardFormField>

                {isSkipAnalyticsAvailable && (
                    <StandardFormField>
                        <FieldRFF
                            component={CheckboxFieldFF}
                            dataTest="formfields-skipAnalytics"
                            name="skipAnalytics"
                            label={i18n.t(
                                'Do not expose this attribute in analytics'
                            )}
                            helpText={i18n.t(
                                'When enabled, this tracked entity attribute is excluded from all analytics processing, including analytics tables and analytics apps.'
                            )}
                            type="checkbox"
                            validateFields={[]}
                        />
                    </StandardFormField>
                )}

                <StandardFormField>
                    <AggregationTypeFieldByValueType section={section} />
                </StandardFormField>
            </SectionedFormSection>

            {isSearchPerformanceSectionAvailable &&
                searchPerformanceSectionName && (
                    <SectionedFormSection name={searchPerformanceSectionName}>
                        <StandardFormSectionTitle>
                            {i18n.t('Search performance')}
                        </StandardFormSectionTitle>
                        <StandardFormSectionDescription>
                            {i18n.t(
                                'Adjust how this attribute is searched to balance performance and accuracy.'
                            )}
                        </StandardFormSectionDescription>

                        <StandardFormField>
                            <PreferredSearchOperatorField />
                        </StandardFormField>

                        <StandardFormField>
                            <BlockedSearchOperatorsField />
                        </StandardFormField>

                        <StandardFormField>
                            <MinCharactersToSearchField />
                        </StandardFormField>

                        <TrigramIndexableField />
                    </SectionedFormSection>
                )}

            <SectionedFormSection name={legendsSectionName}>
                <StandardFormSectionTitle>
                    {i18n.t('Legends')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose legends to visually categorize values in analytics apps.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <ModelTransferField
                        dataTest="legendSets-field"
                        name="legendSets"
                        query={{
                            resource: 'legendSets',
                            params: {
                                fields: ['id', 'displayName'],
                            },
                        }}
                        leftHeader={i18n.t('Available legends')}
                        rightHeader={i18n.t('Selected legends')}
                        filterPlaceholder={i18n.t('Filter available legends')}
                        filterPlaceholderPicked={i18n.t(
                            'Filter selected legends'
                        )}
                        enableOrderChange={true}
                        maxSelections={Infinity}
                    />
                </StandardFormField>
            </SectionedFormSection>
        </>
    )
}
