import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF } from '@dhis2/ui'
import React, { useEffect } from 'react'
import {
    Field as FieldRFF,
    useField,
    useForm,
    useFormState,
} from 'react-final-form'
import {
    SectionedFormSection,
    SectionedFormSections,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    ValueTypeField,
} from '../../../components'
import { ModelSingleSelectFormField } from '../../../components/metadataFormControls/ModelSingleSelect'
import { PROGRAM_RULE_VARIABLE_CONSTANTS } from '../../../constants/programRuleVariable'
import {
    useClearFormFields,
    useSectionedFormContext,
    useSyncSelectedSectionWithScroll,
} from '../../../lib'
import { ProgramRuleVariable } from '../../../types/generated'
import {
    DataElementField,
    ProgramRuleVariableNameField,
    ProgramStageField,
    SourceTypeField,
    TrackedEntityAttributeField,
} from '../fields'
import { ProgramRuleVariableFormDescriptor } from './formDescriptor'
import { useProgramRuleVariableFieldVisibility } from './useProgramRuleVariableFieldVisibility'

const { FIELD_WIDTH } = PROGRAM_RULE_VARIABLE_CONSTANTS

export const ProgramRuleVariableFormFields = () => {
    const descriptor =
        useSectionedFormContext<typeof ProgramRuleVariableFormDescriptor>()
    useSyncSelectedSectionWithScroll()
    const form = useForm()
    const { values } = useFormState({ subscription: { values: true } })
    const { input: programStageInput } = useField('programStage')

    const isEdit = Boolean(values.id)

    const sourceType = values.programRuleVariableSourceType
    const programStage = programStageInput.value

    const clearProgramDependentFields = useClearFormFields(
        form,
        'programStage',
        'dataElement',
        'trackedEntityAttribute'
    )
    const clearSourceTypeDependentFields = useClearFormFields(
        form,
        'programStage',
        'dataElement',
        'trackedEntityAttribute',
        'valueType'
    )
    const clearProgramStageDataElement = useClearFormFields(form, 'dataElement')

    const {
        shouldShowProgramStage,
        shouldShowTrackedEntityAttribute,
        shouldShowValueType,
        shouldShowDataElements,
    } = useProgramRuleVariableFieldVisibility(sourceType, programStage)

    useEffect(() => {
        if (
            sourceType ===
                ProgramRuleVariable.programRuleVariableSourceType
                    .CALCULATED_VALUE &&
            !values.valueType
        ) {
            form.change('valueType', ProgramRuleVariable.valueType.TEXT)
        }
    }, [sourceType, values.valueType, form])

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
                        'Set up the basic information for this program rule variable.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <ProgramRuleVariableNameField />
                </StandardFormField>
            </SectionedFormSection>

            <SectionedFormSection
                name={descriptor.getSection('configuration').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Configuration')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Configure how this variable works.')}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <ModelSingleSelectFormField
                        required
                        inputWidth={FIELD_WIDTH}
                        dataTest="program-field"
                        name="program"
                        label={i18n.t('Program')}
                        query={{
                            resource: 'programs',
                            params: {
                                fields: ['id', 'displayName'],
                                paging: false,
                            },
                        }}
                        disabled={isEdit}
                        onChange={clearProgramDependentFields}
                        helpText={
                            isEdit
                                ? i18n.t(
                                      'Program cannot be changed after creation'
                                  )
                                : undefined
                        }
                    />
                </StandardFormField>

                <StandardFormField>
                    <SourceTypeField
                        onChange={clearSourceTypeDependentFields}
                    />
                </StandardFormField>

                {shouldShowProgramStage && (
                    <StandardFormField>
                        <ProgramStageField
                            onChange={clearProgramStageDataElement}
                        />
                    </StandardFormField>
                )}

                {shouldShowDataElements && (
                    <StandardFormField>
                        <DataElementField />
                    </StandardFormField>
                )}

                {shouldShowTrackedEntityAttribute && (
                    <StandardFormField>
                        <TrackedEntityAttributeField />
                    </StandardFormField>
                )}

                {shouldShowValueType && (
                    <StandardFormField dataTest="valueType-field">
                        <ValueTypeField required />
                    </StandardFormField>
                )}
                <StandardFormField>
                    <FieldRFF
                        name="useCodeForOptionSet"
                        type="checkbox"
                        dataTest="useCodeForOptionSet-field"
                        component={CheckboxFieldFF}
                        label={i18n.t(
                            'Show option set code instead of display name (when selection is linked to an option set).'
                        )}
                    />
                </StandardFormField>
            </SectionedFormSection>
        </SectionedFormSections>
    )
}
