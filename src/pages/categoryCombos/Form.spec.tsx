import { faker } from '@faker-js/faker'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/categoryCombosSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    randomLongString,
    testCategory,
    testCategoryComboForm,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.categoryCombo
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Category combos form tests', () => {
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
                const categories = [testCategory(), testCategory()]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            categories: () => ({ categories, pager: {} }),
                            categoryCombos: (type: any, params: any) => {
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
                                            categoryCombos: [
                                                testCategoryComboForm(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        categoryCombos: [],
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

        it('should not submit when a required values is missing ', async () => {
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
            const longName = randomLongString(231)
            await uiActions.enterName(longName, screen)
            await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })

        it('should show an error if code field is too long', async () => {
            const { screen } = await renderForm()
            const longCode = randomLongString(57)
            await uiActions.enterCode(longCode, screen)
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'code',
                50,
                screen
            )
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

        it('should show an error if code field is a duplicate', async () => {
            const existingCode = faker.science.chemicalElement().symbol
            const { screen } = await renderForm({
                matchingExistingElementFilter: `code:ieq:${existingCode}`,
            })
            await uiAssertions.expectCodeToErrorWhenDuplicate(
                existingCode,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })

        it('not show an add all button for categories', async () => {
            const { screen } = await renderForm()
            const addAllButton = screen.queryByTestId(
                'categories-transfer-actions-addall'
            )
            expect(addAllButton).not.toBeInTheDocument()
        })
    })

    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const categories = [
                    testCategory({ categoryOptionsSize: 3 }),
                    testCategory({ categoryOptionsSize: 5 }),
                    testCategory({ categoryOptionsSize: 4 }),
                ]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            categories: () => ({
                                categories,
                                pager: {},
                            }),
                            categoryCombos: (type: any, params: any) => {
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
                                            categoryCombos: [
                                                testCategoryComboForm(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        categoryCombos: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, categories }
            }
        )

        it('contain all needed field', async () => {
            const { screen, categories } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'dhis2-uicore-transfer',
                {
                    lhs: categories,
                    rhs: [],
                },
                screen
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
            const { screen, categories } = await renderForm()
            const aName = faker.person.firstName()

            await uiActions.enterName(aName, screen)
            await uiActions.pickOptionInTransfer(
                'dhis2-uicore-transfer',
                categories[0].displayName,
                screen
            )
            await uiActions.pickRadioField(
                'dataDimensionType',
                'Disaggregation',
                screen
            )

            await uiActions.submitForm(screen)
            await waitFor(() =>
                expect(createMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            name: aName,
                            categories: [
                                expect.objectContaining({
                                    id: categories[0].id,
                                    categoryOptionsSize:
                                        categories[0].categoryOptionsSize,
                                    displayName: categories[0].displayName,
                                }),
                            ],
                            dataDimensionType: 'DISAGGREGATION',
                            skipTotal: false,
                        }),
                    })
                )
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
                const categories = [testCategory(), testCategory()]
                const categoryCombo = testCategoryComboForm({
                    id: id,
                    categories: [
                        {
                            id: categories[0].id,
                            displayName: categories[0].displayName,
                            categoryOptionsSize: faker.number.int({
                                min: 1,
                                max: 50,
                            }),
                        },
                    ],
                })

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            categories: () => ({
                                categories,
                                pager: {},
                            }),
                            categoryCombos: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read' && params?.id) {
                                    return { ...categoryCombo }
                                }
                                return {
                                    pager: { total: 0 },
                                    categoryCombos: [],
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, categories, categoryCombo }
            }
        )

        it('contain all needed field prefilled', async () => {
            const { screen, categories, categoryCombo } = await renderForm()

            uiAssertions.expectNameFieldExist(categoryCombo.name, screen)
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'dhis2-uicore-transfer',
                {
                    lhs: [categories[1]],
                    rhs: [categories[0]],
                },
                screen
            )
        })

        it('should submit the data and return to the list view on success when a field is changed', async () => {
            const { screen, categoryCombo } = await renderForm()

            const newCode = faker.string.alphanumeric(10)
            await uiActions.enterCode(newCode, screen)
            await uiActions.submitForm(screen)

            await waitFor(() =>
                expect(updateMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: categoryCombo.id,
                        data: [
                            { op: 'replace', path: '/code', value: newCode },
                        ],
                    })
                )
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
