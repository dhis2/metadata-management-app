import i18n from '@dhis2/d2-i18n'
import React, { ReactNode } from 'react'
import { StandardFormField } from '../../../../../components'
import { ExpressionField, ProgramStageSelectField } from '../../../fields'

export function scheduleEvent(
    programId: string,
    isEdit?: boolean,
    programType?: string
): ReactNode {
    return (
        <>
            <StandardFormField>
                <ProgramStageSelectField programId={programId} required />
            </StandardFormField>
            <StandardFormField>
                <ExpressionField
                    programId={programId}
                    programType={programType}
                    label={i18n.t('Program rule variable for scheduled date')}
                    required
                />
            </StandardFormField>
        </>
    )
}
