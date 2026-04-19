import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import { DefaultEditFormContents, FormBase } from '../../components'
import { DEFAULT_FIELD_FILTERS, SECTIONS_MAP, useOnSubmitEdit } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters } from '../../types/generated'
import { DataApprovalWorkflow } from '../../types/models'
import DataApprovalWorkflowFormFields from './form/DataApprovalWorkflowFormFields'
import { validate } from './form/dataApprovalWorkflowSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'periodType',
    'categoryCombo[id,displayName]',
    'dataApprovalLevels[id,displayName]',
] as const

export type DataApprovalWorkflowFormValues = PickWithFieldFilters<
    DataApprovalWorkflow,
    typeof fieldFilters
>

export const Component = () => {
    const section = SECTIONS_MAP.dataApprovalWorkflow
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string
    const query = {
        resource: 'dataApprovalWorkflows',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const dataApprovalWorkflowQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<DataApprovalWorkflowFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitEdit({ section, modelId })}
            initialValues={dataApprovalWorkflowQuery.data}
            validate={validate}
            includeAttributes={false}
        >
            <DefaultEditFormContents section={section}>
                <DataApprovalWorkflowFormFields />
            </DefaultEditFormContents>
        </FormBase>
    )
}
