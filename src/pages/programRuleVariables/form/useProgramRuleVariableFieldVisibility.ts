import { useMemo } from 'react'
import { ProgramRuleVariableSourceType } from '../../../types/generated'

type ProgramStageValue = { id: string } | undefined

export function useProgramRuleVariableFieldVisibility(
    sourceType: string | undefined,
    programStage: ProgramStageValue
) {
    const {
        DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE,
        DATAELEMENT_NEWEST_EVENT_PROGRAM,
        DATAELEMENT_CURRENT_EVENT,
        DATAELEMENT_PREVIOUS_EVENT,
        TEI_ATTRIBUTE,
        CALCULATED_VALUE,
    } = ProgramRuleVariableSourceType

    return useMemo(
        () => ({
            shouldShowProgramStage:
                sourceType === DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE,
            shouldShowTrackedEntityAttribute: sourceType === TEI_ATTRIBUTE,
            shouldShowValueType: sourceType === CALCULATED_VALUE,
            shouldShowDataElements:
                (sourceType === DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE &&
                    !!programStage?.id) ||
                sourceType === DATAELEMENT_NEWEST_EVENT_PROGRAM ||
                sourceType === DATAELEMENT_CURRENT_EVENT ||
                sourceType === DATAELEMENT_PREVIOUS_EVENT,
        }),
        [sourceType, programStage?.id]
    )
}
