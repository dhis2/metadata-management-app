import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import { DefaultEditFormContents, FormBase } from '../../components'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    SECTIONS_MAP,
    useOnSubmitEditWithGroups,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { CategoryOption, PickWithFieldFilters } from '../../types/generated'
import { validate, CategoryOptionFormFields } from './form'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'formName',
    'code',
    'shortName',
    'description',
    'startDate',
    'endDate',
    'organisationUnits[id,displayName,path]',
    'categoryOptionGroups[id,displayName]',
] as const

export type CategoryOptionFormValues = PickWithFieldFilters<
    CategoryOption,
    typeof fieldFilters
>

const section = SECTIONS_MAP.categoryOption

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string

    const query = {
        resource: 'categoryOptions',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const categoryOptionCombo = useQuery({
        queryKey: [query],
        queryFn: queryFn<CategoryOptionFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitEditWithGroups({
                section,
                modelId,
                groupResource: 'categoryOptionGroups',
            })}
            initialValues={categoryOptionCombo.data}
            validate={validate}
        >
            <DefaultEditFormContents section={section}>
                <CategoryOptionFormFields />
            </DefaultEditFormContents>
        </FormBase>
    )
}
