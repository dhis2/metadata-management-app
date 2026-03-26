import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import { DefaultEditFormContents, FormBase } from '../../components'
import { SECTIONS_MAP } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { LegendSet, PickWithFieldFilters } from '../../types/generated'
import { LegendSetFormFields } from './form/LegendSetFormFields'
import { fieldFilters } from './form/fieldFilters'
import { validate } from './form/legendSetFormSchema'
import { useOnSubmitEditLegendSet } from './form/useOnSubmitLegendSet'

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
            onSubmit={useOnSubmitEditLegendSet(modelId)}
            initialValues={legendSetQuery.data}
            validate={validate}
        >
            <DefaultEditFormContents section={section}>
                <LegendSetFormFields />
            </DefaultEditFormContents>
        </FormBase>
    )
}
