import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { FormBase } from '../../components'
import { DefaultDuplicateFormContents } from '../../components/form/DefaultFormContents'
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
    const duplicatedModelId = searchParams.get('duplicatedId') as string

    const query = {
        resource: 'dataElements',
        id: duplicatedModelId,
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
            onSubmit={useOnSubmitNew({ section })}
            initialValues={omit(dataElement.data, 'id')}
            validate={validate}
            fetchError={!!dataElement.error}
        >
            <DefaultDuplicateFormContents section={section}>
                <DataElementFormFields />
            </DefaultDuplicateFormContents>
        </FormBase>
    )
}
