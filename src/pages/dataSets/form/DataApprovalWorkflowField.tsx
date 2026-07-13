import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useFormState } from 'react-final-form'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import { SECTIONS_MAP } from '../../../lib'

export type WorkflowTypes = {
    dataApprovalWorkflows: [{ displayName: string; id: string }]
}

export function DataApprovalWorkflowField() {
    const { values } = useFormState({ subscription: { values: true } })
    const selectedCategoryCombo = values.categoryCombo?.id
    const APPROVAL_WORKFLOWS_QUERY = {
        resource: 'dataApprovalWorkflows',
        params: {
            fields: ['displayName', 'id'],
            filters: [
                `categoryCombo.id:eq:${selectedCategoryCombo}`,
                'categoryCombo.id:null',
            ],
            rootJunction: 'OR',
        },
    }

    return (
        <ModelSingleSelectRefreshableFormField
            clearable
            name="workflow"
            label={i18n.t('Approval workflow')}
            query={APPROVAL_WORKFLOWS_QUERY}
            section={SECTIONS_MAP.dataApprovalWorkflow}
        />
    )
}
