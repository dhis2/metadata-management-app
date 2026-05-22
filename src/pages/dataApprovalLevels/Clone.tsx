import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import { DEFAULT_FIELD_FILTERS, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters } from '../../types/generated'
import { DataApprovalLevel } from '../../types/models'
import DataApprovalLevelFormFields from './form/DataApprovalLevelFormFields'
import { validate } from './form/dataApprovalLevelsSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'orgUnitLevel',
    'categoryOptionGroupSet[id,displayName]',
] as const

type DataApprovalLevelFormValues = PickWithFieldFilters<
    DataApprovalLevel,
    typeof fieldFilters
>

const section = SECTIONS_MAP.dataApprovalLevel

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'dataApprovalLevels',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const dataApprovalLevelQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<DataApprovalLevelFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<DataApprovalLevelFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(
        () =>
            dataApprovalLevelQuery.data
                ? omit(dataApprovalLevelQuery.data, 'id')
                : undefined,
        [dataApprovalLevelQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!dataApprovalLevelQuery.error}
            includeAttributes={false}
        >
            <DefaultCloneFormContents section={section}>
                <DataApprovalLevelFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
