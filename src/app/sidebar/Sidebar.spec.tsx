import { useConfig } from '@dhis2/app-runtime'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import {
    useIsSectionAuthorizedPredicate,
    useIsSectionFeatureToggle,
    useSystemSettingsStore,
    useCurrentUserAuthorities,
} from '../../lib'
import { Section } from '../../types'
import { Sidebar } from './Sidebar'

const mockedUseIsSectionAuthorizedPredicate = jest.mocked(
    useIsSectionAuthorizedPredicate
)

const mockedUseIsSectionFeatureToggle = jest.mocked(useIsSectionFeatureToggle)
const mockedUseSystemSettingsStore = jest.mocked(useSystemSettingsStore)
const mockedUseConfig = jest.mocked(useConfig)
const mockedUseCurrentUserAuthorities = jest.mocked(useCurrentUserAuthorities)

jest.mock('../../lib', () => {
    const originalModule = jest.requireActual('../../lib')
    return {
        ...originalModule,
        useIsSectionAuthorizedPredicate: jest.fn(),
        useIsSectionFeatureToggle: jest.fn(),
        useCanCreateModelInSection: jest.fn(() => true),
        useSystemSettingsStore: jest.fn(() => undefined),
        useCurrentUserAuthorities: jest.fn(),
    }
})

jest.mock('@dhis2/app-runtime', () => {
    const originalModule = jest.requireActual('@dhis2/app-runtime')
    return {
        ...originalModule,
        useConfig: jest.fn(),
    }
})

describe('Sidebar', () => {
    const renderSideBar = () =>
        render(<Sidebar />, {
            wrapper: BrowserRouter,
        })

    beforeEach(() => {
        // reset url to root
        window.history.pushState({}, '', '/')
        jest.resetAllMocks()
        mockedUseIsSectionAuthorizedPredicate.mockImplementation(
            () => () => true
        )
        mockedUseIsSectionFeatureToggle.mockImplementation(() => () => true)
        mockedUseConfig.mockImplementation(
            () =>
                ({
                    systemInfo: {
                        contextPath: 'www.test.com/path/somewhere',
                    },
                } as ReturnType<typeof useConfig>)
        )
        mockedUseCurrentUserAuthorities.mockReturnValue(new Set(['ALL']))
    })
    it('should display the list of top-level categories', () => {
        const { queryByText } = renderSideBar()

        const topLevelCategories = [
            'Metadata Overview',
            'Categories',
            'Data elements',
            'Data sets',
            'Indicators and Predictors',
            'Organisation units',
            'Programs',
            'Option sets',
            'Validations',
            'Data Approval',
            'Other',
            'Metadata Integrity Checks',
            'Import Metadata',
            'Export Metadata',
        ]

        topLevelCategories.forEach((title) =>
            expect(queryByText(title)).toBeDefined()
        )
    })
    it('should open external app link with legacy url if global shell is enabled', async () => {
        mockedUseSystemSettingsStore.mockReturnValueOnce(true)
        const { getByRole } = renderSideBar()
        const integrityButton = getByRole('link', {
            name: /Metadata Integrity Checks/i,
        })

        expect(integrityButton).toBeInTheDocument()
        expect(integrityButton).toHaveAttribute(
            'href',
            'www.test.com/path/somewhere/apps/data-administration#/data-integrity'
        )
    })
    it('should open external app link with apps url if global shell is NOT enabled', async () => {
        mockedUseSystemSettingsStore.mockReturnValueOnce(false)
        const { getByRole } = renderSideBar()

        const integrityButton = getByRole('link', {
            name: /Metadata Integrity Checks/i,
        })

        expect(integrityButton).toBeInTheDocument()
        expect(integrityButton).toHaveAttribute(
            'href',
            'www.test.com/path/somewhere/dhis-web-data-administration/index.html#/data-integrity'
        )
    })
    it('should display the list of links inside a category when clicked', async () => {
        const { queryByText, getByText } = renderSideBar()

        const subCategories = [
            'Overview',
            'Category options',
            'Category combinations',
            'Category option combinations',
        ]
        subCategories.forEach((title) => expect(queryByText(title)).toBeNull())

        await userEvent.click(getByText('Categories'))

        subCategories.forEach((title) =>
            expect(getByText(title)).not.toBeNull()
        )
    })
    describe('when a link is clicked', () => {
        it('should navigate to the target of the link', async () => {
            const { getByText } = renderSideBar()
            await userEvent.click(getByText('Categories'))
            await userEvent.click(getByText('Category combinations'))
            expect(window.location.href).toMatch('/categoryCombos')
            await userEvent.click(getByText('Overview'))
            expect(window.location.href).toMatch('/overview/categories')
        })
    })

    describe('searching', () => {
        it('should filter the list when a search string is entered', async () => {
            const user = userEvent.setup()
            const { getByPlaceholderText, getByText, queryByText, getByRole } =
                renderSideBar()

            expect(queryByText('Data element groups')).toBeNull()

            await user.type(getByPlaceholderText(/Search/), 'elements')

            expect(
                getByRole('link', { name: 'Data elements' })
            ).toBeInTheDocument()
            expect(getByText('Overview')).toBeDefined()
            expect(getByText('Data element groups')).toBeDefined()
            expect(getByText('Data element group sets')).toBeDefined()
        })
        it('should allow searching for a match in a subcategory', async () => {
            const user = userEvent.setup()
            const { getByPlaceholderText, getByText, queryByText } =
                renderSideBar()

            expect(queryByText('Data element groups')).toBeNull()

            await user.type(getByPlaceholderText(/Search/), 'group')

            expect(queryByText('Overview')).toBeNull()
            expect(getByText('Data element groups')).toBeDefined()
            expect(getByText('Data element group sets')).toBeDefined()
        })
        describe('when no match', () => {
            it('should display an appropriate message', async () => {
                const user = userEvent.setup()
                const { getByPlaceholderText, getByText, queryByText } =
                    renderSideBar()

                expect(queryByText('Data element groups')).toBeNull()

                await user.type(
                    getByPlaceholderText(/Search/),
                    'something not in list'
                )

                expect(getByText(/No menu items found for/)).toBeDefined()
            })
            it('should still display "MetaData Overview"', async () => {
                const user = userEvent.setup()
                const { getByPlaceholderText, getByText, queryByText } =
                    renderSideBar()

                expect(queryByText('Data element groups')).toBeNull()

                await user.type(
                    getByPlaceholderText(/Search/),
                    'something not in list'
                )

                expect(getByText('Metadata Overview')).toBeDefined()
            })
        })
    })

    it('should allow tabbing through the menu', async () => {
        const user = userEvent.setup()
        const { getByPlaceholderText, getByText } = renderSideBar()

        getByPlaceholderText(/Search/).focus()
        await user.tab()
        expect(getByText('Metadata Overview')).toHaveFocus()
        await user.tab()
        expect(getByText('Categories').parentElement).toHaveFocus()
    })

    describe('unauthorized sections', () => {
        it('should hide child links that link to unauthorized sections', async () => {
            const unauthorizedSections = [
                'Category option',
                'Category combination',
                'Category option combination',
            ]

            const checkSection = (section: Section) =>
                !unauthorizedSections.includes(section.title)
            mockedUseIsSectionAuthorizedPredicate.mockImplementation(
                () => checkSection
            )
            const { queryByText, getByText } = renderSideBar()
            const expectedSubCategories = [
                'Overview',
                'Category option groups',
                'Category option group sets',
            ]
            expectedSubCategories.forEach((title) =>
                expect(queryByText(title)).toBeNull()
            )
            await userEvent.click(getByText('Categories'))
            expectedSubCategories.forEach((title) =>
                expect(getByText(title)).not.toBeNull()
            )
            expect(queryByText('Category options')).toBeNull()
            expect(queryByText('Category combinations')).toBeNull()
            expect(queryByText('Category option combinations')).toBeNull()
        })

        it('should hide parent if all children are unauthorized', () => {
            const checkSection = (section: Section) =>
                !section.title.toLowerCase().includes('category')
            mockedUseIsSectionAuthorizedPredicate.mockImplementation(
                () => checkSection
            )
            const { queryByText } = renderSideBar()
            expect(queryByText('Categories')).toBeNull()
        })
    })

    describe('version incompatible sections', () => {
        it('should hide child links that link to non feature toggled sections', async () => {
            const unauthorizedSections = [
                'Category option',
                'Category combination',
                'Category option combination',
            ]
            const checkSection = (section: Section) =>
                !unauthorizedSections.includes(section.title)
            mockedUseIsSectionFeatureToggle.mockImplementation(
                () => checkSection
            )

            const { queryByText, getByText } = renderSideBar()
            const expectedSubCategories = [
                'Overview',
                'Category option groups',
                'Category option group sets',
            ]
            expectedSubCategories.forEach((title) =>
                expect(queryByText(title)).toBeNull()
            )
            await userEvent.click(getByText('Categories'))
            expectedSubCategories.forEach((title) =>
                expect(getByText(title)).not.toBeNull()
            )
            expect(queryByText('Category options')).toBeNull()
            expect(queryByText('Category combinations')).toBeNull()
            expect(queryByText('Category option combinations')).toBeNull()
        })

        it('should hide parent if all children are unauthorized', () => {
            const checkSection = (section: Section) =>
                !section.title.toLowerCase().includes('category')
            mockedUseIsSectionFeatureToggle.mockImplementation(
                () => checkSection
            )

            const { queryByText } = renderSideBar()
            expect(queryByText('Categories')).toBeNull()
        })
    })
})
