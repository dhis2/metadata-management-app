import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultEditFormContents } from '../../components/form/DefaultFormContents'
import { DEFAULT_IDENTIFIABLE, SECTIONS_MAP, useOnSubmitEdit } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { IndicatorType, PickWithFieldFilters } from '../../types/models'
import { validate } from './form'
import { IndicatorTypesFormFields } from './form/IndicatorTypesFormFields'

const fieldFilters = [...DEFAULT_IDENTIFIABLE, 'factor'] as const

export type IndicatorTypesFormValues = PickWithFieldFilters<
    IndicatorType,
    typeof fieldFilters
> & { id: string }

export const Component = () => {
    const section = SECTIONS_MAP.indicatorType
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string

    const query = {
        resource: 'indicatorTypes',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const indicatorTypeQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<IndicatorTypesFormValues>,
    })
    return (
        <FormBase
            onSubmit={useOnSubmitEdit({ section, modelId })}
            initialValues={indicatorTypeQuery.data}
            validate={validate}
            includeAttributes={false}
        >
            <DefaultEditFormContents section={section}>
                <IndicatorTypesFormFields />
            </DefaultEditFormContents>
        </FormBase>
    )
}
