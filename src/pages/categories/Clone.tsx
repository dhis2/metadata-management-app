import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    SECTIONS_MAP,
    useOnSubmitNew,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters } from '../../types/generated'
import { Category } from '../../types/models'
import { validate } from './form'
import { CategoryFormFields } from './form/CategoryFormFields'

const fieldFilters = [
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'shortName',
    'code',
    'description',
    'categoryOptions[id,displayName]',
    'dataDimension',
    'dataDimensionType',
] as const

export type CategoryFormValues = PickWithFieldFilters<
    Category,
    typeof fieldFilters
>

export const Component = () => {
    const section = SECTIONS_MAP.category
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'categories',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const categoryQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<CategoryFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={omit(categoryQuery.data, 'id')}
            validate={validate}
        >
            <DefaultCloneFormContents
                section={section}
                modelId={clonedModelId}
                name={categoryQuery.data?.name}
            >
                <CategoryFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
