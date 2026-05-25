type ProgramStageDataElement = {
    compulsory: boolean
    dataElement: { id: string; displayName: string }
}

type ProgramStageSection = {
    id?: string
    deleted?: boolean
    dataElements?: Array<{ id: string }>
}

export const getMandatoryDataElementsMissingFromSections = ({
    programStageDataElements = [],
    programStageSections = [],
}: {
    programStageDataElements?: ProgramStageDataElement[]
    programStageSections?: ProgramStageSection[]
}): ProgramStageDataElement[] => {
    const compulsoryDataElements = programStageDataElements.filter(
        (de) => de.compulsory
    )

    if (compulsoryDataElements.length === 0) {
        return []
    }

    const assignedDataElementIds = new Set(
        programStageSections
            .filter((section) => !section.deleted)
            .flatMap((section) =>
                (section.dataElements ?? []).map((de) => de.id)
            )
    )

    return compulsoryDataElements.filter(
        (de) => !assignedDataElementIds.has(de.dataElement.id)
    )
}
