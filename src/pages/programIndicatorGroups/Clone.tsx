import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
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
}

const section = SECTIONS_MAP.programIndicatorGroup

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'programIndicatorGroups',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const programIndicatorGroupsQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<ProgramIndicatorGroupsFormValues>,
    })

    const onSubmit = useOnSubmitNew<
        Omit<ProgramIndicatorGroupsFormValues, 'id'>
    >({ section })

    const initialValues = useMemo(() => {
        return programIndicatorGroupsQuery.data
            ? omit(programIndicatorGroupsQuery.data, 'id')
            : undefined
    }, [programIndicatorGroupsQuery.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            includeAttributes={false}
            fetchError={!!programIndicatorGroupsQuery.error}
        >
            <DefaultCloneFormContents section={section}>
                <ProgramIndicatorGroupsFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
