import i18n from '@dhis2/d2-i18n'
import { SingleSelectFieldFF, CheckboxFieldFF, InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF, useField } from 'react-final-form'
import {
    ColorAndIconField,
    CustomAttributesSection,
    DefaultIdentifiableFields,
    DescriptionField,
    GroupMembershipField,
    ModelTransferField,
    SectionedFormSection,
    SectionedFormSections,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import {
    SECTIONS_MAP,
    useSectionedFormContext,
    useSyncSelectedSectionWithScroll,
} from '../../../lib'
import { IndicatorFormDescriptor } from './formDescriptor'
import { IndicatorTypeField } from './IndicatorTypeField'
import { NumeratorDenominatorFields } from './NumeratorDenominatorFields'

const section = SECTIONS_MAP.indicator

export const IndicatorFormFields = () => {
    const { input: decimalsInput, meta: decimalsMeta } = useField('decimals', {
        format: (v) => v?.toString(),
        parse: (v) => (v !== undefined && v !== '' ? parseInt(v) : v),
    })
    const descriptor = useSectionedFormContext<typeof IndicatorFormDescriptor>()
    useSyncSelectedSectionWithScroll()

    return (
        <SectionedFormSections>
            <SectionedFormSection
                name={descriptor.getSection('basicInformation').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t('Set up the basic information for this indicator.')}
                </StandardFormSectionDescription>

                <DefaultIdentifiableFields />

                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>

                <StandardFormField>
                    <FieldRFF
                        component={InputFieldFF}
                        inputWidth="400px"
                        name="url"
                        dataTest="formfields-url"
                        type="url"
                        label={i18n.t('URL')}
                    />
                </StandardFormField>

                <StandardFormField>
                    <ColorAndIconField />
                </StandardFormField>
            </SectionedFormSection>
            <SectionedFormSection
                name={descriptor.getSection('expressions').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Calculation details')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t(
                        'Define how the indicator is calculated and how the result is displayed.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <NumeratorDenominatorFields
                        fieldName="numerator"
                        objectName={i18n.t('Numerator')}
                        validationResource={'indicators/expression/description'}
                    />
                </StandardFormField>
                <StandardFormField>
                    <NumeratorDenominatorFields
                        fieldName="denominator"
                        objectName={i18n.t('Denominator')}
                        validationResource={'indicators/expression/description'}
                    />
                </StandardFormField>

                <StandardFormField>
                    <IndicatorTypeField
                        helpText={i18n.t(
                            'Choose how the indicator result should be shown.'
                        )}
                    />
                </StandardFormField>

                <StandardFormField>
                    <FieldRFF
                        name="annualized"
                        type="checkbox"
                        dataTest="formfields-annualized"
                        component={CheckboxFieldFF}
                        label={i18n.t('Use annualized calculation')}
                    />
                </StandardFormField>

                <StandardFormField>
                    <SingleSelectFieldFF
                        input={decimalsInput}
                        meta={decimalsMeta}
                        dataTest="decimals-field"
                        label={i18n.t('Decimal places in output')}
                        inputWidth="400px"
                        options={[
                            { label: i18n.t('<No value>'), value: '' },
                            ...[0, 1, 2, 3, 4, 5].map((d) => ({
                                label: d.toString(),
                                value: d.toString(),
                            })),
                        ]}
                    />
                </StandardFormField>
            </SectionedFormSection>
            <SectionedFormSection name={descriptor.getSection('legends').name}>
                <StandardFormSectionTitle>
                    {i18n.t('Legends')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose legends to visually categorize values in data entry and analytics apps.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    {/*this still has the new text and not the old one*/}

                    <ModelTransferField
                        dataTest="legendSets-field"
                        name="legendSets"
                        leftHeader={i18n.t('Available legends')}
                        rightHeader={i18n.t('Selected legends')}
                        filterPlaceholder={i18n.t('Filter available legends')}
                        filterPlaceholderPicked={i18n.t(
                            'Filter selected legends'
                        )}
                        query={{
                            resource: 'legendSets',
                            params: {
                                filter: ['name:ne:default'],
                                fields: ['id', 'displayName'],
                            },
                        }}
                        enableOrderChange={true}
                    />
                </StandardFormField>
            </SectionedFormSection>
            <SectionedFormSection name={descriptor.getSection('groups').name}>
                <StandardFormSectionTitle>
                    {i18n.t('Groups')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Choose the groups this indicator belongs to.')}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <GroupMembershipField resource="indicatorGroups" />
                </StandardFormField>
            </SectionedFormSection>
            <SectionedFormSection
                name={descriptor.getSection('mappingSettings').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Aggregate data export mapping')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t(
                        'Map this indicator to category and attribute option combinations used when exporting aggregate data.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <FieldRFF<string | undefined>
                        inputWidth="400px"
                        dataTest="formfields-aggregateExportCategoryOptionCombo"
                        name="aggregateExportCategoryOptionCombo"
                        label={i18n.t(
                            'Category option combination for aggregate data export'
                        )}
                        helpText={i18n.t(
                            'Enter a category option combination ID.'
                        )}
                        component={InputFieldFF}
                    />
                </StandardFormField>

                <StandardFormField>
                    <FieldRFF<string | undefined>
                        component={InputFieldFF}
                        dataTest="formfields-aggregateExportAttributeOptionCombo"
                        name="aggregateExportAttributeOptionCombo"
                        inputWidth="400px"
                        label={i18n.t(
                            'Attribute option combination for aggregate data export'
                        )}
                        helpText={i18n.t(
                            'Enter an attribute option combination ID.'
                        )}
                    />
                </StandardFormField>
            </SectionedFormSection>
            <CustomAttributesSection schemaSection={section} sectionedLayout />
        </SectionedFormSections>
    )
}
