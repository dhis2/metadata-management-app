import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { fieldFilters } from './form/fieldFilters'
import { OptionGroupFormFields } from './form/OptionGroupFormFields'
import { OptionGroupFormValues, validate } from './form/OptionGroupFormSchema'

const section = SECTIONS_MAP.optionGroup

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'optionGroups',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const optionGroupQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<OptionGroupFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<OptionGroupFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(
        () => omit(optionGroupQuery.data, 'id'),
        [optionGroupQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!optionGroupQuery.error}
            includeAttributes={false}
        >
            <DefaultCloneFormContents section={section}>
                <OptionGroupFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
