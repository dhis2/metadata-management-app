import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import { DEFAULT_FIELD_FILTERS, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { CategoryCombo, PickWithFieldFilters } from '../../types/generated'
import { validate, CategoryComboFormFields } from './form'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'code',
    'categories[id,displayName,categoryOptions~size~rename(categoryOptionsSize)],',
    'skipTotal',
    'dataDimensionType',
] as const

export type CategoryComboFormValues = PickWithFieldFilters<
    CategoryCombo,
    typeof fieldFilters
> & { id: string }

const section = SECTIONS_MAP.categoryCombo

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'categoryCombos',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const categoryCombo = useQuery({
        queryKey: [query],
        queryFn: queryFn<CategoryComboFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<CategoryComboFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        return categoryCombo.data ? omit(categoryCombo.data, 'id') : undefined
    }, [categoryCombo.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            includeAttributes={false}
            fetchError={!!categoryCombo.error}
        >
            <DefaultCloneFormContents section={section}>
                <CategoryComboFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
