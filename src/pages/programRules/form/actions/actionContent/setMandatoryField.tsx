import i18n from '@dhis2/d2-i18n'
import React, { ReactNode } from 'react'
import { StandardFormField } from '../../../../../components'
import { DataElementField, TrackedEntityAttributeField } from '../../../fields'

export function setMandatoryField(programId: string): ReactNode {
    return (
        <>
            <StandardFormField>
                <DataElementField
                    programId={programId}
                    label={i18n.t('Data element to make mandatory')}
                />
            </StandardFormField>
            <StandardFormField>
                <TrackedEntityAttributeField
                    programId={programId}
                    label={i18n.t('Tracked entity attribute to make mandatory')}
                />
            </StandardFormField>
        </>
    )
}
