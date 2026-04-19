import i18n from '@dhis2/d2-i18n'
import { Box, Field as FieldUI } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import { PeriodTypeSelect } from '../../../components/metadataFormControls/PeriodTypeSelect/PeriodTypeSelect'
import { required as requiredValidator } from '../../../lib'

export function PeriodTypeField() {
    const { input, meta } = useField('periodType', {
        validateFields: [],
        validate: requiredValidator,
    })

    return (
        <FieldUI
            dataTest="formfields-periodtype"
            name="periodType"
            label={i18n.t('Period type')}
            required
            error={meta.touched && !!meta.error}
            validationText={meta.touched ? meta.error : undefined}
        >
            <Box width="400px" minWidth="100px">
                <PeriodTypeSelect
                    selected={input.value}
                    invalid={meta.touched && !!meta.error}
                    onChange={(selected: string) => {
                        input.onChange(selected)
                        input.onBlur()
                    }}
                />
            </Box>
        </FieldUI>
    )
}
