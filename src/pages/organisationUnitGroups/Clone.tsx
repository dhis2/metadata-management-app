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
import {
    OrganisationUnitGroup,
    PickWithFieldFilters,
} from '../../types/generated'
import { validate } from './form'
import { OrganisationalUnitGroupFormFields } from './form/OrganisationalUnitGroupFormFields'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'shortName',
    'code',
    'description',
    'compulsory',
    'color',
    'symbol',
    'organisationUnits[id,displayName,path]',
] as const

export type OrganisationUnitGroupFormValues = PickWithFieldFilters<
    OrganisationUnitGroup,
    typeof fieldFilters
>

const section = SECTIONS_MAP.organisationUnitGroup

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'organisationUnitGroups',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const organisationUnitGroupQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<OrganisationUnitGroupFormValues>,
    })

    const onSubmit = useOnSubmitNew<
        Omit<OrganisationUnitGroupFormValues, 'id'>
    >({ section })

    const initialValues = useMemo(
        () =>
            organisationUnitGroupQuery.data
                ? omit(organisationUnitGroupQuery.data, 'id')
                : undefined,
        [organisationUnitGroupQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!organisationUnitGroupQuery.error}
        >
            <DefaultCloneFormContents section={section}>
                <OrganisationalUnitGroupFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
