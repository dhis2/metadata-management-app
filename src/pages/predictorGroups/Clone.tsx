import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import { DEFAULT_FIELD_FILTERS, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PredictorGroup, PickWithFieldFilters } from '../../types/generated'
import { PredictorGroupFormFields } from './form/PredictorGroupFormFields'
import { validate } from './form/predictorGroupSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'code',
    'description',
    'predictors[id,displayName]',
] as const

export type PredictorGroupFormValues = PickWithFieldFilters<
    PredictorGroup,
    typeof fieldFilters
>

const section = SECTIONS_MAP.predictorGroup

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'predictorGroups',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const predictorGroupsQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<PredictorGroupFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<PredictorGroupFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        return predictorGroupsQuery.data
            ? omit(predictorGroupsQuery.data, 'id')
            : undefined
    }, [predictorGroupsQuery.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            includeAttributes={false}
            fetchError={!!predictorGroupsQuery.error}
        >
            <DefaultCloneFormContents section={section}>
                <PredictorGroupFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
