import { FetchError } from '@dhis2/app-runtime'
import { faker } from '@faker-js/faker'
import { render, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/icons.json'
import { SECTIONS_MAP } from '../../lib'
import type { CurrentUser } from '../../lib/useLoadApp'
import { useCurrentUserStore } from '../../lib/user/currentUserStore'
import { testOrgUnit } from '../../testUtils/builders'
import {
    defaultUserDataStoreData,
    error404,
    generateRenderer,
} from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import type { OrganisationUnit } from '../../types/generated'
import { IconModel, Component } from './List'

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: (value: string) => void) => fn,
}))

const section = SECTIONS_MAP.icon

const testIcon = (overwrites: Partial<IconModel> = {}): IconModel => ({
    key: faker.string.alpha({ length: 8 }),
    description: faker.lorem.sentence(),
    href: faker.internet.url(),
    custom: true,
    keywords: ['health', 'water'],
    lastUpdated: faker.date.past().toISOString(),
    created: faker.date.past().toISOString(),
    createdBy: { displayName: faker.person.fullName(), id: 'user-1' },
    ...overwrites,
})

const buildPager = (total: number, page = 1, pageSize = 50) => ({
    page,
    total,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
})

jest.spyOn(console, 'warn').mockImplementation((value) => {
    if (typeof value === 'string' && !/No server timezone/.exec(value)) {
        console.info(value)
    }
})

describe('Icons list', () => {
    const getIconsMock = jest.fn()
    const deleteMock = jest.fn()

    const renderList = generateRenderer(
        { section, mockSchema: schemaMock },
        (
            routeOptions,
            {
                elements = [testIcon(), testIcon(), testIcon()],
                customTestData = {},
            }: {
                elements?: IconModel[]
                customTestData?: Record<string, unknown>
            } = {}
        ) => {
            useCurrentUserStore.getState().setCurrentUser({
                organisationUnits: [testOrgUnit()] as OrganisationUnit[],
                authorities: new Set<string>(),
                name: faker.person.fullName(),
                email: faker.internet.email(),
                settings: {},
            } as unknown as CurrentUser)

            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        icons: (
                            type: string,
                            params: Record<string, unknown>
                        ) => {
                            if (type === 'read') {
                                getIconsMock(params)
                                return {
                                    icons: elements,
                                    pager: buildPager(elements.length),
                                }
                            }
                            if (type === 'delete') {
                                deleteMock(params)
                                return { statusCode: 204 }
                            }
                        },
                        userDataStore: defaultUserDataStoreData,
                        ...customTestData,
                    }}
                    routeOptions={routeOptions}
                >
                    <Component />
                </TestComponentWithRouter>
            )
            return { screen, elements }
        }
    )

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display all icons', async () => {
        const { screen, elements } = await renderList()
        const tableRows = await screen.findAllByTestId('section-list-row')
        expect(tableRows).toHaveLength(elements.length)
        elements.forEach((icon: IconModel, index: number) => {
            expect(tableRows[index]).toHaveTextContent(icon.key)
        })
    })

    it('should request only custom icons by default', async () => {
        await renderList()
        await waitFor(() => expect(getIconsMock).toHaveBeenCalled())
        expect(getIconsMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                params: expect.objectContaining({ type: 'CUSTOM' }),
            })
        )
    })

    it('should display an error notice when fetching fails', async () => {
        const customTestData = {
            icons: (type: string) => {
                if (type === 'read') {
                    return Promise.reject(new FetchError(error404))
                }
            },
        }

        const { screen } = await renderList({ customTestData })
        const tableRows = within(
            screen.getByTestId('dhis2-uicore-tablebody')
        ).getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows).toHaveLength(1)
        const noticeBox = within(tableRows[0]).getByTestId(
            'dhis2-uicore-noticebox'
        )
        expect(noticeBox).toBeVisible()
        expect(noticeBox).toHaveTextContent(
            'An error occurred while loading the items.'
        )
    })

    it('should show empty-state message when no icons are returned', async () => {
        const { screen } = await renderList({ elements: [] })
        const tableRows = within(
            screen.getByTestId('dhis2-uicore-tablebody')
        ).getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows).toHaveLength(1)
        expect(tableRows[0]).toHaveTextContent(
            "There aren't any items that match your filter."
        )
    })

    it('should pass the search term as a query param when typing in the search input', async () => {
        const { screen } = await renderList()
        await waitFor(() => expect(getIconsMock).toHaveBeenCalled())
        const searchInputWrapper = screen.getByTestId('input-search-name')
        const searchInput = within(searchInputWrapper).getByRole('textbox')
        await userEvent.type(searchInput, 'health')

        await waitFor(() => {
            expect(getIconsMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({ search: 'health' }),
                })
            )
        })
    })

    it('should clear the search input when the clear filter button is clicked', async () => {
        const { screen } = await renderList()
        const searchInputWrapper = screen.getByTestId('input-search-name')
        const searchInput = within(searchInputWrapper).getByRole(
            'textbox'
        ) as HTMLInputElement
        await userEvent.type(searchInput, 'lalala')
        expect(searchInput).toHaveValue('lalala')

        await userEvent.click(screen.getByTestId('clear-all-filters-button'))
        await waitFor(() => {
            expect(searchInput).toHaveValue('')
        })
    })

    it('should open the details panel when "Show details" is clicked', async () => {
        const { screen, elements } = await renderList()
        const tableRows = await screen.findAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        await userEvent.click(within(actionsMenu).getByText('Show details'))

        const detailsPanel = await screen.findByTestId('details-panel')
        expect(detailsPanel).toBeVisible()
        expect(detailsPanel).toHaveTextContent(elements[0].key)
    })

    it('should show Show details, Edit and Delete in the row actions menu', async () => {
        const { screen } = await renderList()
        const tableRows = await screen.findAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        expect(actionsMenu).toHaveTextContent('Show details')
        expect(actionsMenu).toHaveTextContent('Edit')
        expect(actionsMenu).toHaveTextContent('Delete')
    })

    it('should delete an icon when confirming the delete action', async () => {
        const { screen, elements } = await renderList()
        const tableRows = await screen.findAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        const confirmationModal = await uiActions.openModal(
            within(actionsMenu).getByText('Delete'),
            'delete-confirmation-modal',
            screen
        )
        await userEvent.click(
            within(confirmationModal).getByRole('button', {
                name: 'Confirm deletion',
            })
        )

        await waitFor(() => {
            expect(deleteMock).toHaveBeenCalledWith(
                expect.objectContaining({ id: elements[0].key })
            )
        })
    })
})
