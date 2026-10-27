import { ExpressionBuilderType } from './types'
import {
    defaultElementTypes,
    Element,
    ElementType,
    featureVersionFilter,
    getElementTypes,
} from './ValidationRuleVariables'

describe('getElementTypes', () => {
    it('returns the element list as-is, without invoking featureVersionFilter, when type is not programRule', () => {
        const result = getElementTypes('default', {
            aggregationType: undefined,
            currentVersion: { minor: 44, patch: 2 },
        })

        // featureVersionFilter always builds a fresh copy of the list (and of
        // each entry) before filtering, so referential equality with the
        // original, unfiltered list proves no filtering pass happened.
        expect(result).toBe(defaultElementTypes)
    })
})

describe('featureVersionFilter', () => {
    const currentVersion = { minor: 43, patch: 2 }

    // 5 elements with no version info at all - always kept
    const noVersionElements: Element[] = Array.from({ length: 5 }, (_, i) => ({
        id: `no-version-${i}`,
        displayName: `No version info ${i}`,
    }))

    // 2 elements with only versionSupport.minor (no patched)
    const minorOnlyKept: Element = {
        id: 'minor-only-kept',
        displayName: 'Minor only, below current minor',
        versionSupport: { minor: 40 },
    }
    const minorOnlyFiltered: Element = {
        id: 'minor-only-filtered',
        displayName: 'Minor only, at current minor',
        versionSupport: { minor: 43 },
    }
    const minorAboveFiltered: Element = {
        id: 'minor-only-filtered',
        displayName: 'Minor only, above current minor',
        versionSupport: { minor: 44 },
    }

    // 3 elements with versionSupport.patched (>= 3 entries each)
    const patchedKeptViaMinor: Element = {
        id: 'patched-kept-via-minor',
        displayName: 'Patched, but already kept via minor',
        versionSupport: {
            minor: 40,
            patched: [
                { minor: 37, patch: 1 },
                { minor: 38, patch: 3 },
                { minor: 39, patch: 5 },
            ],
        },
    }
    const patchedKeptViaExactMatch: Element = {
        id: 'patched-kept-via-match',
        displayName: 'Patched, kept via exact patch match',
        versionSupport: {
            minor: 44,
            patched: [
                { minor: 42, patch: 6 },
                { minor: 43, patch: 2 },
            ],
        },
    }
    const patchedFilteredNoMatch: Element = {
        id: 'patched-filtered-no-match',
        displayName: 'Patched, filtered out, no match',
        versionSupport: {
            minor: 44,
            patched: [
                { minor: 41, patch: 9 },
                { minor: 42, patch: 6 },
                { minor: 43, patch: 3 },
            ],
        },
    }

    const mockElements: Element[] = [
        ...noVersionElements,
        minorOnlyKept,
        minorOnlyFiltered,
        minorAboveFiltered,
        patchedKeptViaMinor,
        patchedKeptViaExactMatch,
        patchedFilteredNoMatch,
    ]

    it('filters elementList.elements appropriately when currentVersion is provided, and alters nothing else', () => {
        const mockElementList: ElementType[] = [
            {
                type: 'programRule',
                name: 'Mock program rule',
                elements: mockElements,
                component: () => null,
            },
        ]

        const [original] = mockElementList
        const [result] = featureVersionFilter(
            original.type as ExpressionBuilderType,
            mockElementList,
            currentVersion
        )

        // only `elements` should differ from the original entry
        expect(result).not.toBe(original)
        expect(result.type).toEqual(original.type)
        expect(result.name).toEqual(original.name)
        expect(result.component).toBe(original.component)

        expect(result.elements).toEqual([
            ...noVersionElements,
            minorOnlyKept,
            minorOnlyFiltered,
            patchedKeptViaMinor,
            patchedKeptViaExactMatch,
        ])
        expect(result.elements).not.toContainEqual(patchedFilteredNoMatch)
        expect(result.elements).not.toContainEqual(minorAboveFiltered)
    })

    it('makes no changes when elementList.elements is undefined', () => {
        const mockElementListWithoutElements: ElementType[] = [
            {
                type: 'prograumRule',
                name: 'Mock program rule',
                component: () => null,
            },
        ]

        const [original] = mockElementListWithoutElements
        const result = featureVersionFilter(
            original.type as ExpressionBuilderType,
            mockElementListWithoutElements,
            currentVersion
        )

        expect(result).toEqual(mockElementListWithoutElements)
        expect(result[0].elements).toBeUndefined()
    })
})
