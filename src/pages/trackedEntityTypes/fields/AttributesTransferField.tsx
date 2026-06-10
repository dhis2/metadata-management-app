import { Field } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import { ModelTransferFrom } from '../../../components'
import css from '../../../components/metadataFormControls/ModelTransfer/ModelTransfer.module.css'
import { SECTIONS_MAP } from '../../../lib'
import { DisplayableModel } from '../../../types/models'

type TrackedEntityAttribute = {
    id: string
    displayName: string
}

type TrackedEntityTypeAttribute = {
    mandatory: boolean
    searchable: boolean
    displayInList: boolean
    trackedEntityAttribute: TrackedEntityAttribute
}

export function AttributesTransferField() {
    const name = 'trackedEntityTypeAttributes'

    const { input, meta } = useField<
        TrackedEntityTypeAttribute[],
        HTMLElement,
        (DisplayableModel & TrackedEntityTypeAttribute)[]
    >(name, {
        format: (value) =>
            value?.map((teta) => ({
                id: teta.trackedEntityAttribute.id,
                displayName: teta.trackedEntityAttribute.displayName,
                mandatory: teta.mandatory,
                searchable: teta.searchable,
                displayInList: teta.displayInList,
                trackedEntityAttribute: teta.trackedEntityAttribute,
            })) || [],
        parse: (value) =>
            value?.map((item) => ({
                mandatory: item.mandatory,
                searchable: item.searchable,
                displayInList: item.displayInList,
                trackedEntityAttribute: item.trackedEntityAttribute,
            })) || [],
        multiple: true,
        validateFields: [],
    })

    return (
        <Field
            dataTest="formfields-attributes-transfer"
            error={meta.invalid}
            validationText={(meta.touched && meta.error?.toString()) || ''}
            name={name}
            className={css.moduleTransferField}
        >
            <ModelTransferFrom<
                DisplayableModel & TrackedEntityTypeAttribute,
                TrackedEntityAttribute
            >
                transferSection={SECTIONS_MAP.trackedEntityAttribute}
                selected={input.value}
                onChange={({ selected }) => {
                    input.onChange(selected)
                    input.onBlur()
                }}
                transform={(attributes) => {
                    return attributes.map((attr) => ({
                        id: attr.id,
                        displayName: attr.displayName,
                        trackedEntityAttribute: attr,
                        mandatory: false,
                        searchable: false,
                        displayInList: false,
                    }))
                }}
                query={{
                    resource: 'trackedEntityAttributes',
                    params: {
                        fields: ['id', 'displayName', 'valueType', 'unique'],
                        order: 'displayName:asc',
                    },
                }}
                maxSelections={Infinity}
            />
        </Field>
    )
}
