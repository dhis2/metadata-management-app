import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import {
    getSectionPath,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useNavigateWithSearchState,
} from '../../lib'
import { createFormError } from '../../lib/form/createFormError'
import { useCreateModel } from '../../lib/form/useCreateModel'
import {
    useSetSystemOrganisationUnits,
    useSystemOrgUnitsStore,
} from '../../lib/systemOrgUnits/systemOrgUnitsStore'
import { OrgUnitFormValues } from './Edit'
import { initialValues, OrganisationUnitFormField, validate } from './form'
import { useOnSaveDataSetsAndPrograms } from './form/useOnSaveDataSetsAndPrograms'
import { ORG_UNIT_PARENT_SEARCH_PARAM } from './list/OrganisationUnitListActions'

const section = SECTIONS_MAP.organisationUnit

export const useOnSaveOrgUnits = () => {
    const createModel = useCreateModel(section.namePlural)
    const queryClient = useQueryClient()
    const updateDataSetsAndPrograms = useOnSaveDataSetsAndPrograms()
    const navigate = useNavigateWithSearchState()
    const hasNoSystemOrgUnits = useSystemOrgUnitsStore(
        (state) => (state.organisationUnits?.length ?? 0) === 0
    )
    const setSystemOrganisationUnits = useSetSystemOrganisationUnits()

    return useMemo(
        () => async (values: Partial<OrgUnitFormValues>) => {
            const { dataSets, programs, ...restFields } = values

            const { data, error } = await createModel(restFields)
            if (error) {
                return createFormError(error)
            }
            const orgId = (data as { response: { uid: string } }).response.uid

            await updateDataSetsAndPrograms(orgId, { dataSets, programs })

            if (hasNoSystemOrgUnits) {
                setSystemOrganisationUnits([
                    { id: orgId, path: `/${orgId}`, level: 1 },
                ])
            }

            queryClient.invalidateQueries({
                queryKey: [{ resource: section.namePlural }],
            })
            navigate(`/${getSectionPath(section)}`)
        },
        [
            createModel,
            navigate,
            updateDataSetsAndPrograms,
            queryClient,
            hasNoSystemOrgUnits,
            setSystemOrganisationUnits,
        ]
    )
}

export const Component = () => {
    const onSubmit = useOnSaveOrgUnits()
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const parentId = searchParams.get(ORG_UNIT_PARENT_SEARCH_PARAM)

    const parentOrgUnit = useQuery({
        queryKey: [
            {
                resource: 'organisationUnits',
                id: parentId ?? '',
                params: {
                    fields: 'id,path',
                },
            },
        ],
        queryFn: queryFn<{ id: string; path: string }>,
        enabled: !!parentId,
    })

    const initialValuesWithMaybeParent: Partial<OrgUnitFormValues> =
        useMemo(() => {
            if (parentId && parentOrgUnit.data) {
                return {
                    ...initialValues,
                    parent: { id: parentId, path: parentOrgUnit.data?.path },
                }
            }
            return initialValues
        }, [parentId, parentOrgUnit.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValuesWithMaybeParent}
            validate={validate}
        >
            <DefaultNewFormContents section={section}>
                <OrganisationUnitFormField />
            </DefaultNewFormContents>
        </FormBase>
    )
}
