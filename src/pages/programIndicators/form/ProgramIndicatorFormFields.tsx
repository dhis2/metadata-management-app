import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    CheckboxFieldFF,
    FieldGroup,
    InputFieldFF,
    RadioFieldFF,
    SingleSelectFieldFF,
} from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF, useField } from 'react-final-form'
import {
    ColorAndIconField,
    CustomAttributesSection,
    DefaultIdentifiableFields,
    DescriptionField,
    ModelTransferField,
    SectionedFormSection,
    SectionedFormSections,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    ExpressionBuilderEntry,
} from '../../../components'
import { PaddedContainer } from '../../../components/ExpressionBuilder/PaddedContainer'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import {
    // Used directly to avoid key collision with PROGRAM_NOTIFICATION_TRIGGER.ENROLLMENT in allConstantTranslations
    ANALYTICS_TYPE,
    getConstantTranslation,
    SECTIONS_MAP,
    useSchema,
    useSectionedFormContext,
    useSyncSelectedSectionWithScroll,
} from '../../../lib'
import { AnalyticsPeriodBoundariesField } from './AnalyticsPeriodBoundariesField'
import { ProgramIndicatorFormDescriptor } from './formDescriptor'
import { OrgUnitField } from './OrgUnitField'

const section = SECTIONS_MAP.programIndicator

export const PROGRAM_INDICATOR_SPECIFIC_TRANSLATIONS: Record<string, string> = {
    EVENT: i18n.t('Event'),
    ENROLLMENT: i18n.t('Enrollment'),
}

export const ProgramIndicatorsFormFields = () => {
    const { input: decimalsInput, meta: decimalsMeta } = useField('decimals', {
        format: (v) => v?.toString(),
        parse: (v) => (v !== undefined && v !== '' ? parseInt(v) : v),
    })
    const { input: programInput } = useField('program')
    const eventField = useField('analyticsType', {
        type: 'radio',
        value: 'EVENT',
    })
    const enrollmentField = useField('analyticsType', {
        type: 'radio',
        value: 'ENROLLMENT',
    })
    useSyncSelectedSectionWithScroll()
    const programFilters = [
        'id,displayName,programType,programTrackedEntityAttributes[trackedEntityAttribute[id,displayName,valueType]]',
    ] as const
    const descriptor =
        useSectionedFormContext<typeof ProgramIndicatorFormDescriptor>()

    const { apiVersion } = useConfig()
    const hasPiDisaggregation = apiVersion >= 42
    const schema = useSchema(SECTIONS_MAP.programIndicator.name)

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
                        'Set up the basic information for this program indicator.'
                    )}
                </StandardFormSectionDescription>
                <DefaultIdentifiableFields section={section} />
                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
                <StandardFormField>
                    <ColorAndIconField />
                </StandardFormField>
            </SectionedFormSection>
            <SectionedFormSection
                name={descriptor.getSection('configuration').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Configuration')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the program and data types this program indicator applies to.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <ModelSingleSelectRefreshableFormField
                        required
                        inputWidth="400px"
                        dataTest="programs-field"
                        name="program"
                        label={i18n.t('Program')}
                        query={{
                            resource: 'programs',
                            params: {
                                fields: programFilters.concat(),
                            },
                        }}
                        section={SECTIONS_MAP.program}
                    />
                </StandardFormField>
                <StandardFormField dataTest="aggregation-type-field">
                    <FieldRFF
                        component={SingleSelectFieldFF}
                        inputWidth="400px"
                        label={i18n.t('Aggregation type')}
                        name="aggregationType"
                        options={
                            schema.properties.aggregationType.constants?.map(
                                (option) => ({
                                    value: option,
                                    label: getConstantTranslation(option),
                                })
                            ) ?? []
                        }
                    />
                </StandardFormField>
                <StandardFormField dataTest="analytics-type-field">
                    <FieldGroup
                        label={i18n.t('Data source')}
                        required
                        dataTest="formfields-analyticsType"
                    >
                        <RadioFieldFF
                            label={`${ANALYTICS_TYPE.EVENT}: ${i18n.t(
                                'Uses data from all events within a program stage'
                            )}`}
                            input={eventField.input}
                            meta={eventField.meta}
                        />
                        <RadioFieldFF
                            label={`${ANALYTICS_TYPE.ENROLLMENT}: ${i18n.t(
                                'Uses data combined from the latest events across the enrollment'
                            )}`}
                            input={enrollmentField.input}
                            meta={enrollmentField.meta}
                        />
                    </FieldGroup>
                </StandardFormField>
                <StandardFormField>
                    <OrgUnitField />
                </StandardFormField>
                <StandardFormField dataTest="decimals-field">
                    <SingleSelectFieldFF
                        input={decimalsInput}
                        meta={decimalsMeta}
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
            <SectionedFormSection
                name={descriptor.getSection('expression').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Expression')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Configure the program indicator expression.')}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <PaddedContainer>
                        <ExpressionBuilderEntry
                            fieldName="expression"
                            title={i18n.t('Edit expression')}
                            editButtonText={i18n.t('Edit expression')}
                            setUpButtonText={i18n.t('Set up expression')}
                            validationResource="programIndicators/expression/description"
                            clearable={true}
                            programId={programInput?.value?.id}
                            programType={programInput?.value?.programType}
                            type="programIndicator"
                            validateSchemaSection={section}
                        />
                    </PaddedContainer>
                </StandardFormField>
            </SectionedFormSection>
            <SectionedFormSection name={descriptor.getSection('filter').name}>
                <StandardFormSectionTitle>
                    {i18n.t('Filter')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Configure a filter to control which data is evaulated by the main expression.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <PaddedContainer>
                        <ExpressionBuilderEntry
                            fieldName="filter"
                            title={i18n.t('Edit filter')}
                            editButtonText={i18n.t('Edit filter')}
                            setUpButtonText={i18n.t('Set up filter')}
                            clearButtonText={i18n.t('Clear filter')}
                            validationResource="programIndicators/filter/description"
                            clearable={true}
                            programId={programInput?.value?.id}
                            programType={programInput?.value?.programType}
                            type="programIndicator"
                            validateSchemaSection={section}
                        />
                    </PaddedContainer>
                </StandardFormField>
            </SectionedFormSection>
            <SectionedFormSection
                name={descriptor.getSection('periodBoundaries').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Period boundaries')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Add time constraints to control which data is evaulated.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <AnalyticsPeriodBoundariesField />
                </StandardFormField>
            </SectionedFormSection>
            <SectionedFormSection
                name={descriptor.getSection('advancedOptions').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Advanced options')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Additional settings for this program indicator.')}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <FieldRFF
                        inputWidth="400px"
                        name="displayInForm"
                        type="checkbox"
                        dataTest="formfields-displayInForm"
                        component={CheckboxFieldFF}
                        label={i18n.t('Show in data entry forms')}
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF
                        dataTest="formfields-aggregateExportCategoryOptionCombo"
                        inputWidth="400px"
                        component={InputFieldFF}
                        name="aggregateExportCategoryOptionCombo"
                        label={i18n.t(
                            'Category option combination for aggregate data export'
                        )}
                        helpText={i18n.t(
                            'Enter a category option combination ID.'
                        )}
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF
                        inputWidth="400px"
                        dataTest="formfields-aggregateExportAttributeOptionCombo"
                        component={InputFieldFF}
                        name="aggregateExportAttributeOptionCombo"
                        label={i18n.t(
                            'Attribute option combination for aggregate data export'
                        )}
                        helpText={i18n.t(
                            'Enter an attribute option combination ID.'
                        )}
                    />
                </StandardFormField>
                {hasPiDisaggregation && (
                    <StandardFormField>
                        <FieldRFF
                            inputWidth="400px"
                            dataTest="formfields-aggregateExportDataElement"
                            component={InputFieldFF}
                            name="aggregateExportDataElement"
                            label={i18n.t(
                                'Data element for aggregate data export'
                            )}
                            helpText={i18n.t('Enter a data element ID.')}
                        />
                    </StandardFormField>
                )}
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
                    <ModelTransferField
                        dataTest="legendSets-field"
                        name="legendSets"
                        query={{
                            resource: 'legendSets',
                            params: {
                                filter: ['name:ne:default'],
                            },
                        }}
                        transferSection={SECTIONS_MAP.legendSet}
                        maxSelections={Infinity}
                    />
                </StandardFormField>
            </SectionedFormSection>
            <CustomAttributesSection schemaSection={section} sectionedLayout />
        </SectionedFormSections>
    )
}
