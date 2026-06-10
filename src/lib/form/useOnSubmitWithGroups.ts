import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import { ModelSection } from '../../types'
import { useNavigateWithSearchState } from '../routeUtils'
import { createFormError } from './createFormError'
import {
    ModelWithAttributeValues,
    createJsonPatchOperations,
} from './createJsonPatchOperations'
import { useCreateModel } from './useCreateModel'
import {
    EnhancedOnSubmit,
    getNavigateTo,
    useOnEditCompletedSuccessfully,
    useOnNewCompletedSuccessfullyOrSkipped,
} from './useOnSubmit'
import { usePatchModel } from './usePatchModel'
import { useSyncGroupMembership } from './useSyncGroupMembership'

/**
 * Submit hooks for forms with group membership. Strips the groups field from
 * the save payload and syncs membership changes via dedicated POST/DELETE
 * endpoints after the base save succeeds. On group sync failure, a critical
 * alert is shown and the form remains open for retry.
 */

type GroupRef = { id: string }

const diffGroupIds = (next: GroupRef[] = [], prev: GroupRef[] = []) => {
    const prevIds = new Set(prev.map((g) => g.id))
    const nextIds = new Set(next.map((g) => g.id))
    const added = [...nextIds].filter((id) => !prevIds.has(id))
    const removed = [...prevIds].filter((id) => !nextIds.has(id))
    return { added, removed }
}

type UseOnSubmitEditWithGroupsOptions = {
    section: ModelSection
    modelId: string
    groupResource: string
}

export const useOnSubmitEditWithGroups = <TFormValues extends { id?: string }>({
    section,
    modelId,
    groupResource,
}: UseOnSubmitEditWithGroupsOptions) => {
    const patchDirtyFields = usePatchModel(modelId, section.namePlural)
    const onEditCompletedSuccessfully = useOnEditCompletedSuccessfully(section)
    const syncGroupMembership = useSyncGroupMembership({
        resource: section.namePlural,
        groupResource,
    })

    return useMemo<EnhancedOnSubmit<TFormValues>>(
        () => async (values, form, options) => {
            const formState = form.getState()
            const dirtyFields = { ...formState.dirtyFields }
            const initialValues =
                (formState.initialValues as Record<string, unknown>) ?? {}

            const groupsDirty = !!dirtyFields[groupResource]

            delete dirtyFields[groupResource]
            const valuesForPatch = (() => {
                const copy = { ...values } as Record<string, unknown>
                delete copy[groupResource]
                return copy as TFormValues
            })()

            const jsonPatchOperations = createJsonPatchOperations({
                values: valuesForPatch as ModelWithAttributeValues,
                dirtyFields,
                originalValue: initialValues,
            })

            const navigateTo = getNavigateTo(options)

            if (jsonPatchOperations.length < 1 && !groupsDirty) {
                onEditCompletedSuccessfully({
                    withChanges: false,
                    response: null,
                    navigateTo,
                    submitAction: options?.submitAction,
                })
                return
            }
            if (jsonPatchOperations.length > 0) {
                const response = await patchDirtyFields(jsonPatchOperations)
                if (response.error) {
                    return createFormError(response.error)
                }
            }

            if (groupsDirty) {
                const next = (values as Record<string, unknown>)[
                    groupResource
                ] as GroupRef[] | undefined
                const prev = initialValues[groupResource] as
                    | GroupRef[]
                    | undefined
                const { added, removed } = diffGroupIds(next, prev)
                const outcome = await syncGroupMembership({
                    modelId,
                    added,
                    removed,
                })
                if (!outcome.ok) {
                    return createFormError({
                        message: i18n.t(
                            'Group assignment failed. Other values have been saved/updated'
                        ),
                        ...outcome,
                    })
                }
            }

            onEditCompletedSuccessfully({
                withChanges: true,
                response: undefined,
                navigateTo,
                submitAction: options?.submitAction,
            })
        },
        [
            patchDirtyFields,
            onEditCompletedSuccessfully,
            syncGroupMembership,
            modelId,
            groupResource,
        ]
    )
}

type UseOnSubmitNewWithGroupsOptions = {
    section: ModelSection
    groupResource: string
    onSubmitted?: () => void
    redirectOnSubmitted?: boolean
}

export const useOnSubmitNewWithGroups = <
    TFormValues extends Record<string, unknown>
>({
    section,
    groupResource,
    onSubmitted,
    redirectOnSubmitted = true,
}: UseOnSubmitNewWithGroupsOptions) => {
    const createModel = useCreateModel(section.namePlural)
    const syncGroupMembership = useSyncGroupMembership({
        resource: section.namePlural,
        groupResource,
    })
    const onNewCompletedSuccessfully =
        useOnNewCompletedSuccessfullyOrSkipped(section)
    const navigate = useNavigateWithSearchState()
    const saveAlert = useAlert(
        ({ message }) => message,
        (options) => options
    )

    return useMemo<EnhancedOnSubmit<TFormValues>>(
        () => async (values, _form, options) => {
            if (!values) {
                return onNewCompletedSuccessfully({ withChanges: false })
            }
            const selectedGroups =
                ((values as Record<string, unknown>)[groupResource] as
                    | GroupRef[]
                    | undefined) ?? []
            const valuesForCreate = (() => {
                const copy = { ...values } as Record<string, unknown>
                delete copy[groupResource]
                return copy
            })()

            const response = await createModel(valuesForCreate)
            if (response.error) {
                return createFormError(response.error)
            }

            const responseData = response.data as
                | { response?: { uid?: string; id?: string } }
                | undefined
            const newId =
                responseData?.response?.uid ?? responseData?.response?.id

            if (selectedGroups.length > 0 && newId) {
                const outcome = await syncGroupMembership({
                    modelId: newId,
                    added: selectedGroups.map((g) => g.id),
                    removed: [],
                })

                if (!outcome.ok) {
                    navigate({
                        pathname: `/${section.namePlural}/${newId}`,
                    })
                    saveAlert.show({
                        message: i18n.t(
                            'Created successfully, but failed to update groups'
                        ),
                        error: true,
                        critical: true,
                    })
                    return
                }
            }
            const navigateTo = getNavigateTo(options)

            onNewCompletedSuccessfully({
                withChanges: true,
                response,
                navigateTo: redirectOnSubmitted ? navigateTo : null,
                submitAction: options?.submitAction,
            })

            onSubmitted?.()

            return response
        },
        [
            createModel,
            syncGroupMembership,
            groupResource,
            onNewCompletedSuccessfully,
            navigate,
            section.namePlural,
            saveAlert,
            onSubmitted,
            redirectOnSubmitted,
        ]
    )
}
