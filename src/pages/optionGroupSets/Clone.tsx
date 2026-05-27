import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import { DEFAULT_FIELD_FILTERS, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters } from '../../types/generated'
import { OptionGroupSet } from '../../types/models'
import OptionGroupSetFormFields from './form/OptionGroupSetFormFields'
import { validate } from './form/optionGroupSetSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'code',
    'description',
    'dataDimensions',
    'optionSet[id,displayName]',
    'optionGroups[id,displayName]',
] as const

export type OptionGroupSetFormValues = PickWithFieldFilters<
    OptionGroupSet,
    typeof fieldFilters
>

const section = SECTIONS_MAP.optionGroupSet

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'optionGroupSets',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const optionGroupSetQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<OptionGroupSetFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<OptionGroupSetFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(
        () => omit(optionGroupSetQuery.data, 'id'),
        [optionGroupSetQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!optionGroupSetQuery.error}
            includeAttributes={false}
        >
            <DefaultCloneFormContents section={section}>
                <OptionGroupSetFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
