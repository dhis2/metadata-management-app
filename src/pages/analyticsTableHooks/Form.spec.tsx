import { faker } from '@faker-js/faker'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/analyticsTableHooksSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    testAnalyticsTableHookForm,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.analyticsTableHook
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Analytics table hooks form tests', () => {
    const createMock = jest.fn()
    const updateMock = jest.fn()

    beforeEach(() => {
        resetAllMocks()
        const portalRoot = document.createElement('div')
        portalRoot.setAttribute('id', FOOTER_ID)
        document.body.appendChild(portalRoot)
    })

    afterEach(() => {
        const portalRoot = document.getElementById(FOOTER_ID)
        if (portalRoot) {
            portalRoot.remove()
        }
    })

    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                {
                    matchingExistingElementFilter = undefined,
                    matchingHookOverrides = {},
                }: {
                    matchingExistingElementFilter?: string
                    matchingHookOverrides?: Record<string, unknown>
                } = {}
            ) => {
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            analyticsTableHooks: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (
                                        params?.params?.filter?.includes(
                                            matchingExistingElementFilter
                                        )
                                    ) {
                                        return {
                                            pager: { total: 1 },
                                            analyticsTableHooks: [
                                                testAnalyticsTableHookForm(
                                                    matchingHookOverrides
                                                ),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        analyticsTableHooks: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen }
            }
        )

        it('should render all fields', async () => {
            const { screen } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            expect(screen.getByTestId('formfields-phase')).toBeVisible()
            uiAssertions.expectTextAreaFieldToExist('sql', null, screen)
        })

        it('should have a cancel button linking back to the list view', async () => {
            const { screen } = await renderForm()
            const cancelButton = screen.getByTestId('form-cancel-link')
            expect(cancelButton).toBeVisible()
            expect(cancelButton).toHaveAttribute(
                'href',
                `/${section.namePlural}`
            )
        })

        it('should not submit when required fields are missing', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            await waitFor(() =>
                uiAssertions.expectFieldToHaveError(
                    'formfields-name',
                    'Required',
                    screen
                )
            )
            expect(createMock).not.toHaveBeenCalled()
        })

        it('should show an error if name is a duplicate', async () => {
            const existingName = faker.company.name()
            const { screen } = await renderForm({
                matchingExistingElementFilter: `name:ieq:${existingName}`,
            })
            await uiAssertions.expectNameToErrorWhenDuplicate(
                existingName,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })

        it('should show resourceTableType field only when phase is Resource tables', async () => {
            const { screen } = await renderForm()
            expect(
                screen.queryByTestId('formfields-resourceTableType')
            ).not.toBeInTheDocument()
            await uiActions.pickRadioField('phase', 'Resource tables', screen)
            expect(
                screen.getByTestId('formfields-resourceTableType')
            ).toBeVisible()
        })

        it('should show analyticsTableType field only when phase is Analytics tables', async () => {
            const { screen } = await renderForm()
            expect(
                screen.queryByTestId('formfields-analyticsTableType')
            ).not.toBeInTheDocument()
            await uiActions.pickRadioField('phase', 'Analytics tables', screen)
            expect(
                screen.getByTestId('formfields-analyticsTableType')
            ).toBeVisible()
        })

        it('should require resourceTableType when phase is Resource tables', async () => {
            const { screen } = await renderForm()
            const aName = faker.person.firstName()
            await uiActions.enterName(aName, screen)
            await uiActions.pickRadioField('phase', 'Resource tables', screen)
            await uiActions.enterInputFieldValue('sql', 'SELECT 1', screen)
            await uiActions.submitForm(screen)
            await waitFor(() =>
                uiAssertions.expectFieldToHaveError(
                    'formfields-resourceTableType',
                    'Required',
                    screen
                )
            )
            expect(createMock).not.toHaveBeenCalled()
        })

        it('should require analyticsTableType when phase is Analytics tables', async () => {
            const { screen } = await renderForm()
            const aName = faker.person.firstName()
            await uiActions.enterName(aName, screen)
            await uiActions.pickRadioField('phase', 'Analytics tables', screen)
            await uiActions.enterInputFieldValue('sql', 'SELECT 1', screen)
            await uiActions.submitForm(screen)
            await waitFor(() =>
                uiAssertions.expectFieldToHaveError(
                    'formfields-analyticsTableType',
                    'Required',
                    screen
                )
            )
            expect(createMock).not.toHaveBeenCalled()
        })

        it('should submit with Resource tables phase', async () => {
            const { screen } = await renderForm()
            const aName = faker.person.firstName()
            await uiActions.enterName(aName, screen)
            await uiActions.pickRadioField('phase', 'Resource tables', screen)
            const resourceTableField = screen.getByTestId(
                'formfields-resourceTableType'
            )
            await uiActions.pickOptionFromSelect(resourceTableField, 0, screen)
            await uiActions.enterInputFieldValue('sql', 'SELECT 1', screen)
            await uiActions.submitForm(screen)
            await waitFor(() =>
                expect(createMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            name: aName,
                            phase: 'RESOURCE_TABLE_POPULATED',
                            sql: 'SELECT 1',
                        }),
                    })
                )
            )
        })

        it('should submit with Analytics tables phase', async () => {
            const { screen } = await renderForm()
            const aName = faker.person.firstName()
            await uiActions.enterName(aName, screen)
            await uiActions.pickRadioField('phase', 'Analytics tables', screen)
            const analyticsTableField = screen.getByTestId(
                'formfields-analyticsTableType'
            )
            await uiActions.pickOptionFromSelect(analyticsTableField, 0, screen)
            await uiActions.enterInputFieldValue('sql', 'SELECT 1', screen)
            await uiActions.submitForm(screen)
            await waitFor(() =>
                expect(createMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            name: aName,
                            phase: 'ANALYTICS_TABLE_POPULATED',
                            sql: 'SELECT 1',
                        }),
                    })
                )
            )
        })

        it('should show an error if phase, target table, and SQL match an existing hook', async () => {
            const sql = 'SELECT 1'
            const { screen } = await renderForm({
                matchingExistingElementFilter: `phase:eq:RESOURCE_TABLE_POPULATED`,
                matchingHookOverrides: { sql },
            })
            await uiActions.enterName(faker.person.firstName(), screen)
            await uiActions.pickRadioField('phase', 'Resource tables', screen)
            const resourceTableField = screen.getByTestId(
                'formfields-resourceTableType'
            )
            await uiActions.pickOptionFromSelect(resourceTableField, 0, screen)
            await uiActions.enterInputFieldValue('sql', sql, screen)
            await uiActions.submitForm(screen)

            await waitFor(() =>
                uiAssertions.expectFieldToHaveError(
                    'formfields-sql',
                    'An analytics table hook with this table and SQL already exists.',
                    screen
                )
            )
            expect(createMock).not.toHaveBeenCalled()
        })

        it('should clear resourceTableType when switching phase to Analytics tables', async () => {
            const { screen } = await renderForm()
            await uiActions.pickRadioField('phase', 'Resource tables', screen)
            const resourceTableField = screen.getByTestId(
                'formfields-resourceTableType'
            )
            await uiActions.pickOptionFromSelect(resourceTableField, 0, screen)
            await uiActions.pickRadioField('phase', 'Analytics tables', screen)
            expect(
                screen.queryByTestId('formfields-resourceTableType')
            ).not.toBeInTheDocument()
        })
    })

    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                {
                    id = randomDhis2Id(),
                    matchingExistingElementFilter = undefined,
                } = {}
            ) => {
                const analyticsTableHook = testAnalyticsTableHookForm({
                    id,
                    phase: 'RESOURCE_TABLE_POPULATED',
                    resourceTableType: 'ORG_UNIT_STRUCTURE',
                    analyticsTableType: undefined,
                })

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            analyticsTableHooks: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read' && params?.id) {
                                    return { ...analyticsTableHook }
                                }
                                if (type === 'read') {
                                    if (
                                        params?.params?.filter?.includes(
                                            matchingExistingElementFilter
                                        )
                                    ) {
                                        return {
                                            pager: { total: 1 },
                                            analyticsTableHooks: [
                                                testAnalyticsTableHookForm(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        analyticsTableHooks: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, analyticsTableHook }
            }
        )

        it('should render fields prefilled with existing values', async () => {
            const { screen, analyticsTableHook } = await renderForm()
            uiAssertions.expectNameFieldExist(analyticsTableHook.name, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'sql',
                analyticsTableHook.sql,
                screen
            )
        })

        it('should submit changes and return to the list view', async () => {
            const { screen, analyticsTableHook } = await renderForm()
            const newName = faker.person.firstName()
            await uiActions.enterName(newName, screen)
            await uiActions.submitForm(screen)
            await waitFor(() =>
                expect(updateMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: analyticsTableHook.id,
                        data: expect.arrayContaining([
                            {
                                op: 'replace',
                                path: '/name',
                                value: newName,
                            },
                        ]),
                    })
                )
            )
        })

        it('should have a cancel button linking back to the list view', async () => {
            const { screen } = await renderForm()
            const cancelButton = screen.getByTestId('form-cancel-link')
            expect(cancelButton).toBeVisible()
            expect(cancelButton).toHaveAttribute(
                'href',
                `/${section.namePlural}`
            )
        })

        it('should do nothing when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitAndCloseForm(screen)
            await waitFor(() =>
                expect(
                    screen.queryByTestId('formfields-name')
                ).not.toBeInTheDocument()
            )
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})
