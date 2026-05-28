import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import { DefaultEditFormContents, FormBase } from '../../components'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useOnSubmitEditWithGroups,
} from '../../lib'
import { DataElement, PickWithFieldFilters } from '../../types/generated'
import { DataElementFormFields, validate } from './form'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
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
    'dataElementGroups[id,displayName]',
] as const

export type DataElementFormValues = PickWithFieldFilters<
    DataElement,
    typeof fieldFilters
> & { id: string }

export const Component = () => {
    const section = SECTIONS_MAP.dataElement
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string

    const query = {
        resource: 'dataElements',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const dataElement = useQuery({
        queryKey: [query],
        queryFn: queryFn<DataElementFormValues>,
    })
    return (
        <FormBase
            onSubmit={useOnSubmitEditWithGroups({
                modelId,
                section,
                groupResource: 'dataElementGroups',
            })}
            initialValues={dataElement.data}
            validate={validate}
        >
            <DefaultEditFormContents section={section}>
                <DataElementFormFields />
            </DefaultEditFormContents>
        </FormBase>
    )
}
