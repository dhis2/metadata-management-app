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

/* Program selector shown in the Basic information section of the standalone
   program stage form. A stage must belong to a program, so this is required.
   In the in-program drawer the program is implied by the route and this field
   is not rendered. */
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
