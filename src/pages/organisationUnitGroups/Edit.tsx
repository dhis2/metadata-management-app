import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import { DefaultEditFormContents, FormBase } from '../../components'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    SECTIONS_MAP,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import {
    OrganisationUnitGroup,
    PickWithFieldFilters,
} from '../../types/generated'
import { validate } from './form'
import { OrganisationalUnitGroupFormFields } from './form/OrganisationalUnitGroupFormFields'
import { useOnSubmitOrganisationUnitGroup } from './form/useOnSubmitOrganisationUnitGroup'

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

export const Component = () => {
    const section = SECTIONS_MAP.organisationUnitGroup
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string
    const query = {
        resource: 'organisationUnitGroups',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const organisationUnitGroupQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<OrganisationUnitGroupFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitOrganisationUnitGroup({ section, modelId })}
            initialValues={organisationUnitGroupQuery.data}
            validate={validate}
        >
            <DefaultEditFormContents section={section}>
                <OrganisationalUnitGroupFormFields />
            </DefaultEditFormContents>
        </FormBase>
    )
}
