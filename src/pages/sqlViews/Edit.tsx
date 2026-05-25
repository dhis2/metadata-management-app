import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import { DefaultEditFormContents, FormBase } from '../../components'
import {
    useOnSubmitEdit,
    useBoundResourceQueryFn,
    SECTIONS_MAP,
    DEFAULT_FIELD_FILTERS,
    ATTRIBUTE_VALUES_FIELD_FILTERS,
} from '../../lib'
import { SqlView, PickWithFieldFilters } from '../../types/generated'
import { SqlViewFormFields, validate } from './form'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'description',
    'type',
    'cacheStrategy',
    'sqlQuery',
] as const

export type SqlViewFormValues = PickWithFieldFilters<
    SqlView,
    typeof fieldFilters
> & { id: string }

export const Component = () => {
    const section = SECTIONS_MAP.sqlView
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string

    const query = {
        resource: 'sqlViews',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const sqlView = useQuery({
        queryKey: [query],
        queryFn: queryFn<SqlViewFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitEdit({ modelId, section })}
            initialValues={sqlView.data}
            validate={validate}
        >
            <DefaultEditFormContents section={section}>
                <SqlViewFormFields />
            </DefaultEditFormContents>
        </FormBase>
    )
}
