import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    SECTIONS_MAP,
    useOnSubmitNew,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters } from '../../types/generated'
import { IndicatorGroup } from '../../types/models'
import IndicatorGroupFormFields from './form/IndicatorGroupFormFields'
import { validate } from './form/indicatorGroupSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'code',
    'description',
    'indicators[id,displayName]',
] as const

export type IndicatorGroupFormValues = PickWithFieldFilters<
    IndicatorGroup,
    typeof fieldFilters
>

const section = SECTIONS_MAP.indicatorGroup

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'indicatorGroups',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const indicatorGroupQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<IndicatorGroupFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<IndicatorGroupFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        return indicatorGroupQuery.data
            ? omit(indicatorGroupQuery.data, 'id')
            : undefined
    }, [indicatorGroupQuery.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!indicatorGroupQuery.error}
        >
            <DefaultCloneFormContents section={section}>
                <IndicatorGroupFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
