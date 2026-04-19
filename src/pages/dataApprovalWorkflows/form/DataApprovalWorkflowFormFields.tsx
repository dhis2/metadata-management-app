import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    NameField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionTitle,
} from '../../../components'
import { SECTIONS_MAP } from '../../../lib'
import { CategoryComboField } from '../fields/CategoryComboField'
import { DataApprovalLevelsField } from '../fields/DataApprovalLevelsField'
import { PeriodTypeField } from '../fields/PeriodTypeField'

export default function DataApprovalWorkflowFormFields() {
    const section = SECTIONS_MAP.dataApprovalWorkflow
    return (
        <StandardFormSection>
            <StandardFormSectionTitle>
                {i18n.t('Basic information')}
            </StandardFormSectionTitle>
            <StandardFormField>
                <NameField schemaSection={section} />
            </StandardFormField>
            <StandardFormField>
                <PeriodTypeField />
            </StandardFormField>
            <StandardFormField>
                <DataApprovalLevelsField />
            </StandardFormField>
            <StandardFormField>
                <CategoryComboField />
            </StandardFormField>
        </StandardFormSection>
    )
}
