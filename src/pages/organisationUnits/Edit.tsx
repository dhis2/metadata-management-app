import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FormApi } from 'final-form'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { DefaultEditFormContents, FormBase } from '../../components'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    getSectionPath,
    SECTIONS_MAP,
    useNavigateWithSearchState,
    usePatchModel,
} from '../../lib'
import { createFormError } from '../../lib/form/createFormError'
import { createJsonPatchOperations } from '../../lib/form/createJsonPatchOperations'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { OrganisationUnit, PickWithFieldFilters } from '../../types/generated'
import { OrganisationUnitFormField, validate } from './form'
import { useOnSaveDataSetsAndPrograms } from './form/useOnSaveDataSetsAndPrograms'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
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

type OrgUnitFormValuesFromFilters = PickWithFieldFilters<
    OrganisationUnit,
    typeof fieldFilters
>
export type OrgUnitFormValues = Omit<OrgUnitFormValuesFromFilters, 'parent'> & {
    parent?: { id: string; path?: string; displayName?: string }
}

const section = SECTIONS_MAP.organisationUnit

export const useOnEditOrgUnits = (modelId: string) => {
    const patchDirtyFields = usePatchModel(modelId, section.namePlural)
    const queryClient = useQueryClient()
    const updateDataSetsAndPrograms = useOnSaveDataSetsAndPrograms()
    const navigate = useNavigateWithSearchState()
    const saveAlert = useAlert(
        ({ message }) => message,
        (options) => options
    )

    return useMemo(
        () =>
            async (
                values: OrgUnitFormValues,
                form: FormApi<OrgUnitFormValues>
            ) => {
                const {
                    dataSets: dataSetsDirty,
                    programs: programsDirty,
                    ...restDirty
                } = form.getState().dirtyFields

                const fieldToEditSeparatelyHaveBeenModified =
                    dataSetsDirty || programsDirty

                const orgUnitJsonPatchOperations = createJsonPatchOperations({
                    values,
                    dirtyFields: restDirty,
                    originalValue: form.getState().initialValues,
                })

                if (
                    orgUnitJsonPatchOperations.length < 1 &&
                    !fieldToEditSeparatelyHaveBeenModified
                ) {
                    saveAlert.show({
                        message: i18n.t('No changes to be saved'),
                    })
                    navigate(`/${getSectionPath(section)}`)
                    return
                }

                const { error } = await patchDirtyFields(
                    orgUnitJsonPatchOperations
                )
                if (error) {
                    return createFormError(error)
                }

                await updateDataSetsAndPrograms(modelId, values)

                queryClient.invalidateQueries({
                    queryKey: [{ resource: section.namePlural }],
                })
                navigate(`/${getSectionPath(section)}`)
            },
        [
            patchDirtyFields,
            saveAlert,
            navigate,
            modelId,
            queryClient,
            updateDataSetsAndPrograms,
        ]
    )
}

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string
    const onSubmit = useOnEditOrgUnits(modelId)

    const query = {
        resource: 'organisationUnits',
        id: modelId,
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
            initialValues={orgUnit.data}
            validate={validate}
        >
            <DefaultEditFormContents section={section}>
                <OrganisationUnitFormField />
            </DefaultEditFormContents>
        </FormBase>
    )
}
