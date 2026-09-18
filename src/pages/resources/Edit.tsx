import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import { DefaultEditFormContents, FormBase } from '../../components'
import { DefaultFormFooter } from '../../components/form/DefaultFormFooter'
import {
    useBoundResourceQueryFn,
    SECTIONS_MAP,
    DEFAULT_FIELD_FILTERS,
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    getSectionPath,
} from '../../lib'
import { Document, PickWithFieldFilters } from '../../types/generated'
import {
    ResourceFormFields,
    ResourceType,
    useOnSubmitResource,
    validateResourceForm,
} from './form'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'code',
    'url',
    'external',
    'attachment',
] as const

export type ResourceEditFormValues = PickWithFieldFilters<
    Document,
    typeof fieldFilters
> & { id: string; resourceType?: ResourceType; file?: File | null }

const section = SECTIONS_MAP.document

export const Component = () => {
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
    const onSubmit = useOnSubmitResource({
        modelId,
        successMessage: i18n.t('Resource saved successfully'),
    })

    if (resource.data && !resource.data.external) {
        return (
            <NoticeBox warning title={i18n.t('File resources')}>
                {i18n.t(
                    'File resources cannot be edited. Only resources with a URL can be modified.'
                )}
            </NoticeBox>
        )
    }

    const initialValues = resource.data && {
        ...resource.data,
        resourceType: ResourceType.URL,
    }

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validateResourceForm}
        >
            <DefaultEditFormContents
                section={section}
                footer={
                    <DefaultFormFooter
                        cancelTo={`/${getSectionPath(section)}`}
                        showSaveButton={false}
                    />
                }
            >
                <ResourceFormFields />
            </DefaultEditFormContents>
        </FormBase>
    )
}
