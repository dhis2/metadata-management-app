import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
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
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'categoryOptionGroupSets',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const categoryOptionGroupSetQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<CategoryOptionGroupSetFormValues>,
    })

    const onSubmit = useOnSubmitNew<
        Omit<CategoryOptionGroupSetFormValues, 'id'>
    >({ section })

    const initialValues = useMemo(() => {
        return categoryOptionGroupSetQuery.data
            ? omit(categoryOptionGroupSetQuery.data, 'id')
            : undefined
    }, [categoryOptionGroupSetQuery.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!categoryOptionGroupSetQuery.error}
        >
            <DefaultCloneFormContents section={section}>
                <CategoryOptionGroupSetFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
