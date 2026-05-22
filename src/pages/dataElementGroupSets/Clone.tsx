import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import {
    DEFAULT_FIELD_FILTERS,
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useOnSubmitNew,
} from '../../lib'
import {
    DataElementGroupSet,
    PickWithFieldFilters,
} from '../../types/generated'
import { DataElementGroupSetFormFields, validate } from './form'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'shortName',
    'code',
    'description',
    'compulsory',
    'dataDimension',
    'dataElementGroups[id,displayName]',
] as const

export type DataElementGroupSetFormValues = PickWithFieldFilters<
    DataElementGroupSet,
    typeof fieldFilters
> & { id: string }

export const Component = () => {
    const section = SECTIONS_MAP.dataElementGroupSet
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'dataElementGroupSets',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const dataElementGroupSet = useQuery({
        queryKey: [query],
        queryFn: queryFn<DataElementGroupSetFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<DataElementGroupSetFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        return dataElementGroupSet.data
            ? omit(dataElementGroupSet.data, 'id')
            : undefined
    }, [dataElementGroupSet.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!dataElementGroupSet.error}
        >
            <DefaultCloneFormContents section={section}>
                <DataElementGroupSetFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
