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
    const duplicatedModelId = searchParams.get('duplicatedId') as string

    const query = {
        resource: 'categoryOptionGroups',
        id: duplicatedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const categoryOptionGroupQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<CategoryOptionGroupFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={omit(categoryOptionGroupQuery.data, 'id')}
            validate={validate}
            fetchError={!!categoryOptionGroupQuery.error}
        >
            <DefaultDuplicateFormContents section={section}>
                <CategoryOptionGroupFormFields />
            </DefaultDuplicateFormContents>
        </FormBase>
    )
}
