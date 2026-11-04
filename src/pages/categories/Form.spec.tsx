import { faker } from '@faker-js/faker'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/categoriesSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    randomLongString,
    testCategoryForm,
    testCategoryOption,
    testCustomAttribute,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.category
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Categories form tests', () => {
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
                const attributes = [testCustomAttribute({ mandatory: false })]
                const categoryOptions = [
                    testCategoryOption(),
                    testCategoryOption(),
                ]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            categoryOptions: () => ({
                                categoryOptions,
                                pager: {},
                            }),
                            categories: (type: any, params: any) => {
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
                                            categories: [testCategoryForm()],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        categories: [],
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
            uiAssertions.expectFieldToHaveError(
                'formfields-shortName',
                'Required',
                screen
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

        it('should show an error if short name field is too long', async () => {
            const { screen } = await renderForm()
            const longName = randomLongString(54)
            await uiActions.enterInputFieldValue('shortName', longName, screen)
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'shortName',
                50,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })

        it('should show an error if code field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(57)
            await uiActions.enterInputFieldValue('code', longText, screen)
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'code',
                50,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })

        it('should show an error if description field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(2010)
            await uiActions.enterInputFieldValue(
                'description',
                longText,
                screen
            )
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'description',
                2000,
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

        it('should show an error if short name field is a duplicate', async () => {
            const existingShortName = faker.company.name()
            const { screen } = await renderForm({
                matchingExistingElementFilter: `shortName:ieq:${existingShortName}`,
            })
            await uiAssertions.expectInputToErrorWhenDuplicate(
                'shortName',
                existingShortName,
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

        it('not show an add all button for category options', async () => {
            const { screen } = await renderForm()
            const addAllButton = screen.queryByTestId(
                'categoryOptions-transfer-actions-addall'
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
                const attributes = [testCustomAttribute({ mandatory: false })]
                const categoryOptions = [
                    testCategoryOption(),
                    testCategoryOption(),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            categoryOptions: () => ({
                                categoryOptions,
                                pager: {},
                            }),
                            categories: (type: any, params: any) => {
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
                                            categories: [testCategoryForm()],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        categories: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, categoryOptions }
            }
        )

        it('contain all needed field', async () => {
            const { screen } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('shortName', '', screen)
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
            const { screen, categoryOptions } = await renderForm()
            const aName = faker.person.firstName()
            const aShortName = faker.person.lastName()

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.pickOptionInTransfer(
                'dhis2-uicore-transfer',
                categoryOptions[1].displayName,
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
                            attributeValues: [],
                            dataDimension: true,
                            dataDimensionType: 'DISAGGREGATION',
                            name: aName,
                            shortName: aShortName,
                            categoryOptions: [
                                expect.objectContaining({
                                    displayName: categoryOptions[1].displayName,
                                    id: categoryOptions[1].id,
                                }),
                            ],
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
                const attributes = [testCustomAttribute({ mandatory: false })]
                const categoryOptions = [
                    testCategoryOption(),
                    testCategoryOption(),
                ]
                const category = testCategoryForm()
                category.categoryOptions = [categoryOptions[0]]
                category.id = id

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            categoryOptions: () => ({
                                categoryOptions,
                                pager: {},
                            }),
                            categories: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read' && params?.id) {
                                    return { ...category }
                                }
                                return {
                                    pager: { total: 0 },
                                    categories: [],
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, categoryOptions, category }
            }
        )

        it('contain all needed field prefilled', async () => {
            const { screen, category } = await renderForm()

            uiAssertions.expectNameFieldExist(category.name, screen)
            uiAssertions.expectInputFieldToExist(
                'shortName',
                category.shortName,
                screen
            )
        })

        it('should submit the data and return to the list view on success when a field is changed', async () => {
            const { screen, category } = await renderForm()
            const newName = faker.word.words()
            await uiActions.enterName(newName, screen)
            await uiActions.submitForm(screen)

            await waitFor(() =>
                expect(updateMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: category.id,
                        data: [
                            { op: 'replace', path: '/name', value: newName },
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
