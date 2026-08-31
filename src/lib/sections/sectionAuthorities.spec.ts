import { renderHook } from '@testing-library/react'
import { SystemSettings } from '../../types'
import { OVERVIEW_SECTIONS, SECTIONS_MAP } from '../constants'
import { useSchemaStore } from '../schemas/schemaStore'
import { useSystemSettingsStore } from '../systemSettings/systemSettingsStore'
import { ModelSchemas } from '../useLoadApp'
import { useCurrentUserStore } from '../user/currentUserStore'
import { SchemaName } from './../../types/schemaBase'
import {
    useCanCreateModelInSection,
    useIsSectionAuthorizedPredicate,
} from './sectionAuthorities'

const mockedSchemas = {
    [SchemaName.dataElement]: {
        singular: 'dataElement',
        plural: 'dataElements',
        name: 'dataElement',
        displayName: 'Data Element',
        collectionName: 'dataElements',
        authorities: [
            {
                type: 'CREATE_PUBLIC',
                authorities: ['F_DATAELEMENT_PUBLIC_ADD'],
            },
            {
                type: 'CREATE_PRIVATE',
                authorities: ['F_DATAELEMENT_PRIVATE_ADD'],
            },
            {
                type: 'DELETE',
                authorities: ['F_DATAELEMENT_DELETE'],
            },
        ],
    },
    [SchemaName.dataElementGroup]: {
        singular: 'dataElementGroup',
        plural: 'dataElementGroups',
        name: 'dataElementGroup',
        displayName: 'Data Element Group',
        collectionName: 'dataElementGroups',
        authorities: [
            {
                type: 'CREATE_PUBLIC',
                authorities: ['F_DATAELEMENTGROUP_PUBLIC_ADD'],
            },
            {
                type: 'CREATE_PRIVATE',
                authorities: ['F_DATAELEMENTGROUP_PRIVATE_ADD'],
            },
            {
                type: 'DELETE',
                authorities: ['F_DATAELEMENTGROUP_DELETE'],
            },
        ],
    },
    [SchemaName.dataElementGroupSet]: {
        singular: 'dataElementGroupSet',
        plural: 'dataElementGroupSets',
        name: 'dataElementGroupSet',
        displayName: 'Data Element Group Set',
        collectionName: 'dataElementGroupSets',
        authorities: [
            {
                type: 'CREATE_PUBLIC',
                authorities: ['F_DATAELEMENTGROUPSET_PUBLIC_ADD'],
            },
            {
                type: 'CREATE_PRIVATE',
                authorities: ['F_DATAELEMENTGROUPSET_PRIVATE_ADD'],
            },
            {
                type: 'DELETE',
                authorities: ['F_DATAELEMENTGROUPSET_DELETE'],
            },
        ],
    },
    [SchemaName.category]: {
        singular: 'category',
        plural: 'categories',
        name: 'category',
        displayName: 'Category',
        collectionName: 'categories',
        authorities: [
            {
                type: 'CREATE_PUBLIC',
                authorities: ['F_CATEGORY_PUBLIC_ADD'],
            },
            {
                type: 'CREATE_PRIVATE',
                authorities: ['F_CATEGORY_PRIVATE_ADD'],
            },
            {
                type: 'DELETE',
                authorities: ['F_CATEGORY_DELETE'],
            },
        ],
    },
    [SchemaName.categoryOptionCombo]: {
        singular: 'categoryOptionCombo',
        plural: 'categoryOptionCombos',
        name: 'categoryOptionCombo',
        displayName: 'Category option combo',
        collectionName: 'categoryOptionCombos',
        authorities: [
            {
                type: 'CREATE_PUBLIC',
                authorities: ['F_CATEGORY_COMBO_PUBLIC_ADD'],
            },
            {
                type: 'CREATE_PRIVATE',
                authorities: ['F_CATEGORY_COMBO_PRIVATE_ADD'],
            },
            {
                type: 'DELETE',
                authorities: ['F_CATEGORY_COMBO_DELETE'],
            },
        ],
    },
} as unknown as ModelSchemas

const baseMockedCurrentUser = {
    organisationUnits: [
        {
            id: 'ImspTQPwCqd',
            level: 1,
            path: '/ImspTQPwCqd',
        },
    ],
    name: 'John Traore',
    email: 'dummy@dhis2.org',
    settings: {
        keyMessageSmsNotification: false,
        keyCurrentStyle: 'light_blue/light_blue.css',
        keyStyle: 'light_blue/light_blue.css',
        keyUiLocale: 'en',
        keyAnalysisDisplayProperty: 'name',
        keyMessageEmailNotification: false,
    },
}

const setMockedKeyRequireAddToView = (value: boolean) => {
    const mockedSystemSettings = {
        keyRequireAddToView: value,
    } as SystemSettings
    useSystemSettingsStore.getState().setSystemSettings(mockedSystemSettings)
}

const setMockedAuthorities = (authorities: Set<string>) => {
    const mockedCurrentUser = {
        ...baseMockedCurrentUser,
        authorities,
    }
    useCurrentUserStore.getState().setCurrentUser(mockedCurrentUser)
}

describe('sectionAuthorities', () => {
    beforeAll(() => {
        useSchemaStore.getState().setSchemas(mockedSchemas)
    })
    beforeEach(() => {
        setMockedAuthorities(new Set(['F_DATAELEMENT_PUBLIC_ADD']))
        setMockedKeyRequireAddToView(true)
    })
    describe('useIsSectionAuthorizedPredicate', () => {
        it('should return a predicate function', () => {
            const { result } = renderHook(() =>
                useIsSectionAuthorizedPredicate()
            )
            expect(result.current).toBeInstanceOf(Function)
        })

        it('predicate function should return true when user has required authorites', async () => {
            const { result } = renderHook(() =>
                useIsSectionAuthorizedPredicate()
            )
            const isSectionAuthorized = result.current

            const isAllowed = isSectionAuthorized(SECTIONS_MAP.dataElement)
            expect(isAllowed).toBe(true)
        })
        it('predicate function should return false when user does not have required authorites', async () => {
            setMockedAuthorities(new Set(['F_DATAELEMENT_DELETE']))

            const { result } = renderHook(() =>
                useIsSectionAuthorizedPredicate()
            )
            const isSectionAuthorized = result.current

            const isAllowed = isSectionAuthorized(SECTIONS_MAP.dataElement)
            expect(isAllowed).toBe(false)
        })
        it('predicate function should return true if systemSetting keyRequireAddToView is false, even without required auth', async () => {
            setMockedKeyRequireAddToView(false)
            setMockedAuthorities(new Set())
            const { result } = renderHook(() =>
                useIsSectionAuthorizedPredicate()
            )
            const isSectionAuthorized = result.current

            const isAllowed = isSectionAuthorized(SECTIONS_MAP.dataElement)
            expect(isAllowed).toBe(true)
        })
        describe('overviewSection', () => {
            it('predicate function should return true when user has at least one authority for child section', async () => {
                const { result } = renderHook(() =>
                    useIsSectionAuthorizedPredicate()
                )
                const isSectionAuthorized = result.current

                const isAllowed = isSectionAuthorized(
                    OVERVIEW_SECTIONS.dataElement
                )
                expect(isAllowed).toBe(true)
            })
            it('predicate function should return true when user has required authorites for child section that is not the same as parentKeyName', async () => {
                setMockedAuthorities(
                    new Set(['F_DATAELEMENTGROUP_CREATE_PUBLIC'])
                )

                const { result } = renderHook(() =>
                    useIsSectionAuthorizedPredicate()
                )
                const isSectionAuthorized = result.current

                const isAllowed = isSectionAuthorized(
                    OVERVIEW_SECTIONS.dataElement
                )
                expect(isAllowed).toBe(false)
            })

            it('predicate function should return false when user does not have required authorites for any child section', async () => {
                setMockedAuthorities(new Set(['F_DATAELEMENT_DELETE']))

                const { result } = renderHook(() =>
                    useIsSectionAuthorizedPredicate()
                )
                const isSectionAuthorized = result.current

                const isAllowed = isSectionAuthorized(
                    OVERVIEW_SECTIONS.dataElement
                )
                expect(isAllowed).toBe(false)
            })

            it('predicate function should return true if systemSetting keyRequireAddToView is false, even without required auth', async () => {
                setMockedKeyRequireAddToView(false)
                setMockedAuthorities(new Set())
                const { result } = renderHook(() =>
                    useIsSectionAuthorizedPredicate()
                )
                const isSectionAuthorized = result.current

                const isAllowed = isSectionAuthorized(
                    OVERVIEW_SECTIONS.dataElement
                )
                expect(isAllowed).toBe(true)
            })
        })
    })
    describe('useCanCreateModelInSection', () => {
        it('should return true if user has required authorities', () => {
            const { result } = renderHook(() =>
                useCanCreateModelInSection(SECTIONS_MAP.dataElement)
            )
            const isSectionAuthorized = result.current

            expect(isSectionAuthorized).toBe(true)
        })
        it('should return false if user does not have required authorities', () => {
            const { result } = renderHook(() =>
                useCanCreateModelInSection(SECTIONS_MAP.category)
            )
            const isSectionAuthorized = result.current

            expect(isSectionAuthorized).toBe(false)
        })
        it('should return false if section is categoryOptionCombo, even with required auth', () => {
            setMockedAuthorities(
                new Set([
                    'F_CATEGORY_COMBO_PUBLIC_ADD',
                    'F_CATEGORY_COMB_PRIVATE_ADD',
                ])
            )
            const { result } = renderHook(() =>
                useCanCreateModelInSection(SECTIONS_MAP.categoryOptionCombo)
            )
            const isSectionAuthorized = result.current
            expect(isSectionAuthorized).toBe(false)
        })
        it('should return false if user does not have required authorities, even if keyRequiredAddToView is false', () => {
            const { result } = renderHook(() =>
                useCanCreateModelInSection(SECTIONS_MAP.category)
            )
            const isSectionAuthorized = result.current

            expect(isSectionAuthorized).toBe(false)
        })
    })
})
