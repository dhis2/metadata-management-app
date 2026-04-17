import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultDuplicateFormContents } from '../../components/form/DefaultFormContents'
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
> & {
    attributeValues?: { attribute: { id: string }; value: string }[]
}

const section = SECTIONS_MAP.predictorGroup

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const duplicatedModelId = searchParams.get('duplicatedId') as string

    const query = {
        resource: 'predictorGroups',
        id: duplicatedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const predictorGroupsQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<PredictorGroupFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={omit(predictorGroupsQuery.data, 'id')}
            validate={validate}
            includeAttributes={false}
            fetchError={!!predictorGroupsQuery.error}
        >
            <DefaultDuplicateFormContents section={section}>
                <PredictorGroupFormFields />
            </DefaultDuplicateFormContents>
        </FormBase>
    )
}
