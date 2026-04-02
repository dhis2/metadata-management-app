import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultDuplicateFormContents } from '../../components/form/DefaultFormContents'
import { ATTRIBUTE_VALUES_FIELD_FILTERS, SECTIONS_MAP } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { OrgUnitFormValues } from './Edit'
import { OrganisationUnitFormField, validate } from './form'
import { useOnSaveOrgUnits } from './New'

const fieldFilters = [
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'displayName',
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
    const duplicatedModelId = searchParams.get('duplicatedId') as string
    const onSubmit = useOnSaveOrgUnits()

    const query = {
        resource: 'organisationUnits',
        id: duplicatedModelId,
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
            fetchError={!!orgUnit.error}
        >
            <DefaultDuplicateFormContents section={section}>
                <OrganisationUnitFormField />
            </DefaultDuplicateFormContents>
        </FormBase>
    )
}
