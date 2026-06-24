import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useField } from 'react-final-form'
import { StandardFormField } from '../../../components'
import { ModelSingleSelectFormField } from '../../../components/metadataFormControls/ModelSingleSelect'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import { DEFAULT_CATEGORY_OPTION_COMBO, SECTIONS_MAP } from '../../../lib'

type OutputResponse = {
    id: string
    displayName: string
    categoryCombo: {
        id: string
        isDefault: boolean
    }
}

export const OperatorFields = () => {
    const { input: outputInput } = useField('output')
    const { input: outputComboInput } = useField('outputCombo')

    return (
        <>
            <StandardFormField>
                <ModelSingleSelectRefreshableFormField
                    inputWidth="400px"
                    name="output"
                    label={i18n.t('Output data element')}
                    query={{
                        resource: 'dataElements',
                        params: {
                            fields: 'id,displayName,categoryCombo[id,isDefault]',
                            order: 'displayName:iasc',
                        },
                    }}
                    clearable={false}
                    required={true}
                    dataTest="formfields-output"
                    onChange={(val: OutputResponse | undefined) => {
                        if (
                            val?.categoryCombo?.id &&
                            outputComboInput?.value?.categoryCombo?.id &&
                            val?.categoryCombo?.id !==
                                outputComboInput?.value?.categoryCombo?.id
                        ) {
                            outputComboInput.onChange(undefined)
                        }
                    }}
                    section={SECTIONS_MAP.dataElement}
                />
            </StandardFormField>
            {outputInput?.value?.categoryCombo &&
                !outputInput?.value?.categoryCombo?.isDefault && (
                    <StandardFormField>
                        <ModelSingleSelectFormField
                            inputWidth="400px"
                            showNoValueOption={{
                                value: DEFAULT_CATEGORY_OPTION_COMBO.id,
                                label: i18n.t(
                                    'Predict using input category option combination'
                                ),
                            }}
                            name="outputCombo"
                            label={i18n.t('Output category option combination')}
                            query={{
                                resource: 'categoryOptionCombos',
                                params: {
                                    fields: 'id,displayName,categoryCombo[id,isDefault]',
                                    filter: [
                                        `categoryCombo.id:eq:${outputInput?.value?.categoryCombo?.id}`,
                                        `id:neq:${DEFAULT_CATEGORY_OPTION_COMBO.id}`,
                                    ],
                                    order: 'displayName:iasc',
                                },
                            }}
                            placeholder={i18n.t(
                                'Predict using input category option combination'
                            )}
                            clearable={false}
                            dataTest="formfields-outputCombo"
                        />
                    </StandardFormField>
                )}
        </>
    )
}
