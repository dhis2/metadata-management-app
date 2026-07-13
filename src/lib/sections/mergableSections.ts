import { ModelSection } from '../../types'
import { SECTIONS_MAP } from '../constants'
import { useModelSectionHandleOrThrow } from '../routeUtils'
import { hasAuthority, useCurrentUserAuthorities } from '../user'

const sectionAuthorityMap = new Map<ModelSection, string>([
    [SECTIONS_MAP.indicator, 'F_INDICATOR_MERGE'],
    [SECTIONS_MAP.indicatorType, 'F_INDICATOR_TYPE_MERGE'],
    [SECTIONS_MAP.categoryOption, 'F_CATEGORY_OPTION_MERGE'],
    [SECTIONS_MAP.dataElement, 'F_DATA_ELEMENT_MERGE'],
])

export const getMergeAuthority = (
    section: ModelSection
): string | undefined => {
    return sectionAuthorityMap.get(section)
}

export const isMergableSection = (section: ModelSection): boolean => {
    return getMergeAuthority(section) !== undefined
}

const canMergeModelInSection = (
    section: ModelSection,
    userAuthorities: Set<string>
): boolean => {
    const authority = getMergeAuthority(section)

    if (authority) {
        return hasAuthority(userAuthorities, authority)
    }
    return false
}

export const useCanMergeModelInSection = (section: ModelSection) => {
    const userAuthorities = useCurrentUserAuthorities()

    return canMergeModelInSection(section, userAuthorities)
}

export const useCanMergeModelInCurrentSection = () => {
    const section = useModelSectionHandleOrThrow()
    return useCanMergeModelInSection(section)
}
