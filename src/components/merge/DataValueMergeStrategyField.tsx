import i18n from '@dhis2/d2-i18n'
import { FieldGroup, RadioFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'

export const DataValueMergeStrategyField = ({
    label,
    helpText,
}: {
    label?: string
    helpText?: string
}) => (
    <FieldGroup label={label} helpText={helpText}>
        <Field<string | undefined>
            name="dataMergeStrategy"
            component={RadioFieldFF}
            label={i18n.t('Move data values to the target data element')}
            value="LAST_UPDATED"
            type="radio"
        />
        <Field<string | undefined>
            name="dataMergeStrategy"
            component={RadioFieldFF}
            label={i18n.t('Delete the source data values')}
            value="DISCARD"
            type="radio"
        />
    </FieldGroup>
)
