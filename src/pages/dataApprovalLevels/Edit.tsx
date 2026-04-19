import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import { DefaultEditFormContents, FormBase } from '../../components'
import { DEFAULT_FIELD_FILTERS, SECTIONS_MAP, useOnSubmitEdit } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters } from '../../types/generated'
import { DataApprovalLevel } from '../../types/models'
import DataApprovalLevelFormFields from './form/DataApprovalLevelFormFields'
import { validate } from './form/dataApprovalLevelsSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'code',
    'orgUnitLevel',
    'categoryOptionGroupSet[id,displayName]',
] as const

export type DataApprovalLevelFormValues = PickWithFieldFilters<
    DataApprovalLevel,
    typeof fieldFilters
>

export const Component = () => {
    const section = SECTIONS_MAP.dataApprovalLevel
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string
    const query = {
        resource: 'dataApprovalLevels',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const dataApprovalLevelQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<DataApprovalLevelFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitEdit({ section, modelId })}
            initialValues={dataApprovalLevelQuery.data}
            validate={validate}
            includeAttributes={false}
        >
            <DefaultEditFormContents section={section}>
                <DataApprovalLevelFormFields />
            </DefaultEditFormContents>
        </FormBase>
    )
}
