import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultDuplicateFormContents } from '../../components/form/DefaultFormContents'
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
    'displayName',
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
    const duplicatedModelId = searchParams.get('duplicatedId') as string

    const query = {
        resource: 'categories',
        id: duplicatedModelId,
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
            fetchError={!!categoryQuery.error}
        >
            <DefaultDuplicateFormContents section={section}>
                <CategoryFormFields />
            </DefaultDuplicateFormContents>
        </FormBase>
    )
}
