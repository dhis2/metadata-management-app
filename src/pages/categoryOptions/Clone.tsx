import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    SECTIONS_MAP,
    useOnSubmitNew,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { CategoryOptionFormValues } from './Edit'
import { CategoryOptionFormFields, validate } from './form'
import { transformFormValues } from './form/categoryOptionSchema'

const fieldFilters = [
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'displayName',
    'formName',
    'code',
    'shortName',
    'description',
    'startDate',
    'endDate',
    'organisationUnits[id,displayName,path]',
] as const

const section = SECTIONS_MAP.categoryOption

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'categoryOptions',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const categoryOptionCombo = useQuery({
        queryKey: [query],
        queryFn: queryFn<CategoryOptionFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<CategoryOptionFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        return categoryOptionCombo.data
            ? omit(categoryOptionCombo.data, 'id')
            : undefined
    }, [categoryOptionCombo.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            valueFormatter={transformFormValues}
            fetchError={!!categoryOptionCombo.error}
        >
            <DefaultCloneFormContents section={section}>
                <CategoryOptionFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
