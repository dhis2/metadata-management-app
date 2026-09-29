import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { FEATURES, useFeatureAvailable } from '../../../lib'

export function AllowAuditLogField() {
    const hasChangeLogSupport = useFeatureAvailable(FEATURES.enableChangeLog)
    const label = hasChangeLogSupport
        ? i18n.t('Record access to tracked entities')
        : i18n.t('Enable tracked entity instance audit log')

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
