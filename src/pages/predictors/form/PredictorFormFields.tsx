import i18n from '@dhis2/d2-i18n'
import { SingleSelectFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF } from 'react-final-form'
import {
    SectionedFormSections,
    SectionedFormSection,
    StandardFormField,
    StandardFormSectionTitle,
    NameField,
    StandardFormSectionDescription,
    ShortNameField,
    CodeField,
    DescriptionField,
} from '../../../components'
import {
    useSectionedFormContext,
    useSyncSelectedSectionWithScroll,
    useSchemaSectionHandleOrThrow,
    useSchema,
    getConstantTranslation,
} from '../../../lib'
import { ExpressionFields } from './ExpressionFields'
import { PredictorFormDescriptor } from './formDescriptor'
import { NumberField } from './NumberField'
import { OperatorFields } from './OperatorFields'
import { OrganisationUnitLevelsField } from './OrganisationUnitLevelsField'
import { PeriodTypeField } from './PeriodTypeField'

export const PredictorFormFields = () => {
    const schemaSection = useSchemaSectionHandleOrThrow()
    const schema = useSchema(schemaSection.name)
    const descriptor = useSectionedFormContext<typeof PredictorFormDescriptor>()
    useSyncSelectedSectionWithScroll()
    return (
        <SectionedFormSections>
            <SectionedFormSection
                name={descriptor?.getSection('basicInformation')?.name ?? ''}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Set up the basic information for this predictor.')}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <NameField schemaSection={schemaSection} />
                </StandardFormField>

                <StandardFormField>
                    <ShortNameField schemaSection={schemaSection} />
                </StandardFormField>

                <StandardFormField>
                    <CodeField schemaSection={schemaSection} />
                </StandardFormField>
                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
            </SectionedFormSection>
            <SectionedFormSection
                name={descriptor?.getSection('predictionLogic')?.name ?? ''}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Predictor logic')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Configure how this predictor is calculated.')}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <FieldRFF
                        required
                        component={SingleSelectFieldFF}
                        inputWidth="400px"
                        name="organisationUnitDescendants"
                        label={i18n.t('Organisation units providing data')}
                        options={schema?.properties?.organisationUnitDescendants?.constants?.map(
                            (opt) => ({
                                value: opt,
                                label: getConstantTranslation(opt),
                            })
                        )}
                    />
                </StandardFormField>
                <StandardFormField>
                    <NumberField
                        fieldName="sequentialSampleCount"
                        label={i18n.t('Sequential sample count')}
                        required={true}
                    />
                </StandardFormField>
                <StandardFormField>
                    <NumberField
                        fieldName="annualSampleCount"
                        label={i18n.t('Annual sample count')}
                        required={true}
                    />
                </StandardFormField>
                <StandardFormField>
                    <NumberField
                        fieldName="sequentialSkipCount"
                        label={i18n.t('Sequential skip count')}
                        required={false}
                    />
                </StandardFormField>
                <ExpressionFields
                    fieldName="generator"
                    objectName={i18n.t('generator')}
                    validationResource={'predictors/expression/description'}
                    showMissingValueStrategy={true}
                />
                <ExpressionFields
                    fieldName="sampleSkipTest"
                    objectName={i18n.t('sample skip test')}
                    validationResource={'predictors/skipTest/description'}
                    showMissingValueStrategy={false}
                    clearable={true}
                    required={false}
                />
            </SectionedFormSection>
            <SectionedFormSection
                name={descriptor?.getSection('output')?.name ?? ''}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Output')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Configure where and how this predictor outputs data.'
                    )}
                </StandardFormSectionDescription>
                <OperatorFields />
                <StandardFormField>
                    <PeriodTypeField />
                </StandardFormField>
                <StandardFormField>
                    <OrganisationUnitLevelsField />
                </StandardFormField>
            </SectionedFormSection>
        </SectionedFormSections>
    )
}
