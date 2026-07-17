import i18n from '@dhis2/d2-i18n'
import React, { ReactNode } from 'react'
import { StandardFormField } from '../../../../../components'
import {
    DataElementField,
    ExpressionField,
    ProgramRuleVariableField,
    TrackedEntityAttributeField,
} from '../../../fields'

export function assign(
    programId: string,
    isEdit?: boolean,
    programType?: string
): ReactNode {
    return (
        <>
            <StandardFormField>
                <DataElementField
                    programId={programId}
                    label={i18n.t('Data element to assign to')}
                />
            </StandardFormField>
            <StandardFormField>
                <TrackedEntityAttributeField
                    programId={programId}
                    label={i18n.t('Tracked entity attribute to assign to')}
                />
            </StandardFormField>
            <StandardFormField>
                <ProgramRuleVariableField programId={programId} />
            </StandardFormField>
            <StandardFormField>
                <ExpressionField
                    programId={programId}
                    programType={programType}
                    label={i18n.t('Expression to evaluate and assign')}
                    clearable={false}
                    required
                />
            </StandardFormField>
        </>
    )
}
