import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { AnalyticsTableHookFormFields } from './form/AnalyticsTableHookFormFields'
import {
    AnalyticsTableHookFormValues,
    validate,
} from './form/analyticsTableHookSchema'
import { fieldFilters } from './form/fieldFilters'

const section = SECTIONS_MAP.analyticsTableHook

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'analyticsTableHooks',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const analyticsTableHookQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<AnalyticsTableHookFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<AnalyticsTableHookFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(
        () =>
            analyticsTableHookQuery.data
                ? omit(analyticsTableHookQuery.data, 'id')
                : undefined,
        [analyticsTableHookQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!analyticsTableHookQuery.error}
            includeAttributes={false}
        >
            <DefaultCloneFormContents section={section}>
                <AnalyticsTableHookFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
