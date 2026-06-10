import React from 'react'
import { ModelTransferField } from '../../../components'
import { SECTIONS_MAP } from '../../../lib'

export function DataElementsField() {
    return (
        <ModelTransferField
            dataTest="dataElements-transfer"
            name="dataElements"
            query={{
                resource: 'dataElements',
                params: {
                    fields: ['id', 'displayName'],
                },
            }}
            transferSection={SECTIONS_MAP.dataElement}
            filterUnassignedTo={'dataElementGroups'}
            maxSelections={Infinity}
        />
    )
}
