import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import { DefaultEditFormContents, FormBase } from '../../components'
import {
    DEFAULT_FIELD_FILTERS,
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    SECTIONS_MAP,
    useOnSubmitEdit,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { LegendSet, PickWithFieldFilters } from '../../types/generated'
import { LegendSetFormFields } from './form/LegendSetFormFields'
import { validate } from './form/legendSetSchema'

export const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'code',
    'legends[id,name,startValue,endValue,color,legendSet[id]]',
] as const

type LegendSetEditFormValues = PickWithFieldFilters<
    LegendSet,
    typeof fieldFilters
>

const section = SECTIONS_MAP.legendSet

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string

    const query = {
        resource: 'legendSets',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }

    const legendSetQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<LegendSetEditFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitEdit({ section, modelId })}
            initialValues={legendSetQuery.data}
            validate={validate}
        >
            <DefaultEditFormContents section={section}>
                <LegendSetFormFields />
            </DefaultEditFormContents>
        </FormBase>
    )
}
