import { useDataEngine, useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQueryClient } from '@tanstack/react-query'
import { FormApi, SubmissionErrors } from 'final-form'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SECTIONS_MAP, useNavigateWithSearchState } from '../../../lib'
import { createFormError } from '../../../lib/form/createFormError'
import {
    createJsonPatchOperations,
    ModelWithAttributeValues,
} from '../../../lib/form/createJsonPatchOperations'
import {
    defaultNavigateTo,
    SubmitAction,
    useOnEditCompletedSuccessfully,
} from '../../../lib/form/useOnSubmit'
import { parseErrorResponse } from '../../../lib/errors'
import { LegendItem } from './legendSetFormSchema'

const section = SECTIONS_MAP.legendSet

function sanitizeLegends(legends: LegendItem[]): LegendItem[] {
    return legends.map((l) => ({
        id: l.id,
        name: l.name,
        startValue: l.startValue,
        endValue: l.endValue,
        color: l.color,
    }))
}

/**
 * Uses the /api/metadata endpoint instead of /api/legendSets to avoid
 * a server-side StackOverflowError caused by circular references
 * between Legend.legendSet and LegendSet.legends during response
 * serialization.
 */
export const useOnSubmitNewLegendSet = () => {
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()
    const saveAlert = useAlert(
        ({ message }) => message,
        (options) => options
    )
    const navigate = useNavigateWithSearchState()
    const [searchParams] = useSearchParams()

    return useMemo(
        () =>
            async (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                values: any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                form: FormApi<any>,
                options?: {
                    navigateTo?: typeof defaultNavigateTo | null
                    submitAction?: SubmitAction
                }
            ): Promise<SubmissionErrors | void> => {
                if (!values) {
                    saveAlert.show({
                        message: i18n.t('Cannot save empty object'),
                        error: true,
                    })
                    return
                }

                const payload = {
                    ...values,
                    legends: sanitizeLegends(values.legends || []),
                }

                try {
                    const response = (await dataEngine.mutate({
                        resource: 'metadata',
                        type: 'create',
                        data: { legendSets: [payload] },
                        params: {
                            importStrategy: 'CREATE',
                            atomicMode: 'ALL',
                        },
                    })) as Record<string, unknown>

                    const status = response?.status as string
                    if (status !== 'OK') {
                        return createFormError(
                            parseErrorResponse(response)
                        )
                    }

                    saveAlert.show({
                        message: i18n.t('Created successfully'),
                        success: true,
                    })
                    queryClient.invalidateQueries({
                        queryKey: [{ resource: section.namePlural }],
                    })

                    const navigateTo =
                        options?.navigateTo === undefined
                            ? defaultNavigateTo
                            : options.navigateTo

                    if (navigateTo) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const typeReports = (response as any)?.typeReports
                        const uid =
                            typeReports?.[0]?.objectReports?.[0]?.uid ??
                            payload.id
                        const responseData = {
                            httpStatusCode: 201,
                            response: { uid, id: uid },
                        }
                        const navTo = navigateTo({
                            section,
                            submitAction: options?.submitAction,
                            responseData,
                            searchParams,
                        })
                        if (navTo) {
                            navigate(navTo)
                        }
                    }
                } catch (error) {
                    return createFormError(parseErrorResponse(error))
                }
            },
        [dataEngine, queryClient, saveAlert, navigate, searchParams]
    )
}

export const useOnSubmitEditLegendSet = (modelId: string) => {
    const dataEngine = useDataEngine()
    const onEditCompletedSuccessfully =
        useOnEditCompletedSuccessfully(section)

    return useMemo(
        () =>
            async (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                values: any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                form: FormApi<any>,
                options?: {
                    navigateTo?: typeof defaultNavigateTo | null
                    submitAction?: SubmitAction
                }
            ): Promise<SubmissionErrors | void> => {
                const dirtyFields = form.getState().dirtyFields
                const dirtyKeys = Object.keys(dirtyFields)
                const legendsDirty = dirtyKeys.some((k) =>
                    k.startsWith('legends')
                )

                const navigateTo =
                    options?.navigateTo === undefined
                        ? defaultNavigateTo
                        : options.navigateTo

                if (legendsDirty) {
                    const fullValues = form.getState().values
                    const payload = {
                        id: modelId,
                        name: fullValues.name,
                        legends: sanitizeLegends(
                            fullValues.legends || []
                        ),
                    }

                    try {
                        const response = (await dataEngine.mutate({
                            resource: 'metadata',
                            type: 'create',
                            data: { legendSets: [payload] },
                            params: {
                                importStrategy: 'UPDATE',
                                mergeMode: 'REPLACE',
                                atomicMode: 'ALL',
                            },
                        })) as Record<string, unknown>

                        const status = response?.status as string
                        if (status !== 'OK') {
                            return createFormError(
                                parseErrorResponse(response)
                            )
                        }
                    } catch (error) {
                        return createFormError(parseErrorResponse(error))
                    }

                    const nonLegendDirtyKeys = dirtyKeys.filter(
                        (k) => !k.startsWith('legends')
                    )
                    if (nonLegendDirtyKeys.length === 0) {
                        onEditCompletedSuccessfully({
                            withChanges: true,
                            response: null,
                            navigateTo,
                            submitAction: options?.submitAction,
                        })
                        return
                    }

                    const nonLegendDirtyFields = Object.fromEntries(
                        nonLegendDirtyKeys.map((k) => [k, true])
                    )
                    const jsonPatchOperations = createJsonPatchOperations({
                        values: values as ModelWithAttributeValues,
                        dirtyFields: nonLegendDirtyFields,
                        originalValue: form.getState().initialValues,
                    })

                    if (jsonPatchOperations.length > 0) {
                        try {
                            await dataEngine.mutate(
                                {
                                    resource: section.namePlural,
                                    id: modelId,
                                    type: 'json-patch',
                                    data: ({
                                        operations,
                                    }: Record<string, string>) => operations,
                                },
                                {
                                    variables: {
                                        operations: jsonPatchOperations,
                                    },
                                }
                            )
                        } catch (error) {
                            return createFormError(
                                parseErrorResponse(error)
                            )
                        }
                    }

                    onEditCompletedSuccessfully({
                        withChanges: true,
                        response: null,
                        navigateTo,
                        submitAction: options?.submitAction,
                    })
                } else {
                    const jsonPatchOperations = createJsonPatchOperations({
                        values: values as ModelWithAttributeValues,
                        dirtyFields,
                        originalValue: form.getState().initialValues,
                    })

                    if (jsonPatchOperations.length < 1) {
                        onEditCompletedSuccessfully({
                            withChanges: false,
                            response: null,
                            navigateTo,
                            submitAction: options?.submitAction,
                        })
                        return
                    }

                    try {
                        await dataEngine.mutate(
                            {
                                resource: section.namePlural,
                                id: modelId,
                                type: 'json-patch',
                                data: ({
                                    operations,
                                }: Record<string, string>) => operations,
                            },
                            {
                                variables: {
                                    operations: jsonPatchOperations,
                                },
                            }
                        )
                    } catch (error) {
                        return createFormError(parseErrorResponse(error))
                    }

                    onEditCompletedSuccessfully({
                        withChanges: true,
                        response: null,
                        navigateTo,
                        submitAction: options?.submitAction,
                    })
                }
            },
        [dataEngine, modelId, onEditCompletedSuccessfully]
    )
}
