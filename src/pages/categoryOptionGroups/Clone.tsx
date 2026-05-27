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
import { CategoryOptionGroup } from '../../types/models'
import CategoryOptionGroupFormFields from './form/CategoryOptionGroupFormFields'
import { validate } from './form/categoryOptionGroupSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'shortName',
    'code',
    'description',
    'categoryOptions[id,displayName]',
    'dataDimensionType',
] as const

export type CategoryOptionGroupFormValues = PickWithFieldFilters<
    CategoryOptionGroup,
    typeof fieldFilters
> & { id: string }

const section = SECTIONS_MAP.categoryOptionGroup

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'categoryOptionGroups',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const categoryOptionGroupQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<CategoryOptionGroupFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<CategoryOptionGroupFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        return categoryOptionGroupQuery.data
            ? omit(categoryOptionGroupQuery.data, 'id')
            : undefined
    }, [categoryOptionGroupQuery.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!categoryOptionGroupQuery.error}
        >
            <DefaultCloneFormContents section={section}>
                <CategoryOptionGroupFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
