import i18n from '@dhis2/d2-i18n'
import {
    CheckboxFieldFF,
    InputFieldFF,
    RadioFieldFF,
    SingleSelectFieldFF,
    TextAreaFieldFF,
} from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import {
    CodeField,
    CustomAttributesSection,
    DescriptionField,
    ExpressionBuilderEntry,
    HorizontalFieldGroup,
    NameField,
    SectionedFormSection,
    SectionedFormSections,
    ShortNameField,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    MissingValueStrategyField,
} from '../../../components'
import { PaddedContainer } from '../../../components/ExpressionBuilder/PaddedContainer'
import {
    getConstantTranslation,
    SchemaName,
    SchemaSection,
    SECTIONS_MAP,
    useSchema,
    useSectionedFormContext,
    useSyncSelectedSectionWithScroll,
} from '../../../lib'
import { ValidationRuleFormDescriptor } from './formDescriptor'
import { OrganisationUnitLevelsField } from './OrganisationUnitLevelsField'
import { PeriodTypeField } from './PeriodTypeField'
import css from './ValidationRuleFormFields.module.css'

const schemaSection = SECTIONS_MAP.validationRule

const ValidationRuleFormFields = () => {
    const schema = useSchema(schemaSection.name)
    const descriptor =
        useSectionedFormContext<typeof ValidationRuleFormDescriptor>()
    useSyncSelectedSectionWithScroll()

    // Prepare operator options with "Not equal to" at the top
    const operatorOptions =
        schema.properties.operator.constants?.map((constant) => ({
            value: constant,
            label: getConstantTranslation(constant),
        })) || []

    // Reorder to put "not_equal_to" at the top per requirements
    const notEqualToIndex = operatorOptions.findIndex(
        (opt) => opt.value === 'not_equal_to'
    )
    if (notEqualToIndex > 0) {
        const notEqualTo = operatorOptions.splice(notEqualToIndex, 1)[0]
        operatorOptions.unshift(notEqualTo)
    }

    const importanceOptions =
        schema.properties.importance.constants?.map((constant) => ({
            value: constant,
            label: getConstantTranslation(constant),
        })) || []

    const expressionSchemaSection = {
        name: 'expression' as SchemaName,
        namePlural: 'expressions',
    } as SchemaSection

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
                        'Set up the basic information for this validation rule.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <NameField schemaSection={schemaSection} />
                </StandardFormField>
                <StandardFormField>
                    <ShortNameField
                        schemaSection={schemaSection}
                        isRequired={false}
                    />
                </StandardFormField>
                <StandardFormField>
                    <CodeField schemaSection={schemaSection} />
                </StandardFormField>
                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
            </SectionedFormSection>

            <SectionedFormSection
                name={descriptor.getSection('expressionsAndOutput').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Expressions and output')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Configure the expressions and how they are compared.'
                    )}
                </StandardFormSectionDescription>

                <div className={css.expressionContainer}>
                    <PaddedContainer title={i18n.t('Left side expression')}>
                        <StandardFormField>
                            <ExpressionBuilderEntry
                                fieldName="leftSide.expression"
                                title={i18n.t('Edit numerator expression')}
                                editButtonText={i18n.t(
                                    'Edit numerator expression'
                                )}
                                setUpButtonText={i18n.t(
                                    'Set up numerator expression'
                                )}
                                validationResource="validationRules/expression/description"
                                validateSchemaSection={expressionSchemaSection}
                                validateProperty="expression"
                            />
                        </StandardFormField>

                        <StandardFormField>
                            <Field
                                dense
                                inputWidth="400px"
                                name="leftSide.description"
                                type="text"
                                data-test="formfields-leftSide.description"
                                label={i18n.t('Description')}
                                component={InputFieldFF}
                            />
                        </StandardFormField>

                        <StandardFormField>
                            <MissingValueStrategyField fieldName="leftSide" />
                        </StandardFormField>

                        <StandardFormField>
                            <Field
                                name="leftSide.slidingWindow"
                                dataTest="formfields-leftSide.slidingWindow"
                                type="checkbox"
                                component={CheckboxFieldFF}
                                label={i18n.t(
                                    'Sliding window: validation checks against relative period',
                                    { nsSeparator: '~:~' }
                                )}
                            />
                        </StandardFormField>
                    </PaddedContainer>
                </div>

                <StandardFormField>
                    <Field
                        component={SingleSelectFieldFF}
                        inputWidth="400px"
                        label={i18n.t('Comparison operator')}
                        name="operator"
                        options={operatorOptions}
                        dataTest="formfields-operator"
                    />
                </StandardFormField>

                <div className={css.expressionContainer}>
                    <PaddedContainer title={i18n.t('Right side expression')}>
                        <StandardFormField>
                            <ExpressionBuilderEntry
                                fieldName="rightSide.expression"
                                title={i18n.t('Edit denominator expression')}
                                editButtonText={i18n.t(
                                    'Edit denominator expression'
                                )}
                                setUpButtonText={i18n.t(
                                    'Set up denominator expression'
                                )}
                                validationResource="validationRules/expression/description"
                                validateSchemaSection={expressionSchemaSection}
                                validateProperty="expression"
                            />
                        </StandardFormField>

                        <StandardFormField>
                            <Field
                                dense
                                inputWidth="400px"
                                name="rightSide.description"
                                type="text"
                                data-test="formfields-rightSide.description"
                                label={i18n.t('Description')}
                                component={InputFieldFF}
                            />
                        </StandardFormField>

                        <StandardFormField>
                            <MissingValueStrategyField fieldName="rightSide" />
                        </StandardFormField>

                        <StandardFormField>
                            <Field
                                name="rightSide.slidingWindow"
                                type="checkbox"
                                component={CheckboxFieldFF}
                                label={i18n.t(
                                    'Sliding window: validation checks against relative period',
                                    { nsSeparator: '~:~' }
                                )}
                                dataTest="formfields-rightSide.slidingWindow"
                            />
                        </StandardFormField>
                    </PaddedContainer>
                </div>

                <StandardFormField>
                    <Field
                        name="instruction"
                        inputWidth="400px"
                        component={TextAreaFieldFF}
                        label={i18n.t('Instruction to show')}
                        helpText={i18n.t(
                            'Shown when validating data in Data Entry and Android apps.'
                        )}
                        dataTest="formfields-instruction"
                    />
                </StandardFormField>

                <StandardFormField>
                    <PeriodTypeField />
                </StandardFormField>

                <StandardFormField>
                    <HorizontalFieldGroup
                        dataTest={'formfields-importance'}
                        label={i18n.t('Importance')}
                        helpText={i18n.t(
                            'Changes the appearance of the validation rule output during Data Entry.'
                        )}
                    >
                        {importanceOptions.map((option) => (
                            <Field<string | undefined>
                                key={option.value}
                                name="importance"
                                component={RadioFieldFF}
                                label={option.label}
                                type="radio"
                                value={option.value}
                            />
                        ))}
                    </HorizontalFieldGroup>
                </StandardFormField>
            </SectionedFormSection>

            <SectionedFormSection name={descriptor.getSection('options').name}>
                <StandardFormSectionTitle>
                    {i18n.t('Options')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Configure how, when, and where this validation rule runs.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <Field
                        dataTest="formfields-skipFormValidation"
                        name="skipFormValidation"
                        type="checkbox"
                        component={CheckboxFieldFF}
                        label={i18n.t(
                            'Skip this rule during form validation in Data Entry App'
                        )}
                    />
                </StandardFormField>

                <StandardFormField>
                    <OrganisationUnitLevelsField />
                </StandardFormField>
            </SectionedFormSection>
            <CustomAttributesSection schemaSection={schemaSection} />
        </SectionedFormSections>
    )
}

export default ValidationRuleFormFields
