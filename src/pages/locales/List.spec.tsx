import { FetchError } from '@dhis2/app-runtime'
import { faker } from '@faker-js/faker'
import { render, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/categoriesSchema.json'
import {
    defaultModelViewConfig,
    modelListViewsConfig,
    ModelPropertyConfig,
    SECTIONS_MAP,
    toModelPropertyDescriptor,
} from '../../lib'
import { useCurrentUserStore } from '../../lib/user/currentUserStore'
import { testLocales, testOrgUnit } from '../../testUtils/builders'
import {
    defaultUserDataStoreData,
    error404,
    generateRenderer,
} from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import type { OrganisationUnit } from '../../types/generated'
import { Component } from './List'

const section = SECTIONS_MAP.locale
const ComponentToTest = Component

jest.spyOn(console, 'warn').mockImplementation((value) => {
    if (!value.match(/No server timezone/)) {
        console.warn(value)
    }
})

describe('Locales list tests', () => {
    const getElementsMock = jest.fn()
    const deleteMock = jest.fn()
    const renderList = generateRenderer(
        { section, mockSchema: schemaMock },
        (routeOptions, { customTestData = {} } = {}) => {
            const elements = [
                testLocales(),
                testLocales(),
                testLocales(),
                testLocales(),
                testLocales(),
                testLocales(),
            ]
            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.routeName}`}
                    customData={{
                        [section.namePlural]: (type: any, params: any) => {
                            if (type === 'read') {
                                getElementsMock(params)
                                return elements
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
                    <ComponentToTest />
                </TestComponentWithRouter>
            )
            return { screen, elements }
        }
    )

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display all the item', async () => {
        const { screen, elements } = await renderList()
        const tableRows = screen.getAllByTestId('section-list-row')
        expect(tableRows.length).toBe(elements.length)
        elements.forEach((element: Record<any, any>, index: number) => {
            expect(tableRows[index]).toHaveTextContent(element.displayName)
        })
    })

    it('should display the default columns', async () => {
        const { screen } = await renderList()
        const tableHeaders = screen.getAllByTestId(
            'dhis2-uicore-datatablecellhead'
        )
        const sectionName = section.name as keyof typeof modelListViewsConfig
        const configs = modelListViewsConfig[sectionName] as Record<string, any>
        const columnsToRender =
            configs?.columns?.default ?? defaultModelViewConfig.columns.default
        expect(tableHeaders).toHaveLength(columnsToRender.length + 2)
        columnsToRender.forEach(
            (column: ModelPropertyConfig, index: number) => {
                expect(tableHeaders[index + 1]).toHaveTextContent(
                    toModelPropertyDescriptor(column).label
                )
            }
        )
    })

    it('should display error when an API call fails', async () => {
        const customTestData = {
            [section.namePlural]: (type: any) => {
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

    it('should show message when no items found', async () => {
        const customTestData = {
            [section.namePlural]: (type: any) => {
                if (type === 'read') {
                    return []
                }
            },
        }

        const { screen } = await renderList({ customTestData })
        const tableRows = within(
            screen.getByTestId('dhis2-uicore-tablebody')
        ).getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows).toHaveLength(1)
        expect(tableRows[0]).toHaveTextContent(
            "There aren't any items that match your filter."
        )
    })

    it('should display delete and show details actions in action menu', async () => {
        const { screen } = await renderList()
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[1],
            screen
        )
        expect(actionsMenu).toHaveTextContent('Show details')
        expect(actionsMenu).toHaveTextContent('Delete')
    })

    it('can not delete an item when has no permisison', async () => {
        const { screen } = await renderList()
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        const deleteActionLink = within(actionMenu).getByTestId('delete-action')
        expect(deleteActionLink).toHaveClass('disabled')
    })

    it('deletes an item when pressing the delete action and updates the list', async () => {
        const { screen, elements } = await renderList()
        useCurrentUserStore.getState().setCurrentUser({
            organisationUnits: [testOrgUnit()] as OrganisationUnit[],
            authorities: new Set<string>().add('F_LOCALE_DELETE'),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            settings: {},
        })
        const tableRows = screen.getAllByTestId('section-list-row')
        const firstElementToDeleteId = elements[0].id
        const deletableElementActionMenu =
            await uiActions.openListElementActionsMenu(tableRows[0], screen)
        const deleteConfirmationModal = await uiActions.openModal(
            within(deletableElementActionMenu).getByText('Delete'),
            'delete-confirmation-modal',
            screen
        )
        await userEvent.click(
            within(deleteConfirmationModal).getByRole('button', {
                name: 'Confirm deletion',
            })
        )
        await waitFor(() => {
            expect(deleteMock).toHaveBeenCalledWith(
                expect.objectContaining({ id: firstElementToDeleteId })
            )
        })
    })

    it('shows the detail panel when the show details action is clicked', async () => {
        const { screen, elements } = await renderList()
        const tableRows = screen.getAllByTestId('section-list-row')

        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        await userEvent.click(within(actionsMenu).getByText('Show details'))
        const detailsPanel = await screen.findByTestId('details-panel')
        expect(detailsPanel).toBeVisible()
        expect(detailsPanel).toHaveTextContent(elements[0].displayName)
    })

    it.skip('can filter the results by identifiable using the input field', async () => {
        const { screen, elements } = await renderList()
        const filterText = elements[1].displayName.substring(0, 3)
        const identifiableFilterInput = within(
            screen.getByTestId('input-search-name')
        ).getByRole('textbox')
        await userEvent.type(identifiableFilterInput, filterText)
        const tableRowsUpdated = screen.getAllByTestId('section-list-row')
        expect(tableRowsUpdated).toHaveLength(1)
    })

    it('can clear identifiable filter with clear all filters button', async () => {
        const { screen, elements } = await renderList()
        const identifiableFilterInput = within(
            screen.getByTestId('input-search-name')
        ).getByRole('textbox')
        await userEvent.type(identifiableFilterInput, 'lalala')
        const tableRowsUpdated = screen.queryAllByTestId('section-list-row')
        expect(tableRowsUpdated).toHaveLength(0)

        const clearFiltersButton = screen.getByTestId(
            'clear-all-filters-button'
        )
        await userEvent.click(clearFiltersButton)
        await waitFor(() => {
            expect(identifiableFilterInput).toHaveValue('')
        })
        const tableRowsUpdated2 = screen.getAllByTestId('section-list-row')
        expect(tableRowsUpdated2).toHaveLength(elements.length)
    })
})
