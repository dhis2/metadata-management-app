import { faker } from '@faker-js/faker'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/dataApprovalWorkflowSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { DEFAULT_CATEGORYCOMBO_SELECT_OPTION, SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    randomLongString,
    testCategoryCombo,
    testDataApprovalWorkflowForm,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.dataApprovalWorkflow
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

const testDataApprovalLevel = ({
    id = randomDhis2Id(),
    displayName = faker.word.words(),
} = {}) => ({
    id,
    displayName,
})

describe('Data approval workflows form tests', () => {
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

    describe('Common', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const periodTypes = ['Daily', 'Monthly', 'Yearly']
                const categoryCombos = [
                    testCategoryCombo(),
                    testCategoryCombo(),
                ]
                const dataApprovalLevels = [
                    testDataApprovalLevel(),
                    testDataApprovalLevel(),
                ]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            periodTypes: () => ({
                                periodTypes: periodTypes.map((pt) => ({
                                    name: pt,
                                })),
                            }),
                            categoryCombos: () => ({
                                pager: {},
                                categoryCombos,
                            }),
                            dataApprovalLevels: () => ({
                                pager: {},
                                dataApprovalLevels,
                            }),
                            dataApprovalWorkflows: (type: any, params: any) => {
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
                                            dataApprovalWorkflows: [
                                                testDataApprovalWorkflowForm(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        dataApprovalWorkflows: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return {
                    screen,
                    periodTypes,
                    categoryCombos,
                    dataApprovalLevels,
                }
            }
        )

        it('should not submit when required values are missing', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
            uiAssertions.expectFieldToHaveError(
                'formfields-name',
                'Required',
                screen
            )
        })

        it('should show an error if name field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(231)
            await uiActions.enterName(longText, screen)
            await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })

        it('should show an error if name field is a duplicate', async () => {
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
    })

    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const periodTypes = ['Daily', 'Monthly', 'Yearly']
                const categoryCombos = [
                    testCategoryCombo(),
                    testCategoryCombo(),
                ]
                const dataApprovalLevels = [
                    testDataApprovalLevel(),
                    testDataApprovalLevel(),
                ]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            periodTypes: () => ({
                                periodTypes: periodTypes.map((pt) => ({
                                    name: pt,
                                })),
                            }),
                            categoryCombos: () => ({
                                pager: {},
                                categoryCombos,
                            }),
                            dataApprovalLevels: () => ({
                                pager: {},
                                dataApprovalLevels,
                            }),
                            dataApprovalWorkflows: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                return {
                                    pager: { total: 0 },
                                    dataApprovalWorkflows: [],
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return {
                    screen,
                    periodTypes,
                    categoryCombos,
                    dataApprovalLevels,
                }
            }
        )

        it('should contain all needed fields', async () => {
            const { screen } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            expect(
                screen.getByTestId('formfields-periodtype')
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('formfields-categorycombo')
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('formfields-dataapprovallevels')
            ).toBeInTheDocument()
        })

        it('should have a cancel button with a link back to the list view', async () => {
            const { screen } = await renderForm()
            const cancelButton = screen.getByTestId('form-cancel-link')
            expect(cancelButton).toBeVisible()
            expect(cancelButton).toHaveAttribute(
                'href',
                `/${section.namePlural}`
            )
        })

        it('should submit the data', async () => {
            const { screen, periodTypes } = await renderForm()
            const aName = faker.word.words()

            await uiActions.enterName(aName, screen)
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-periodtype'),
                2,
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-categorycombo'),
                0,
                screen
            )

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        periodType: periodTypes[2],
                        categoryCombo: expect.objectContaining({
                            id: DEFAULT_CATEGORYCOMBO_SELECT_OPTION.id,
                        }),
                    }),
                })
            )
        })
    })

    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions, { id = randomDhis2Id() } = {}) => {
                const periodTypes = ['Daily', 'Monthly', 'Yearly']
                const categoryCombos = [
                    testCategoryCombo(),
                    testCategoryCombo(),
                ]
                const dataApprovalLevels = [
                    testDataApprovalLevel(),
                    testDataApprovalLevel(),
                    testDataApprovalLevel(),
                ]
                const dataApprovalWorkflow = testDataApprovalWorkflowForm({
                    id,
                    periodType: periodTypes[0],
                    categoryCombo: categoryCombos[0],
                    dataApprovalLevels: [dataApprovalLevels[0]],
                })

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            periodTypes: () => ({
                                periodTypes: periodTypes.map((pt) => ({
                                    name: pt,
                                })),
                            }),
                            categoryCombos: () => ({
                                pager: {},
                                categoryCombos,
                            }),
                            dataApprovalLevels: () => ({
                                pager: {},
                                dataApprovalLevels,
                            }),
                            dataApprovalWorkflows: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read' && params?.id) {
                                    return dataApprovalWorkflow
                                }
                                return {
                                    pager: { total: 0 },
                                    dataApprovalWorkflows: [],
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return {
                    screen,
                    periodTypes,
                    categoryCombos,
                    dataApprovalLevels,
                    dataApprovalWorkflow,
                }
            }
        )

        it('should contain all needed fields prefilled', async () => {
            const { screen, dataApprovalWorkflow } = await renderForm()
            uiAssertions.expectNameFieldExist(dataApprovalWorkflow.name, screen)
        })

        it('should submit updated data when a field is changed', async () => {
            const { screen, dataApprovalWorkflow } = await renderForm()
            const newName = faker.word.words()

            await uiActions.enterName(newName, screen)
            await uiActions.submitForm(screen)

            await waitFor(() =>
                expect(updateMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: dataApprovalWorkflow.id,
                        data: [
                            {
                                op: 'replace',
                                path: '/name',
                                value: newName,
                            },
                        ],
                    })
                )
            )
        })

        it('should do nothing when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})
