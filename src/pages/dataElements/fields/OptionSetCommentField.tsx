import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import { SECTIONS_MAP } from '../../../lib'

export function OptionSetCommentField() {
    return (
        <ModelSingleSelectRefreshableFormField
            showNoValueOption
            inputWidth="400px"
            dataTest="formfields-commentoptionset"
            name="commentOptionSet"
            label={i18n.t('Option set comment')}
            query={{
                resource: 'optionSets',
                params: {
                    fields: ['id', 'displayName'],
                    order: ['displayName'],
                },
            }}
            helpText={i18n.t(
                'Choose a set of predefined comments for data entry.'
            )}
            section={SECTIONS_MAP.optionSet}
        />
    )
}
