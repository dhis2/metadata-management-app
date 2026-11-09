import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'

export function EnableChangeLogField() {
    return (
        <Field
            component={CheckboxFieldFF}
            type="checkbox"
            name="enableChangeLog"
            dataTest="formfields-enableChangeLog"
            label={i18n.t('Record change history for attribute values')}
            validateFields={[]}
        />
    )
}
