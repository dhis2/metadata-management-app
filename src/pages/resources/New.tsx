import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQueryClient } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import {
    getSectionPath,
    SECTIONS_MAP,
    useNavigateWithSearchState,
} from '../../lib'
import { createFormError } from '../../lib/form/createFormError'
import { EnhancedOnSubmit } from '../../lib/form/useOnSubmit'
import { AttributeValue } from '../../types/generated'
import {
    NewResourceFormFields,
    ResourceType,
    resourceNewInitialValues,
    validateResourceNewForm,
} from './form'

const section = SECTIONS_MAP.document

type ResourceNewSubmitValues = {
    id?: string
    name?: string
    code?: string
    resourceType?: ResourceType
    url?: string
    attachment?: boolean
    file?: File | null
    attributeValues?: AttributeValue[]
}

const useOnSubmitNewResource =
    (): EnhancedOnSubmit<ResourceNewSubmitValues> => {
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
                    const documentPayload = {
                        name: values.name,
                        code: values.code || undefined,
                        attributeValues: values.attributeValues,
                        ...(values.resourceType === ResourceType.URL
                            ? {
                                  type: 'EXTERNAL_URL',
                                  external: true,
                                  attachment: false,
                                  url: values.url,
                              }
                            : {
                                  type: 'UPLOAD_FILE',
                                  external: false,
                                  attachment: !!values.attachment,
                                  url: await uploadResourceFile(
                                      dataEngine,
                                      values.file as File
                                  ),
                              }),
                    }

                    await dataEngine.mutate({
                        resource: 'documents',
                        type: 'create',
                        data: documentPayload,
                    })

                    saveAlert.show({
                        message: i18n.t('Resource created successfully'),
                        success: true,
                    })
                    queryClient.invalidateQueries({
                        queryKey: [{ resource: section.namePlural }],
                    })
                    navigate(`/${getSectionPath(section)}`)
                } catch (error) {
                    return createFormError(error)
                }
            },
            [dataEngine, queryClient, saveAlert, navigate]
        )
    }

const uploadResourceFile = async (
    dataEngine: ReturnType<typeof useDataEngine>,
    file: File
) => {
    const uploadResponse = (await dataEngine.mutate({
        resource: 'fileResources',
        type: 'create',
        data: { file, domain: 'DOCUMENT' },
    })) as { response: { fileResource: { id: string } } }

    return uploadResponse.response.fileResource.id
}

export const Component = () => {
    const onSubmit = useOnSubmitNewResource()

    return (
        <FormBase
            initialValues={resourceNewInitialValues as ResourceNewSubmitValues}
            onSubmit={onSubmit}
            validate={validateResourceNewForm}
        >
            <DefaultNewFormContents section={section}>
                <NewResourceFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
