import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useField, useFormState } from 'react-final-form'
import {
    SectionedFormSection,
    SectionedFormSections,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import { DescriptionField, NameField } from '../../../components/form/fields'
import {
    useSchemaSectionHandleOrThrow,
    useSectionedFormContext,
    useSyncSelectedSectionWithScroll,
} from '../../../lib'
import {
    ConditionField,
    PriorityField,
    ProgramField,
    ProgramStageField,
} from '../fields'
import { ProgramRuleActionsFormContents } from './actions/ProgramRuleActionsFormContents'
import { ProgramRuleFormDescriptor } from './formDescriptor'

export const ProgramRuleFormFields = () => {
    const schemaSection = useSchemaSectionHandleOrThrow()
    const descriptor =
        useSectionedFormContext<typeof ProgramRuleFormDescriptor>()
    useSyncSelectedSectionWithScroll()
    const { values } = useFormState({ subscription: { values: true } })
    const { input: programInput } = useField('program')
    const isEdit = Boolean(values.id)

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
                        'Set up the basic information for this program rule.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <NameField
                        schemaSection={schemaSection}
                        helpText={i18n.t(
                            'Only used for managing metadata, not shown with rule output'
                        )}
                    />
                </StandardFormField>

                <StandardFormField>
                    <DescriptionField
                        helpText={i18n.t(
                            'Explain the purpose of this program rule. Not shown with rule output.'
                        )}
                    />
                </StandardFormField>

                <StandardFormField>
                    <ProgramField disabled={isEdit} />
                </StandardFormField>

                <StandardFormField>
                    <ProgramStageField />
                </StandardFormField>

                <StandardFormField>
                    <PriorityField />
                </StandardFormField>
            </SectionedFormSection>
            <SectionedFormSection
                name={descriptor.getSection('expression').name}
            >
                <StandardFormSectionTitle>
                    {i18n.t('Expression')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the expression that checks when this program rule runs.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <ConditionField
                        programId={programInput?.value?.id}
                        programType={programInput?.value?.programType}
                    />
                </StandardFormField>
            </SectionedFormSection>
            <ProgramRuleActionsFormContents
                name={descriptor.getSection('actions').name}
            />
        </SectionedFormSections>
    )
}
