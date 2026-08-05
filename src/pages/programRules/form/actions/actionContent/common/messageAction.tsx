import i18n from '@dhis2/d2-i18n'
import React, { ReactNode } from 'react'
import { StandardFormField } from '../../../../../../components'
import {
    ActionTextInputField,
    DataElementField,
    ExpressionField,
    TrackedEntityAttributeField,
} from '../../../../fields'

export function messageActionFields(
    programId: string,
    isWarning: boolean,
    programType?: string
): ReactNode {
    const dataElementLabel = isWarning
        ? i18n.t('Data element to display warning next to')
        : i18n.t('Data element to display error next to')
    const trackedEntityAttributeLabel = isWarning
        ? i18n.t('Tracked entity attribute to display warning next to')
        : i18n.t('Tracked entity attribute to display error next to')
    return (
        <>
            <StandardFormField>
                <DataElementField
                    programId={programId}
                    label={dataElementLabel}
                />
            </StandardFormField>
            <StandardFormField>
                <TrackedEntityAttributeField
                    programId={programId}
                    label={trackedEntityAttributeLabel}
                />
            </StandardFormField>
            <StandardFormField>
                <ActionTextInputField
                    name="content"
                    label={i18n.t('Static text')}
                    required
                />
            </StandardFormField>
            <StandardFormField>
                <ExpressionField
                    programId={programId}
                    programType={programType}
                    label={i18n.t(
                        'Expression to evaluate and display after static text.'
                    )}
                />
            </StandardFormField>
        </>
    )
}
