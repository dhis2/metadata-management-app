import { useCallback } from 'react'
import { ModelSection } from '../../types'
import {
    SECTIONS_MAP,
    isSchemaSection,
    Section,
    SchemaSection,
    isOverviewSection,
} from '../constants'
import { useSchemas } from '../schemas'
import { useSystemSetting } from '../systemSettings'
import { ModelSchemas } from '../useLoadApp'
import {
    canCreate,
    hasCreateAuthority,
    isNonCreateableSchema,
    useCurrentUserAuthorities,
} from '../user'
type UserAuthorities = ReturnType<typeof useCurrentUserAuthorities>

const isNonCreateableSection = (section: Section): section is SchemaSection => {
    return isSchemaSection(section) && isNonCreateableSchema(section.name)
}

/**
 * Checks if a model can be created in a section
 * Note that this is different from being authorized to view the section
 * Since authoritzation depends on systemSetting keyRequiredAddToView
 */

function canCreateModelInSection(
    section: ModelSection,
    userAuthorities: UserAuthorities,
    schemas: ModelSchemas
): boolean {
    if (isSchemaSection(section)) {
        const schema = schemas[section.name]
        // Schemas with no authorities defined are publicly accessible (e.g. icons)
        if (!schema?.authorities?.length) {
            return true
        }
        return canCreate(schema, userAuthorities)
    } else {
        // NonSchemaSection
        if (!section.authorities) {
            return true
        }
        return hasCreateAuthority(section.authorities, userAuthorities)
    }
}

/**
 * Authorization (ie if a section should be viewable) of a section is determined by the following:
 *  - if systemSetting `keyRequireAddToView` is false, sections are always authorized
 *  - if `keyRequireAddToView` is true, the user must have any CREATE authority on the schema
 *  - overviewSections are authorized if any of their child sections are authorized
 * Returns a predicate because it's more versatile than a direct hook, since the
 * check can be used in loops.
 * @returns a predicate that can be used to check if a section is authorized
 */
export const useIsSectionAuthorizedPredicate = () => {
    const userAuthorities = useCurrentUserAuthorities()
    const schemas = useSchemas()
    const requireCreateAuthToView = useSystemSetting('keyRequireAddToView')

    const isSectionAuthorizedPredicate = useCallback(
        (section: Section): boolean => {
            if (!requireCreateAuthToView) {
                return true
            }
            // Schemas with no authorities defined are publicly accessible (e.g. icons)
            if (
                isSchemaSection(section) &&
                !schemas[section.name]?.authorities?.length
            ) {
                return true
            }
            // if schema is non-creatable, we still need to check authority for creation
            // but circumvent the check for nonCreateableSchemas that is done in canCreate,
            // since the section should still be viewable
            if (isNonCreateableSection(section)) {
                return hasCreateAuthority(
                    schemas[section.name].authorities,
                    userAuthorities
                )
            }
            if (isOverviewSection(section)) {
                // check that any of the child sections are authorized
                const childSections = Object.values(SECTIONS_MAP).filter(
                    (childSection) =>
                        childSection.parentSectionKey === section.name
                )
                return childSections.some((childSection) =>
                    isSectionAuthorizedPredicate(childSection)
                )
            }
            return canCreateModelInSection(section, userAuthorities, schemas)
        },
        [schemas, userAuthorities, requireCreateAuthToView]
    )

    return isSectionAuthorizedPredicate
}

export const useCanCreateModelInSection = (section: ModelSection) => {
    const userAuthorities = useCurrentUserAuthorities()
    const schemas = useSchemas()

    return canCreateModelInSection(section, userAuthorities, schemas)
}
