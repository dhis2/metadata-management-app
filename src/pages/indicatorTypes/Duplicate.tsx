import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultDuplicateFormContents } from '../../components/form/DefaultFormContents'
import { DEFAULT_FIELD_FILTERS, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { IndicatorTypesFormValues } from './Edit'
import { validate } from './form'
import { IndicatorTypesFormFields } from './form/IndicatorTypesFormFields'

const fieldFilters = [...DEFAULT_FIELD_FILTERS, 'name', 'factor'] as const

const section = SECTIONS_MAP.indicatorType
type IndicatorTypesDuplicateFormValues = IndicatorTypesFormValues & {
    attributeValues?: { attribute: { id: string }; value: string }[]
}

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const duplicatedModelId = searchParams.get('duplicatedId') as string

    const query = {
        resource: 'indicatorTypes',
        id: duplicatedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const indicatorTypeQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<IndicatorTypesDuplicateFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={omit(indicatorTypeQuery.data, 'id')}
            validate={validate}
            includeAttributes={false}
            fetchError={!!indicatorTypeQuery.error}
        >
            <DefaultDuplicateFormContents section={section}>
                <IndicatorTypesFormFields />
            </DefaultDuplicateFormContents>
        </FormBase>
    )
}
