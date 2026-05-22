import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import { DEFAULT_FIELD_FILTERS, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters } from '../../types/generated'
import { IndicatorGroupSet } from '../../types/models'
import IndicatorGroupSetFormFields from './form/IndicatorGroupSetFormFields'
import { validate } from './form/indicatorGroupSetSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'shortName',
    'code',
    'description',
    'compulsory',
    'indicatorGroups[id,displayName]',
] as const

export type IndicatorGroupSetFormValues = PickWithFieldFilters<
    IndicatorGroupSet,
    typeof fieldFilters
>

const section = SECTIONS_MAP.indicatorGroupSet

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'indicatorGroupSets',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const indicatorGroupSetQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<IndicatorGroupSetFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<IndicatorGroupSetFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        return indicatorGroupSetQuery.data
            ? omit(indicatorGroupSetQuery.data, 'id')
            : undefined
    }, [indicatorGroupSetQuery.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            includeAttributes={false}
            fetchError={!!indicatorGroupSetQuery.error}
        >
            <DefaultCloneFormContents section={section}>
                <IndicatorGroupSetFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
