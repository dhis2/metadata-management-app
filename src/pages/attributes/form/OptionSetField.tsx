import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import { SECTIONS_MAP } from '../../../lib'

export const OptionSetField = () => {
    return (
        <ModelSingleSelectRefreshableFormField
            inputWidth="400px"
            name="optionSet"
            label={i18n.t('Option set')}
            query={{
                resource: 'optionSets',
                params: {
                    fields: 'id,displayName,valueType',
                    order: 'displayName:iasc',
                },
            }}
            helpText={i18n.t(
                'Limit input to a set of predefined options. An option set will automatically set the value type.'
            )}
            clearable={true}
            clearText={i18n.t('Remove option set')}
            dataTest="formfields-optionSet"
            section={SECTIONS_MAP.optionSet}
        />
    )
}
