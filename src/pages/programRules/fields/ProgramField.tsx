import i18n from '@dhis2/d2-i18n'
import React, { useCallback } from 'react'
import { useHref } from 'react-router'
import { EditableInputWrapper } from '../../../components'
import {
    ModelSingleSelectFormField,
    useRefreshModelSingleSelect,
} from '../../../components/metadataFormControls/ModelSingleSelect'

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
    const programNewHref = useHref('/programs/new')
    const refreshPrograms = useRefreshModelSingleSelect(PROGRAM_QUERY)

    const inputWrapper = useCallback(
        (select: React.ReactElement) => (
            <EditableInputWrapper
                onRefresh={() => refreshPrograms()}
                onAddNew={() => window.open(programNewHref, '_blank')}
            >
                {select}
            </EditableInputWrapper>
        ),
        [refreshPrograms, programNewHref]
    )

    return (
        <ModelSingleSelectFormField
            required
            inputWidth="400px"
            dataTest="program-field"
            name="program"
            label={i18n.t('Program (required)')}
            query={PROGRAM_QUERY}
            disabled={disabled}
            inputWrapper={disabled ? undefined : inputWrapper}
        />
    )
}
