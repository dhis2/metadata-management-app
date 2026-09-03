import { Section } from '../constants'
import { useModelSectionHandleOrThrow } from '../routeUtils'

export const isSectionBulkDeletable = (section: Section): boolean => {
    return section.bulkDeletable !== false
}

export const useCanBulkDeleteModelInCurrentSection = () => {
    const section = useModelSectionHandleOrThrow()
    return isSectionBulkDeletable(section)
}
