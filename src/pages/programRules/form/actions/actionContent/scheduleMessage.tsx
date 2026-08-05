import i18n from '@dhis2/d2-i18n'
import React, { ReactNode } from 'react'
import { StandardFormField } from '../../../../../components'
import { ExpressionField, NotificationTemplateField } from '../../../fields'

export function scheduleMessage(
    programId: string,
    isEdit?: boolean,
    programType?: string
): ReactNode {
    return (
        <>
            <StandardFormField>
                <NotificationTemplateField
                    programId={programId}
                    disabled={isEdit}
                    required
                />
            </StandardFormField>
            <StandardFormField>
                <ExpressionField
                    programId={programId}
                    programType={programType}
                    disabled={isEdit}
                    label={i18n.t('Date to send message.')}
                    required
                />
            </StandardFormField>
        </>
    )
}
