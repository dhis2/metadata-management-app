import i18n from '@dhis2/d2-i18n'
import React, { useCallback } from 'react'
import { useField } from 'react-final-form'
import { useHref } from 'react-router'
import {
    EditableInputWrapper,
    ConfirmationModalWrapper,
} from '../../../components'
import {
    ModelSingleSelectFormField,
    useRefreshModelSingleSelect,
} from '../../../components/metadataFormControls/ModelSingleSelect'
import { getConstantTranslation } from '../../../lib'

export function OptionSetField() {
    const newOptionSetLink = useHref('/optionSets/new')
    const refresh = useRefreshModelSingleSelect({ resource: 'optionSets' })
    const { input } = useField('optionSet')
    const { input: valueTypeInput } = useField('valueType')

    const inputWrapper = useCallback(
        (select: React.ReactElement) => (
            <EditableInputWrapper
                onRefresh={() => refresh()}
                onAddNew={() => window.open(newOptionSetLink, '_blank')}
            >
                {select}
            </EditableInputWrapper>
        ),
        [refresh, newOptionSetLink]
    )

    const renderComponent = ({
        onChange,
    }: {
        onChange: (event: any) => void
    }) => (
        <ModelSingleSelectFormField
            fullyOverrideOnChange={true}
            onChange={onChange}
            showNoValueOption
            inputWidth="400px"
            dataTest="formfields-optionset"
            name="optionSet"
            label={i18n.t('Option set')}
            query={{
                resource: 'optionSets',
                params: {
                    fields: ['id', 'displayName', 'valueType'],
                    order: ['displayName'],
                },
            }}
            helpText={i18n.t(
                'Limit data entry to a predefined list of options. Overrides value type selection to match the option set.'
            )}
            inputWrapper={inputWrapper}
        />
    )

    return (
        <ConfirmationModalWrapper
            onChange={(selected) => {
                input.onChange(selected)
                input.onBlur()
            }}
            renderComponent={renderComponent}
            skipConfirmationLogic={(selection) => {
                return (
                    !selection || selection?.valueType === valueTypeInput?.value
                )
            }}
            modalTitle={i18n.t('Change option set and value type?')}
            modalMessageSelectionSpecificConfirmation={(selection) =>
                i18n.t(
                    'Current option set {{currentOptionSet}} uses value type {{currentValueType}}, but {{newOptionSet}} uses value type {{newValueType}}. If this data element already has data, making this change can make existing values incompatible and affect analytics tables. Continue anyway?',
                    {
                        currentOptionSet:
                            input.value?.displayName ??
                            i18n.t('current option set'),
                        currentValueType: getConstantTranslation(
                            valueTypeInput.value
                        ),
                        newOptionSet:
                            selection?.displayName ?? i18n.t('new option set'),
                        newValueType: getConstantTranslation(
                            selection.valueType
                        ),
                    }
                )
            }
            confirmButtonLabel={() => i18n.t('Change option set')}
        />
    )
}
