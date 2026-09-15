import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import { DefaultEditFormContents, FormBase } from '../../components'
import {
    useOnSubmitEdit,
    useBoundResourceQueryFn,
    SECTIONS_MAP,
    DEFAULT_FIELD_FILTERS,
    ATTRIBUTE_VALUES_FIELD_FILTERS,
} from '../../lib'
import { Document, PickWithFieldFilters } from '../../types/generated'
import { EditResourceFormFields, validateResourceEditForm } from './form'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'code',
    'url',
    'external',
] as const

export type ResourceEditFormValues = PickWithFieldFilters<
    Document,
    typeof fieldFilters
> & { id: string }

export const Component = () => {
    const section = SECTIONS_MAP.document
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string

    const query = {
        resource: 'documents',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const resource = useQuery({
        queryKey: [query],
        queryFn: queryFn<ResourceEditFormValues>,
    })
    const onSubmit = useOnSubmitEdit({ modelId, section })

    if (resource.data && !resource.data.external) {
        return (
            <NoticeBox warning title={i18n.t('File resources')}>
                {i18n.t(
                    'File resources cannot be edited. Only resources with a URL can be modified.'
                )}
            </NoticeBox>
        )
    }

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={resource.data}
            validate={validateResourceEditForm}
        >
            <DefaultEditFormContents section={section}>
                <EditResourceFormFields />
            </DefaultEditFormContents>
        </FormBase>
    )
}
