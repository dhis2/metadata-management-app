import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import { ATTRIBUTE_VALUES_FIELD_FILTERS, SECTIONS_MAP } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { OrgUnitFormValues } from './Edit'
import { OrganisationUnitFormField, validate } from './form'
import { useOnSaveOrgUnits } from './New'

const fieldFilters = [
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'code',
    'shortName',
    'openingDate',
    'closedDate',
    'comment',
    'image[id,name]',
    'description',
    'contactPerson',
    'address',
    'email',
    'phoneNumber',
    'url',
    'geometry',
    'dataSets[id,displayName]',
    'programs[id,displayName]',
    'level',
    'path',
    'parent[id,path,displayName]',
] as const

const section = SECTIONS_MAP.organisationUnit

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string
    const onSubmit = useOnSaveOrgUnits()

    const query = {
        resource: 'organisationUnits',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const orgUnit = useQuery({
        queryKey: [query],
        queryFn: queryFn<OrgUnitFormValues>,
    })
    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={omit(orgUnit.data, 'id')}
            validate={validate}
        >
            <DefaultCloneFormContents
                section={section}
                modelId={clonedModelId}
                name={orgUnit.data?.name}
            >
                <OrganisationUnitFormField />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
