import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    CodeField,
    CustomAttributesSection,
    DescriptionField,
    ModelTransferField,
    NameField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import { useSchemaSectionHandleOrThrow, SECTIONS_MAP } from '../../../lib'

export function ValidationRuleGroupsFormFields() {
    const schemaSection = useSchemaSectionHandleOrThrow()

    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this validation rule group.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <NameField schemaSection={schemaSection} />
                </StandardFormField>
                <StandardFormField>
                    <CodeField schemaSection={schemaSection} />
                </StandardFormField>
                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Validation Rules')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the validation rules to include in this validation rule group.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <ModelTransferField
                        dataTest="validationRules-transfer"
                        name="validationRules"
                        query={{
                            resource: 'validationRules',
                        }}
                        transferSection={SECTIONS_MAP.validationRule}
                        filterUnassignedTo={'validationRuleGroups'}
                        maxSelections={Infinity}
                    />
                </StandardFormField>
            </StandardFormSection>
            <CustomAttributesSection schemaSection={schemaSection} />
        </>
    )
}
