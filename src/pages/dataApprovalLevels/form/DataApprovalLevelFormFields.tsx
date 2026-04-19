import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    CodeField,
    NameField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionTitle,
} from '../../../components'
import { SECTIONS_MAP } from '../../../lib'
import { CategoryOptionGroupSetField, OrgUnitLevelField } from './fields'

export default function DataApprovalLevelFormFields() {
    const section = SECTIONS_MAP.dataApprovalLevel
    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormField>
                    <NameField schemaSection={section} />
                </StandardFormField>
                <StandardFormField>
                    <CodeField schemaSection={section} />
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Configuration')}
                </StandardFormSectionTitle>
                <StandardFormField>
                    <OrgUnitLevelField />
                </StandardFormField>
                <StandardFormField>
                    <CategoryOptionGroupSetField />
                </StandardFormField>
            </StandardFormSection>
        </>
    )
}
