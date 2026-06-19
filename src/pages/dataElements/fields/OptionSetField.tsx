import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useField } from 'react-final-form'
import { ConfirmationModalWrapper } from '../../../components'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import { getConstantTranslation, SECTIONS_MAP } from '../../../lib'

export function OptionSetField() {
    const { input } = useField('optionSet')
    const { input: valueTypeInput } = useField('valueType')

    const renderComponent = ({
        onChange,
    }: {
        onChange: (event: unknown) => void
    }) => (
        <ModelSingleSelectRefreshableFormField
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
            section={SECTIONS_MAP.optionSet}
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
