import i18n from '@dhis2/d2-i18n'
import React, { useCallback } from 'react'
import { useHref } from 'react-router'
import { EditableInputWrapper } from '../../../components'
import {
    ModelSingleSelectFormField,
    useRefreshModelSingleSelect,
} from '../../../components/metadataFormControls/ModelSingleSelect'
import { required } from '../../../lib'

type IndicatorTypeFieldsProps = {
    helpText?: string
}

export const IndicatorTypeField = ({ helpText }: IndicatorTypeFieldsProps) => {
    const newIndicatorTypeLink = useHref('/indicatorTypes/new')
    const refresh = useRefreshModelSingleSelect({ resource: 'indicatorTypes' })

    const inputWrapper = useCallback(
        (select: React.ReactElement) => (
            <EditableInputWrapper
                onRefresh={() => refresh()}
                onAddNew={() => window.open(newIndicatorTypeLink, '_blank')}
            >
                {select}
            </EditableInputWrapper>
        ),
        [refresh, newIndicatorTypeLink]
    )

    return (
        <ModelSingleSelectFormField
            required
            dataTest="formfields-indicatortype"
            name="indicatorType"
            helpText={helpText}
            label={i18n.t('Indicator type')}
            validate={required}
            query={{
                resource: 'indicatorTypes',
                params: {
                    fields: ['id', 'displayName'],
                    order: 'displayName:iasc',
                },
            }}
            inputWrapper={inputWrapper}
        />
    )
}
