import React from 'react'
import { ModelTransferField } from '../../../components'
import { SECTIONS_MAP } from '../../../lib'

export function LegendSetField() {
    return (
        <ModelTransferField
            dataTest="legendset-transfer"
            name="legendSets"
            query={{
                resource: 'legendSets',
                params: {
                    fields: ['id', 'displayName'],
                },
            }}
            transferSection={SECTIONS_MAP.legendSet}
            maxSelections={Infinity}
        />
    )
}
