import i18n from '@dhis2/d2-i18n'
import { FieldGroup, RadioFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'

export const DataApprovalMergeStrategyField = ({
    label,
    helpText,
}: {
    label?: string
    helpText?: string
}) => (
    <FieldGroup label={label} helpText={helpText}>
        <Field<string | undefined>
            name="dataApprovalMergeStrategy"
            component={RadioFieldFF}
            label={i18n.t(
                'Move data approvals to the target organisation unit'
            )}
            value="LAST_UPDATED"
            type="radio"
        />
        <Field<string | undefined>
            name="dataApprovalMergeStrategy"
            component={RadioFieldFF}
            label={i18n.t('Delete the source data approvals')}
            value="DISCARD"
            type="radio"
        />
    </FieldGroup>
)
