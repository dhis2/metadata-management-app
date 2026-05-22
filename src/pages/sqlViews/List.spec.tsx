import { render, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import sqlViewSchemaMock from '../../__mocks__/schema/sqlView.json'
import { SECTIONS_MAP } from '../../lib'
import { testAccess, testLocale, testSqlViews } from '../../testUtils/builders'
import {
    defaultUserDataStoreData,
    generateRenderer,
} from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { SqlView } from '../../types/generated'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.sqlView
const mockSchema = sqlViewSchemaMock
const ComponentToTest = Component
const generateRandomElement = testSqlViews
const customData = {}

jest.mock('focus-trap-react', () => ({
    FocusTrap: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

describe('SQL views specific action tests', () => {
    const renderList = generateRenderer(
        { section, mockSchema },
        (
            routeOptions,
            {
                elements = [testSqlViews(), testSqlViews()],
                additionalCustomData = {},
            } = {}
        ) => {
            const pager = {
                page: 1,
                total: elements.length,
                pageSize: 20,
                pageCount: Math.ceil(elements.length / 20),
            }
            const locales = [testLocale(), testLocale()]

            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        [section.namePlural]: (type: any, params: any) => {
                            if (type === 'read' && params.id !== undefined) {
                                if (params.id.match(/translations/)) {
                                    return { translations: [] }
                                }
                                return elements.find(
                                    (el: Record<any, any>) =>
                                        el.id === params.id
                                )
                            }
                            if (type === 'read') {
                                return {
                                    [section.namePlural]: elements,
                                    pager,
                                }
                            }
                            if (type === 'delete') {
                                return { statusCode: 204 }
                            }
                        },
                        userDataStore: defaultUserDataStoreData,
                        ...additionalCustomData,
                    }}
                    routeOptions={routeOptions}
                >
                    <ComponentToTest />
                </TestComponentWithRouter>
            )
            return { screen, elements, pager, locales }
        }
    )

    it('should show SQL view-specific actions in the row actions menu', async () => {
        const { screen } = await renderList()
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        expect(actionsMenu).toHaveTextContent('View results')
        expect(actionsMenu).toHaveTextContent('Edit')
        expect(actionsMenu).toHaveTextContent('Show details')
        expect(actionsMenu).toHaveTextContent('Sharing settings')
        expect(actionsMenu).toHaveTextContent('Delete')
    })

    it('should show "Run query" label for QUERY type SQL views', async () => {
        const queryElement = testSqlViews({ type: SqlView.type.QUERY })
        const { screen } = await renderList({
            elements: [queryElement],
        })
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        expect(actionsMenu).toHaveTextContent('Run query')
        expect(actionsMenu).not.toHaveTextContent('Create or update view')
    })

    it('should show "Create or update view" label for VIEW type SQL views', async () => {
        const viewElement = testSqlViews({ type: SqlView.type.VIEW })
        const { screen } = await renderList({
            elements: [viewElement],
        })
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        expect(actionsMenu).toHaveTextContent('Create or update view')
        expect(actionsMenu).not.toHaveTextContent('Run query')
    })

    it('should show "Create or update view" label for MATERIALIZED_VIEW type SQL views', async () => {
        const materializedElement = testSqlViews({
            type: SqlView.type.MATERIALIZED_VIEW,
        })
        const { screen } = await renderList({
            elements: [materializedElement],
        })
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        expect(actionsMenu).toHaveTextContent('Create or update view')
        expect(actionsMenu).not.toHaveTextContent('Run query')
    })

    it('should open the results drawer when "View results" is clicked', async () => {
        const { screen } = await renderList()
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        await userEvent.click(within(actionsMenu).getByText('View results'))
        screen.debug(undefined, 10000)
        await waitFor(() => {
            expect(screen.getByTestId('sql-view-results')).toBeVisible()
        })
    })

    it('should open the results drawer when running a QUERY type SQL view', async () => {
        const queryElement = testSqlViews({
            type: SqlView.type.QUERY,
            access: testAccess({ write: true }),
        })
        const { screen } = await renderList({
            elements: [queryElement],
        })
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        await userEvent.click(within(actionsMenu).getByText('Run query'))
        await waitFor(() => {
            expect(screen.getByTestId('sql-view-results')).toBeVisible()
        })
    })

    it('should call the execute API when running a VIEW type SQL view', async () => {
        const executeMock = jest.fn()
        const viewElement = testSqlViews({
            type: SqlView.type.VIEW,
            access: testAccess({ write: true }),
        })
        const { screen } = await renderList({
            elements: [viewElement],
            additionalCustomData: {
                [`sqlViews/${viewElement.id}/execute`]: (type: string) => {
                    if (type === 'create') {
                        executeMock(viewElement.id)
                        return {}
                    }
                },
            },
        })
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        await userEvent.click(
            within(actionsMenu).getByText('Create or update view')
        )
        await waitFor(() => {
            expect(executeMock).toHaveBeenCalledWith(viewElement.id)
        })
    })

    it('should call the refresh API when running a MATERIALIZED_VIEW type SQL view', async () => {
        const refreshMock = jest.fn()
        const materializedElement = testSqlViews({
            type: SqlView.type.MATERIALIZED_VIEW,
            access: testAccess({ write: true }),
        })
        const { screen } = await renderList({
            elements: [materializedElement],
            additionalCustomData: {
                [`sqlViews/${materializedElement.id}/refresh`]: (
                    type: string
                ) => {
                    if (type === 'create') {
                        refreshMock(materializedElement.id)
                        return {}
                    }
                },
            },
        })
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        await userEvent.click(
            within(actionsMenu).getByText('Create or update view')
        )
        await waitFor(() => {
            expect(refreshMock).toHaveBeenCalledWith(materializedElement.id)
        })
    })
})
