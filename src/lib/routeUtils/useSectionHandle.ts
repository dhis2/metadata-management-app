import { useMatches } from 'react-router-dom'
import { MatchRouteHandle } from '../../app/routes/types'
import {
    ModelSection,
    NonSchemaSection,
    SchemaSection,
    Section,
} from '../../types'
import { isOverviewSection, isSchemaSection } from '../constants'

export const useSectionHandle = (): Section | undefined => {
    const matches = useMatches() as MatchRouteHandle[]
    const match = matches.find((routeMatch) => routeMatch.handle?.section)

    return match?.handle?.section
}

export const useModelSectionHandleOrThrow = (): ModelSection => {
    const section = useSectionHandle()

    if (!section || isOverviewSection(section)) {
        throw new Error('Could not find model section handle')
    }

    return section
}

export const useSchemaSectionHandleOrThrow = (): SchemaSection => {
    const section = useSectionHandle()

    if (!section || !isSchemaSection(section)) {
        throw new Error('Could not find schema section handle')
    }
    return section
}

export const useNonSchemaSectionHandleOrThrow = (): NonSchemaSection => {
    const section = useSectionHandle()

    if (!section || isSchemaSection(section) || isOverviewSection(section)) {
        throw new Error('Could not find section handle')
    }
    return section
}

export const useGivenShemaOrSchemaSectionHandleOrThrow = ({
    section,
}: {
    section?: Section
}): SchemaSection => {
    const sectionFromHandle = useSectionHandle()
    if (section && isSchemaSection(section)) {
        return section
    }

    if (!sectionFromHandle || !isSchemaSection(sectionFromHandle)) {
        throw new Error('Could not find schema section handle')
    }
    return sectionFromHandle
}
