import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import {
    DEFAULT_FIELD_FILTERS,
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    SECTIONS_MAP,
    useOnSubmitNew,
} from '../../lib'
import { generateDhis2Id } from '../../lib/models/uid'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { LegendSet, PickWithFieldFilters } from '../../types/generated'
import { LegendSetFormFields } from './form/LegendSetFormFields'
import { validate } from './form/legendSetSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'code',
    'legends[name,startValue,endValue,color,legendSet[id]]',
] as const

type LegendSetFormValues = PickWithFieldFilters<LegendSet, typeof fieldFilters>

const section = SECTIONS_MAP.legendSet

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'legendSets',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const legendSetQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<LegendSetFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<LegendSetFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        if (!legendSetQuery.data) {
            return undefined
        }
        const originalData = omit(legendSetQuery.data, 'id')
        const result = originalData.legends
            ? {
                  ...originalData,
                  legends: originalData.legends.map((legend) => ({
                      ...(legend as Record<string, unknown>),
                      id: generateDhis2Id(),
                  })),
              }
            : originalData
        // PickWithFieldFilters cannot resolve the nested legendSet[id] filter,
        // so legends is typed as never[] — cast to align with the submit type
        return result as unknown as Omit<LegendSetFormValues, 'id'>
    }, [legendSetQuery.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!legendSetQuery.error}
        >
            <DefaultCloneFormContents section={section}>
                <LegendSetFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
