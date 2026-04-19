import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultDuplicateFormContents } from '../../components/form/DefaultFormContents'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    SECTIONS_MAP,
    useOnSubmitNew,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters } from '../../types/generated'
import { CategoryOptionGroupSet } from '../../types/models'
import CategoryOptionGroupSetFormFields from './form/CategoryOptionGroupSetFormFields'
import { validate } from './form/categoryOptionGroupSetSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'shortName',
    'code',
    'description',
    'categoryOptionGroups[id,displayName]',
    'dataDimension',
    'dataDimensionType',
] as const

export type CategoryOptionGroupSetFormValues = PickWithFieldFilters<
    CategoryOptionGroupSet,
    typeof fieldFilters
> & { id: string }

const section = SECTIONS_MAP.categoryOptionGroupSet

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const duplicatedModelId = searchParams.get('duplicatedId') as string

    const query = {
        resource: 'categoryOptionGroupSets',
        id: duplicatedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const categoryOptionGroupSetQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<CategoryOptionGroupSetFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={omit(categoryOptionGroupSetQuery.data, 'id')}
            validate={validate}
            fetchError={!!categoryOptionGroupSetQuery.error}
        >
            <DefaultDuplicateFormContents section={section}>
                <CategoryOptionGroupSetFormFields />
            </DefaultDuplicateFormContents>
        </FormBase>
    )
}
