import i18n from '@dhis2/d2-i18n'
import React, { ReactNode } from 'react'
import { StandardFormField } from '../../../../../components'
import {
    ActionTextInputField,
    ExpressionField,
    LocationField,
} from '../../../fields'

export function displayText(
    programId: string,
    isEdit?: boolean,
    programType?: string
): ReactNode {
    return (
        <>
            <StandardFormField>
                <LocationField required />
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
