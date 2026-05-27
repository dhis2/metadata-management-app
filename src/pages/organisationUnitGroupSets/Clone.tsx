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
    OrganisationUnitGroupSet,
    PickWithFieldFilters,
} from '../../types/generated'
import { validate } from './form'
import { OrganisationalUnitGroupSetFormFields } from './form/OrganisationalUnitGroupSetFormFields'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'shortName',
    'code',
    'description',
    'compulsory',
    'dataDimension',
    'includeSubhierarchyInAnalytics',
    'organisationUnitGroups[id,displayName]',
] as const

export type OrganisationUnitGroupSetFormValues = PickWithFieldFilters<
    OrganisationUnitGroupSet,
    typeof fieldFilters
>

const section = SECTIONS_MAP.organisationUnitGroupSet

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'organisationUnitGroupSets',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const organisationUnitGroupSetQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<OrganisationUnitGroupSetFormValues>,
    })

    const onSubmit = useOnSubmitNew<
        Omit<OrganisationUnitGroupSetFormValues, 'id'>
    >({ section })

    const initialValues = useMemo(
        () =>
            organisationUnitGroupSetQuery.data
                ? omit(organisationUnitGroupSetQuery.data, 'id')
                : undefined,
        [organisationUnitGroupSetQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!organisationUnitGroupSetQuery.error}
        >
            <DefaultCloneFormContents section={section}>
                <OrganisationalUnitGroupSetFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
