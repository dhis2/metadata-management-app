import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultEditFormContents } from '../../components/form/DefaultFormContents'
import {
    getSectionPath,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useNavigateWithSearchState,
} from '../../lib'
import { createFormError } from '../../lib/form/createFormError'
import { EnhancedOnSubmit } from '../../lib/form/useOnSubmit'
import {
    IconFormFields,
    IconModel,
    keywordsToString,
    stringToKeywords,
} from './form'

const section = SECTIONS_MAP.icon

type IconEditSubmitValues = {
    id?: string
    key?: string
    description?: string
    keywords?: string
}

const useOnSubmitEditIcon = (
    iconKey: string
): EnhancedOnSubmit<IconEditSubmitValues> => {
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
                await dataEngine.mutate({
                    resource: 'icons',
                    id: iconKey,
                    type: 'update',
                    data: {
                        description: values.description ?? '',
                        keywords: stringToKeywords(values.keywords),
                    },
                })

                saveAlert.show({
                    message: i18n.t('Icon saved successfully'),
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
        [dataEngine, queryClient, saveAlert, navigate, iconKey]
    )
}

export const Component = () => {
    const iconKey = useParams().id as string
    const queryFn = useBoundResourceQueryFn()

    const { data, error } = useQuery({
        queryKey: [{ resource: 'icons', id: iconKey }],
        queryFn: queryFn<IconModel>,
    })

    const onSubmit = useOnSubmitEditIcon(iconKey)

    const initialValues: IconEditSubmitValues | undefined = data
        ? {
              key: data.key,
              description: data.description ?? '',
              keywords: keywordsToString(data.keywords),
          }
        : undefined

    if (error) {
        return (
            <NoticeBox error title={i18n.t('Failed to load icon')}>
                {i18n.t('Could not load icon "{{key}}"', { key: iconKey })}
            </NoticeBox>
        )
    }

    if (data && !data.custom) {
        return (
            <NoticeBox warning title={i18n.t('System icon')}>
                {i18n.t(
                    'System icons cannot be edited. Only custom icons can be modified.'
                )}
            </NoticeBox>
        )
    }

    return (
        <FormBase
            initialValues={initialValues}
            onSubmit={onSubmit}
            includeAttributes={false}
        >
            <DefaultEditFormContents section={section}>
                <IconFormFields mode="edit" href={data?.href} />
            </DefaultEditFormContents>
        </FormBase>
    )
}
