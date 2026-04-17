import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultDuplicateFormContents } from '../../components/form/DefaultFormContents'
import { DEFAULT_FIELD_FILTERS, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters, ProgramIndicatorGroup } from '../../types/models'
import { validate } from './form'
import { ProgramIndicatorGroupsFormFields } from './form/ProgramIndicatorGroupsFormFields'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'code',
    'programIndicators[id,displayName]',
] as const

export type ProgramIndicatorGroupsFormValues = PickWithFieldFilters<
    ProgramIndicatorGroup,
    typeof fieldFilters
> & {
    id: string
    attributeValues?: { attribute: { id: string }; value: string }[]
}

const section = SECTIONS_MAP.programIndicatorGroup

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const duplicatedModelId = searchParams.get('duplicatedId') as string

    const query = {
        resource: 'programIndicatorGroups',
        id: duplicatedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const programIndicatorGroupsQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<ProgramIndicatorGroupsFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={omit(programIndicatorGroupsQuery.data, 'id')}
            validate={validate}
            includeAttributes={false}
            fetchError={!!programIndicatorGroupsQuery.error}
        >
            <DefaultDuplicateFormContents section={section}>
                <ProgramIndicatorGroupsFormFields />
            </DefaultDuplicateFormContents>
        </FormBase>
    )
}
