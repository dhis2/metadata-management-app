import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQueryClient } from '@tanstack/react-query'
import { FormApi, SubmissionErrors } from 'final-form'
import { useCallback, useMemo } from 'react'
import { To, useSearchParams } from 'react-router-dom'
import { ModelSection } from '../../types'
import { IdentifiableObject } from '../../types/generated'
import { getSectionPath, useNavigateWithSearchState } from '../routeUtils'
import { createFormError } from './createFormError'
import {
    createJsonPatchOperations,
    ModelWithAttributeValues,
} from './createJsonPatchOperations'
import { useCreateModel } from './useCreateModel'
import { usePatchModel } from './usePatchModel'

export type SubmitAction = 'save' | 'saveAndExit'

export type GetToFunction = (options: {
    section: ModelSection
    submitAction?: SubmitAction
    responseData?: unknown
    searchParams?: URLSearchParams
}) => To | undefined

interface Navigateable {
    navigateTo?: GetToFunction | null
}

/*
    Enhance FinalForms onSubmit function to include some additional options.
    Note that compared to final-forms onSubmit the 'callback' parameter is replaced with an options object.
*/
export type EnhancedOnSubmit<TValues> = (
    values: TValues,
    form: FormApi<TValues>,
    options?: Navigateable & {
        submitAction?: SubmitAction
    }
) => SubmissionErrors | Promise<SubmissionErrors> | void

export const defaultNavigateTo: GetToFunction = ({
    section,
    submitAction = 'saveAndExit',
    responseData,
    searchParams,
}) => {
    const currentSearch =
        searchParams && searchParams.toString()
            ? `?${searchParams.toString()}`
            : ''

    if (submitAction === 'saveAndExit') {
        return `/${getSectionPath(section)}`
    }

    if (submitAction === 'save') {
        // check if we created a model - if so navigate to that form when saving
        if (
            responseData &&
            typeof responseData === 'object' &&
            'httpStatusCode' in responseData &&
            responseData.httpStatusCode === 201 &&
            'response' in responseData
        ) {
            const id =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (responseData as any).response.id ||
                (responseData as any).response.uid
            if (!id) {
                console.error(
                    'No id or uid found in response data for navigateTo function',
                    responseData
                )
                return undefined
            }

            return {
                pathname: `/${getSectionPath(section)}/${id}`,
                search: currentSearch,
            }
        }
        // if it's not a creation (eg. we edit), dont navigate anywhere
        return undefined
    }

    return undefined
}

export const getNavigateTo = (options?: Navigateable) => {
    return options?.navigateTo === undefined
        ? defaultNavigateTo
        : options.navigateTo
}

// avoid saving "Fever" and "Fever " as distinct values
const TRIMMABLE_FIELDS = ['name', 'shortName', 'code'] as const

const trimTrimmableFields = <TValues>(values: TValues): TValues => {
    const result = { ...(values as unknown as Record<string, unknown>) }
    for (const field of TRIMMABLE_FIELDS) {
        const value = result[field]
        if (typeof value === 'string') {
            result[field] = value.trim()
        }
    }
    return result as TValues
}

export type UseOnSubmitEditOptions = {
    modelId: string
    section: ModelSection
}

export type UseOnSubmitNewOptions = {
    section: ModelSection
    readonly onSubmitted?: () => void
    readonly redirectOnSubmitted?: boolean
}

export const useOnEditCompletedSuccessfully = (section: ModelSection) => {
    const saveAlert = useAlert(
        ({ message }) => message,
        (options) => options
    )
    const queryClient = useQueryClient()
    const navigate = useNavigateWithSearchState()

    return useCallback(
        ({
            withChanges,
            navigateTo = defaultNavigateTo,
            response,
            submitAction = 'saveAndExit',
        }: {
            withChanges: boolean
            navigateTo?: GetToFunction | null
            submitAction?: SubmitAction
            response?: any
        }) => {
            if (withChanges) {
                saveAlert.show({
                    message: i18n.t('Saved successfully'),
                    success: true,
                })
            } else {
                saveAlert.show({
                    message: i18n.t('No changes to be saved'),
                })
            }
            queryClient.invalidateQueries({
                queryKey: [{ resource: section.namePlural }],
            })

            if (navigateTo) {
                const navTo = navigateTo({
                    section,
                    submitAction,
                    responseData: response?.data,
                })
                if (navTo) {
                    navigate(navTo)
                }
            }
        },
        [saveAlert, queryClient, navigate, section]
    )
}

export const useOnSubmitEdit = <TFormValues extends IdentifiableObject>({
    modelId,
    section,
}: UseOnSubmitEditOptions) => {
    const patchDirtyFields = usePatchModel(modelId, section.namePlural)
    const onEditCompletedSuccessfully = useOnEditCompletedSuccessfully(section)

    return useMemo<EnhancedOnSubmit<TFormValues>>(
        () => async (values, form, options) => {
            const jsonPatchOperations = createJsonPatchOperations({
                values: trimTrimmableFields(values),
                dirtyFields: form.getState().dirtyFields,
                originalValue: form.getState().initialValues,
            })

            const navigateTo = getNavigateTo(options)

            if (jsonPatchOperations.length < 1) {
                onEditCompletedSuccessfully({
                    withChanges: false,
                    response: null,
                    navigateTo,
                    submitAction: options?.submitAction,
                })
                return
            }
            const response = await patchDirtyFields(jsonPatchOperations)

            if (response.error) {
                const err = createFormError(response.error)
                return err
            }
            onEditCompletedSuccessfully({
                withChanges: true,
                response,
                navigateTo,
                submitAction: options?.submitAction,
            })
        },
        [patchDirtyFields, onEditCompletedSuccessfully]
    )
}

export const defaultValueFormatter = <
    TFormValues extends ModelWithAttributeValues
>(
    values: TFormValues
) => {
    if (values.attributeValues) {
        return {
            ...values,
            attributeValues: values.attributeValues.filter(
                ({ value }) => !!value
            ),
        }
    }
    return values
}

export const useOnNewCompletedSuccessfullyOrSkipped = (
    section: ModelSection
) => {
    const saveAlert = useAlert(
        ({ message }) => message,
        (options) => options
    )

    const queryClient = useQueryClient()
    const navigate = useNavigateWithSearchState()
    const [searchParams] = useSearchParams()

    return useCallback(
        ({
            withChanges,
            navigateTo = defaultNavigateTo,
            response,
            submitAction = 'saveAndExit',
        }: {
            withChanges: boolean
            navigateTo?: GetToFunction | null
            submitAction?: SubmitAction
            response?: any
        }) => {
            if (!withChanges) {
                console.error('Tried to save new object without any changes')
                saveAlert.show({
                    message: i18n.t('Cannot save empty object'),
                    error: true,
                })
                return
            }

            saveAlert.show({
                message: i18n.t('Created successfully'),
                success: true,
            })
            queryClient.invalidateQueries({
                queryKey: [{ resource: section.namePlural }],
            })

            if (navigateTo) {
                const navTo = navigateTo({
                    section,
                    submitAction,
                    responseData: response.data,
                    searchParams,
                })
                if (navTo) {
                    navigate(navTo)
                }
            }
        },
        [saveAlert, queryClient, navigate, section, searchParams]
    )
}

export const useOnSubmitNew = <
    TFormValues extends Record<string, unknown> & ModelWithAttributeValues
>({
    section,
    onSubmitted,
    redirectOnSubmitted = true,
}: UseOnSubmitNewOptions) => {
    const createModel = useCreateModel(section.namePlural)
    const onNewCompletedSuccessfully =
        useOnNewCompletedSuccessfullyOrSkipped(section)

    return useMemo<EnhancedOnSubmit<TFormValues>>(
        () => async (values, form, options) => {
            if (!values) {
                return onNewCompletedSuccessfully({ withChanges: false })
            }
            const response = await createModel(trimTrimmableFields(values))
            if (response.error) {
                return createFormError(response.error)
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
            onNewCompletedSuccessfully,
            onSubmitted,
            redirectOnSubmitted,
        ]
    )
}
