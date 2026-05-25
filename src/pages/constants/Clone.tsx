import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import ConstantFormFields from './form/ConstantFormFields'
import { ConstantFormValues, validate } from './form/ConstantFormSchema'
import { fieldFilters } from './form/fieldFilters'

const section = SECTIONS_MAP.constant

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'constants',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const constantQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<ConstantFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<ConstantFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(
        () => (constantQuery.data ? omit(constantQuery.data, 'id') : undefined),
        [constantQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!constantQuery.error}
        >
            <DefaultCloneFormContents section={section}>
                <ConstantFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
