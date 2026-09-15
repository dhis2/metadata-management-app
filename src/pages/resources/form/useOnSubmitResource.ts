import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
    getSectionPath,
    SECTIONS_MAP,
    useNavigateWithSearchState,
} from '../../../lib'
import { createFormError } from '../../../lib/form/createFormError'
import { EnhancedOnSubmit } from '../../../lib/form/useOnSubmit'
import {
    buildResourceDocumentPayload,
    ResourceSubmitValues,
} from './resourceSubmit'

const section = SECTIONS_MAP.document

export const useOnSubmitResource = ({
    modelId,
    successMessage,
}: {
    modelId?: string
    successMessage: string
}): EnhancedOnSubmit<ResourceSubmitValues> => {
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()
    const saveAlert = useAlert(
        ({ message }) => message,
        (options) => options
    )
    const navigate = useNavigateWithSearchState()

    return useMemo(
        () => async (values) => {
            try {
                const data = await buildResourceDocumentPayload(
                    dataEngine,
                    values
                )

                await dataEngine.mutate(
                    modelId
                        ? {
                              resource: 'documents',
                              id: modelId,
                              type: 'update',
                              data,
                          }
                        : { resource: 'documents', type: 'create', data }
                )

                saveAlert.show({ message: successMessage, success: true })
                queryClient.invalidateQueries({
                    queryKey: [{ resource: section.namePlural }],
                })
                navigate(`/${getSectionPath(section)}`)
            } catch (error) {
                return createFormError(error)
            }
        },
        [dataEngine, queryClient, saveAlert, navigate, modelId, successMessage]
    )
}
