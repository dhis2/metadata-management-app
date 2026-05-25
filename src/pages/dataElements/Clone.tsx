import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultCloneFormContents } from '../../components/form/DefaultFormContents'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useOnSubmitNew,
} from '../../lib'
import { DataElement, PickWithFieldFilters } from '../../types/generated'
import { DataElementFormFields, validate } from './form'

const fieldFilters = [
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'displayName',
    'shortName',
    'code',
    'formName',
    'description',
    'url',
    'style[color,icon]',
    'fieldMask',
    'zeroIsSignificant',
    'domainType',
    'valueType',
    'aggregationType',
    'categoryCombo[id,displayName]',
    'commentOptionSet[id,displayName]',
    'optionSet[id,displayName,valueType]',
    'legendSets[id,displayName]',
    'aggregationLevels',
] as const

export type DataElementFormValues = PickWithFieldFilters<
    DataElement,
    typeof fieldFilters
> & { id: string }

export const Component = () => {
    const section = SECTIONS_MAP.dataElement
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'dataElements',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const dataElement = useQuery({
        queryKey: [query],
        queryFn: queryFn<DataElementFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<DataElementFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        return dataElement.data ? omit(dataElement.data, 'id') : undefined
    }, [dataElement.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!dataElement.error}
        >
            <DefaultCloneFormContents section={section}>
                <DataElementFormFields />
            </DefaultCloneFormContents>
        </FormBase>
    )
}
