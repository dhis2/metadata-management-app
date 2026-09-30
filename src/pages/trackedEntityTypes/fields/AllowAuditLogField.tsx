import { CheckboxFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'

export function AllowAuditLogField({ label }: Readonly<{ label: string }>) {
    return (
        <Field
            component={CheckboxFieldFF}
            type="checkbox"
            name="allowAuditLog"
            dataTest="formfields-allowAuditLog"
            label={label}
            validateFields={[]}
        />
    )
}
