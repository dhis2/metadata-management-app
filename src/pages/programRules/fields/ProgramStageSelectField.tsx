import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { ModelSingleSelectFormField } from '../../../components/metadataFormControls/ModelSingleSelect'

export function ProgramStageSelectField({
    programId,
    label = i18n.t('Program stage'),
    required,
}: Readonly<{
    programId: string
    label?: string
    required?: boolean
}>) {
    const PROGRAM_STAGES_QUERY = {
        resource: 'programStages' as const,
        params: {
            fields: ['id', 'displayName'],
            filter: `program.id:eq:${programId}`,
            paging: false,
        },
    }

    return (
        <ModelSingleSelectFormField
            label={label}
            query={PROGRAM_STAGES_QUERY}
            clearable={!required}
            format={(value) => value ?? undefined}
            name={'programStage'}
            required={required}
        />
    )
}
