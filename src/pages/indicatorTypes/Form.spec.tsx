import { faker } from '@faker-js/faker'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/indicatorTypes.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    randomLongString,
    testIndicatorType,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.indicatorType
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Indicator types form tests', () => {
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
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            indicatorTypes: (type: any, params: any) => {
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
                                            indicatorTypes: [
                                                testIndicatorType(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        indicatorTypes: [],
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
        it('should not submit when required values are missing', async () => {
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
        it('should show a warning if factor field is a duplicate', async () => {
            const existingFactor = faker.number
                .int({ min: 1, max: 100 })
                .toString()
            const { screen } = await renderForm({
                matchingExistingElementFilter: `factor:eq:${existingFactor}`,
            })
            await uiActions.enterInputFieldValue(
                'factor',
                existingFactor,
                screen,
                { type: 'spinbutton' }
            )
            await waitFor(() =>
                uiAssertions.expectInputFieldToHaveWarning(
                    `formfields-factor`,
                    'An indicator type with this factor already exists',
                    screen
                )
            )

            await uiActions.enterName(faker.company.name(), screen)
            await uiActions.submitForm(screen)
            await waitFor(() => expect(createMock).toHaveBeenCalled())
        })
    })
    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            indicatorTypes: (type: any, params: any) => {
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
                                            indicatorTypes: [
                                                testIndicatorType(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        indicatorTypes: [],
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
        it('contain all needed field', async () => {
            const { screen } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist(
                'factor',
                '',
                screen,
                'spinbutton'
            )
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
            const { screen } = await renderForm()
            const aName = faker.internet.userName()
            const aFactor = faker.number.int({ min: 1, max: 100 }).toString()
            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue('factor', aFactor, screen, {
                type: 'spinbutton',
            })
            await uiActions.submitForm(screen)
            await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1))
            expect(createMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    id: undefined,
                    data: {
                        id: undefined,
                        name: aName,
                        factor: aFactor,
                    },
                })
            )
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
                const indicatorType = testIndicatorType({
                    id,
                    // zod-mock can exceed the schema max for factor
                    factor: faker.number.int({ min: 1, max: 100 }),
                })
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            indicatorTypes: (type: any, params: any) => {
                                if (type === 'read') {
                                    if (params?.id) {
                                        return indicatorType
                                    }
                                    if (
                                        params?.params?.filter?.includes(
                                            matchingExistingElementFilter
                                        )
                                    ) {
                                        return {
                                            pager: { total: 1 },
                                            // this is mocking that the request comes back with any value
                                            indicatorTypes: [
                                                testIndicatorType(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        indicatorTypes: [],
                                    }
                                }
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, indicatorType }
            }
        )
        it('contain all needed field prefilled', async () => {
            const { screen, indicatorType } = await renderForm()
            uiAssertions.expectNameFieldExist(indicatorType.name, screen)
            uiAssertions.expectInputFieldToExist(
                'factor',
                indicatorType.factor.toString(),
                screen,
                'spinbutton'
            )
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
            const { screen, indicatorType } = await renderForm()
            uiAssertions.expectNameFieldExist(indicatorType.name, screen)

            const newFactor = faker.number.int({ min: 1, max: 100 }).toString()
            await uiActions.clearInputField('factor', screen, 'spinbutton')
            await uiActions.enterInputFieldValue('factor', newFactor, screen, {
                type: 'spinbutton',
            })

            await uiActions.submitForm(screen)
            await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1))
            expect(updateMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    id: indicatorType.id,
                    data: [
                        { op: 'replace', path: '/factor', value: newFactor },
                    ],
                })
            )
        })
        it('should do nothing and return to the list view on success when no field is changed', async () => {
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
