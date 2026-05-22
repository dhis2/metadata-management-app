import { render, RenderResult, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import sqlViewSchemaMock from '../../__mocks__/schema/sqlView.json'
import { SECTIONS_MAP } from '../../lib'
import { testSqlViews } from '../../testUtils/builders'
import {
    defaultUserDataStoreData,
    error404,
    generateRenderer,
} from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { SqlView } from '../../types/generated'
import { SqlViewResults } from './Results'

const section = SECTIONS_MAP.sqlView

jest.mock('focus-trap-react', () => ({
    FocusTrap: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const DEFAULT_ID = 'test-view-id'

export const openDownloadMenu = async (screen: RenderResult) => {
    await uiActions.clickButton('results-download-button', screen)
}

export const enterVariableValue = async (
    varName: string,
    value: string,
    screen: RenderResult
) => {
    const field = screen.getByTestId(`variable-input-${varName}`)
    const input = within(field).getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, value)
}

const mockMeta = (overwrites: Record<string, unknown> = {}) =>
    testSqlViews({
        id: DEFAULT_ID,
        displayName: 'My Test SQL View',
        type: SqlView.type.VIEW,
        sqlQuery: 'SELECT * FROM dataelement',
        ...overwrites,
    })

const mockGrid = (overwrites: Record<string, unknown> = {}) => ({
    listGrid: {
        headers: [{ column: 'name' }, { column: 'uid' }],
        rows: [
            ['Element A', 'abc123'],
            ['Element B', 'def456'],
        ],
        ...overwrites,
    },
})

const renderResults = generateRenderer(
    { section, mockSchema: sqlViewSchemaMock },
    (
        routeOptions,
        {
            meta = mockMeta(),
            grid = mockGrid(),
            additionalCustomData = {},
        }: {
            meta?: Record<string, unknown>
            grid?: Record<string, unknown>
            additionalCustomData?: Record<string, unknown>
        } = {}
    ) => {
        const screen = render(
            <TestComponentWithRouter
                path="/results"
                customData={{
                    sqlViews: (_type: string, params: { id: string }) =>
                        params?.id
                            ? meta
                            : {
                                  sqlViews: [meta],
                                  pager: {
                                      page: 1,
                                      total: 1,
                                      pageSize: 20,
                                      pageCount: 1,
                                  },
                              },
                    [`sqlViews/${DEFAULT_ID}/data`]: () => grid,
                    userDataStore: defaultUserDataStoreData,
                    ...additionalCustomData,
                }}
                routeOptions={routeOptions}
            >
                <SqlViewResults id={DEFAULT_ID} />
            </TestComponentWithRouter>
        )
        return { screen }
    }
)

describe('SqlViewResults', () => {
    describe('loading and error states', () => {
        it('shows an error notice when metadata fails to load', async () => {
            const { screen } = await renderResults({
                additionalCustomData: {
                    sqlViews: () => Promise.reject(error404),
                },
            })
            expect(screen.getByText('Could not load SQL view')).toBeVisible()
        })
    })

    describe('header', () => {
        it('shows the SQL view display name', async () => {
            const { screen } = await renderResults()
            expect(screen.getByText('My Test SQL View')).toBeVisible()
        })

        it('shows "Create or update view" run button for VIEW type', async () => {
            const { screen } = await renderResults()
            expect(screen.getByTestId('results-run-button')).toHaveTextContent(
                'Create or update view'
            )
        })

        it('shows "Create or update view" run button for MATERIALIZED_VIEW type', async () => {
            const { screen } = await renderResults({
                meta: mockMeta({ type: SqlView.type.MATERIALIZED_VIEW }),
            })
            expect(screen.getByTestId('results-run-button')).toHaveTextContent(
                'Create or update view'
            )
        })

        it('shows "Run query" run button for QUERY type', async () => {
            const { screen } = await renderResults({
                meta: mockMeta({ type: SqlView.type.QUERY }),
            })
            expect(screen.getByTestId('results-run-button')).toHaveTextContent(
                'Run query'
            )
        })
    })

    describe('data table', () => {
        it('renders table headers and rows from the API response', async () => {
            const { screen } = await renderResults()
            expect(screen.getByText('name')).toBeVisible()
            expect(screen.getByText('uid')).toBeVisible()
            expect(screen.getByText('Element A')).toBeVisible()
            expect(screen.getByText('abc123')).toBeVisible()
        })

        it('shows a notice when the query returns no rows', async () => {
            const { screen } = await renderResults({
                grid: mockGrid({ rows: [] }),
            })
            expect(screen.getByText('No rows returned')).toBeVisible()
        })
    })

    describe('data error states', () => {
        it('shows "No results available yet" for a VIEW that has not been executed', async () => {
            const { screen } = await renderResults({
                additionalCustomData: {
                    [`sqlViews/${DEFAULT_ID}/data`]: () =>
                        Promise.reject(
                            new Error('relation "my_view" does not exist')
                        ),
                },
            })
            expect(screen.getByText('No results available yet')).toBeVisible()
        })

        it('shows "Could not load results" for a general data error', async () => {
            const { screen } = await renderResults({
                additionalCustomData: {
                    [`sqlViews/${DEFAULT_ID}/data`]: () =>
                        Promise.reject(
                            new Error('Access denied: restricted table')
                        ),
                },
            })
            expect(screen.getByText('Could not load results')).toBeVisible()
        })
    })

    describe('download', () => {
        it('download button is disabled when there are no result rows', async () => {
            const { screen } = await renderResults({
                grid: mockGrid({ rows: [] }),
            })
            expect(screen.getByTestId('results-download-button')).toBeDisabled()
        })

        it('shows all format options when the download button is clicked', async () => {
            const { screen } = await renderResults()
            await openDownloadMenu(screen)
            for (const label of [
                'Excel (.xlsx)',
                'CSV (.csv)',
                'PDF (.pdf)',
                'HTML (.html)',
                'XML (.xml)',
                'JSON (.json)',
            ]) {
                expect(screen.getByText(label)).toBeVisible()
            }
        })

        it('generates correct download hrefs', async () => {
            const { screen } = await renderResults()
            await openDownloadMenu(screen)
            expect(
                screen.getByRole('menuitem', { name: 'CSV (.csv)' })
            ).toHaveAttribute(
                'href',
                `http://dhis2-imaginary-test-server/api/sqlViews/${DEFAULT_ID}/data.csv`
            )
        })
    })

    describe('run actions', () => {
        it('calls the execute API when running a VIEW type', async () => {
            const executeMock = jest.fn()
            const { screen } = await renderResults({
                additionalCustomData: {
                    [`sqlViews/${DEFAULT_ID}/execute`]: (type: string) => {
                        if (type === 'create') {
                            executeMock()
                            return {}
                        }
                    },
                },
            })
            await uiActions.clickButton('results-run-button', screen)
            await waitFor(() => {
                expect(executeMock).toHaveBeenCalledTimes(1)
            })
        })

        it('calls the refresh API when running a MATERIALIZED_VIEW type', async () => {
            const refreshMock = jest.fn()
            const { screen } = await renderResults({
                meta: mockMeta({ type: SqlView.type.MATERIALIZED_VIEW }),
                additionalCustomData: {
                    [`sqlViews/${DEFAULT_ID}/refresh`]: (type: string) => {
                        if (type === 'create') {
                            refreshMock()
                            return {}
                        }
                    },
                },
            })
            await uiActions.clickButton('results-run-button', screen)
            await waitFor(() => {
                expect(refreshMock).toHaveBeenCalledTimes(1)
            })
        })
    })

    describe('variable prompt (QUERY type)', () => {
        const metaWithVars = () =>
            mockMeta({
                type: SqlView.type.QUERY,
                sqlQuery: 'SELECT * FROM dataelement WHERE id = ${myVar}',
            })

        it('shows "Variables required" when variables are not yet provided', async () => {
            const { screen } = await renderResults({ meta: metaWithVars() })
            expect(screen.getByText('Variables required')).toBeVisible()
        })

        it('opens the variable modal when "Provide variables and run" is clicked', async () => {
            const { screen } = await renderResults({ meta: metaWithVars() })
            await userEvent.click(screen.getByText('Provide variables and run'))
            await waitFor(() => {
                expect(screen.getByText('Query variables')).toBeVisible()
                expect(screen.getByTestId('variable-input-myVar')).toBeVisible()
            })
        })

        it('runs the query after variable values are submitted', async () => {
            const { screen } = await renderResults({ meta: metaWithVars() })
            await userEvent.click(screen.getByText('Provide variables and run'))
            await enterVariableValue('myVar', 'test-value', screen)
            await uiActions.clickButton('variable-prompt-submit', screen)
            await waitFor(() => {
                expect(screen.getByText('Element A')).toBeVisible()
            })
        })
    })
})
