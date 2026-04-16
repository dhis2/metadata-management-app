import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useField } from 'react-final-form'
import { ModelSingleSelectFormField } from '../../../components/metadataFormControls/ModelSingleSelect'

export function ProgramStageField() {
    const { input: programInput } = useField('program')

    if (
        !programInput?.value?.id ||
        programInput?.value?.programType === 'WITHOUT_REGISTRATION'
    ) {
        return null
    }

    return (
        <ModelSingleSelectFormField
            inputWidth="400px"
            dataTest="program-stage-field"
            name="programStage"
            label={i18n.t('Program stage to trigger rule')}
            query={{
                resource: 'programStages',
                params: {
                    fields: ['id', 'displayName'],
                    filter: [`program.id:eq:${programInput.value.id}`],
                    paging: false,
                },
            }}
            clearable
            helpText={i18n.t(
                'Select a specific program stage that the rule should only trigger on.'
            )}
        />
    )
}
