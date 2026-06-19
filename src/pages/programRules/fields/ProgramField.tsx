import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { ModelSingleSelectFormField } from '../../../components/metadataFormControls/ModelSingleSelect'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import { SECTIONS_MAP } from '../../../lib'

const PROGRAM_QUERY = {
    resource: 'programs',
    params: {
        fields: ['id', 'displayName', 'programType'],
        paging: false,
    },
}

type ProgramFieldProps = Readonly<{
    disabled?: boolean
}>

export function ProgramField({ disabled = false }: ProgramFieldProps) {
    return disabled ? (
        <ModelSingleSelectFormField
            required
            inputWidth="400px"
            dataTest="program-field"
            name="program"
            label={i18n.t('Program')}
            query={PROGRAM_QUERY}
            disabled={disabled}
        />
    ) : (
        <ModelSingleSelectRefreshableFormField
            required
            inputWidth="400px"
            dataTest="program-field"
            name="program"
            label={i18n.t('Program')}
            query={PROGRAM_QUERY}
            disabled={disabled}
            section={SECTIONS_MAP.program}
        />
    )
}
