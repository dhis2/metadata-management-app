import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultDuplicateFormContents } from '../../components/form/DefaultFormContents'
import { DEFAULT_FIELD_FILTERS, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { CategoryCombo, PickWithFieldFilters } from '../../types/generated'
import { validate, CategoryComboFormFields } from './form'
import { CategoryComboFormValues as CategoryComboSchemaFormValues } from './form/categoryComboSchema'

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
> &
    Pick<CategoryComboSchemaFormValues, 'attributeValues'> & { id: string }

const section = SECTIONS_MAP.categoryCombo

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const duplicatedModelId = searchParams.get('duplicatedId') as string

    const query = {
        resource: 'categoryCombos',
        id: duplicatedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const categoryCombo = useQuery({
        queryKey: [query],
        queryFn: queryFn<CategoryComboFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={omit(categoryCombo.data, 'id')}
            validate={validate}
            includeAttributes={false}
            fetchError={!!categoryCombo.error}
        >
            <DefaultDuplicateFormContents section={section}>
                <CategoryComboFormFields />
            </DefaultDuplicateFormContents>
        </FormBase>
    )
}
