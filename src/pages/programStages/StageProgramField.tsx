import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { ModelSingleSelectFormField } from '../../components/metadataFormControls/ModelSingleSelect'

const PROGRAMS_QUERY = {
    resource: 'programs',
    params: {
        fields: ['id', 'displayName'],
        order: 'displayName:asc',
    },
}

export const StageProgramField = () => (
    <ModelSingleSelectFormField
        name="program"
        label={i18n.t('Program')}
        required
        query={PROGRAMS_QUERY}
        validate={(program) =>
            program?.id ? undefined : i18n.t('A program is required')
        }
        dataTest="formfields-stage-program"
    />
)
