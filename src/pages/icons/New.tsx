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
import {
    IconFormFields,
    initialValues,
    stringToKeywords,
    validate,
} from './form'

const section = SECTIONS_MAP.icon

type IconNewSubmitValues = {
    key?: string
    description?: string
    keywords?: string
    file?: File | null
    id?: string
}

const useOnSubmitNewIcon = (): EnhancedOnSubmit<IconNewSubmitValues> => {
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
                const uploadResponse = (await dataEngine.mutate({
                    resource: 'fileResources',
                    type: 'create',
                    data: { file: values.file, domain: 'ICON' },
                })) as { response: { fileResource: { id: string } } }

                const fileResourceId = uploadResponse.response.fileResource.id

                await dataEngine.mutate({
                    resource: 'icons',
                    type: 'create',
                    data: {
                        key: values.key,
                        description: values.description ?? '',
                        keywords: stringToKeywords(values.keywords),
                        fileResourceId,
                    },
                })

                saveAlert.show({
                    message: i18n.t('Icon created successfully'),
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

export const Component = () => {
    const onSubmit = useOnSubmitNewIcon()

    return (
        <FormBase
            initialValues={initialValues as IconNewSubmitValues}
            onSubmit={onSubmit}
            validate={validate}
            includeAttributes={false}
        >
            <DefaultNewFormContents section={section}>
                <IconFormFields mode="new" />
            </DefaultNewFormContents>
        </FormBase>
    )
}
