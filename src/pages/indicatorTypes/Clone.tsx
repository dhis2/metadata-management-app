import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import { DEFAULT_FIELD_FILTERS, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { IndicatorTypesFormValues } from './Edit'
import { validate } from './form'
import { IndicatorTypesFormFields } from './form/IndicatorTypesFormFields'

const fieldFilters = [...DEFAULT_FIELD_FILTERS, 'name', 'factor'] as const

const section = SECTIONS_MAP.indicatorType
type IndicatorTypesCloneFormValues = IndicatorTypesFormValues

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'indicatorTypes',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const indicatorTypeQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<IndicatorTypesCloneFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<IndicatorTypesCloneFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        return indicatorTypeQuery.data
            ? omit(indicatorTypeQuery.data, 'id')
            : undefined
    }, [indicatorTypeQuery.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            includeAttributes={false}
            fetchError={!!indicatorTypeQuery.error}
        >
            <DefaultCloneFormContents section={section}>
                <IndicatorTypesFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
