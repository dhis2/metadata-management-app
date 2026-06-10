import React from 'react'
import { ModelTransferField } from '../../../components'
import { SECTIONS_MAP } from '../../../lib'

export function DataElementGroupsField() {
    return (
        <ModelTransferField
            dataTest="dataElementGroups-transfer"
            name="dataElementGroups"
            query={{
                resource: 'dataElementGroups',
                params: {
                    fields: ['id', 'displayName'],
                },
            }}
            transferSection={SECTIONS_MAP.dataElementGroup}
            maxSelections={Infinity}
            enableOrderChange={true}
        />
    )
}
