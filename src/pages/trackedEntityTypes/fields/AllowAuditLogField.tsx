import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'

export function AllowAuditLogField() {
    return (
        <Field
            component={CheckboxFieldFF}
            type="checkbox"
            name="allowAuditLog"
            dataTest="formfields-allowAuditLog"
            label={i18n.t('Record access to tracked entities')}
            validateFields={[]}
        />
    )
}
