import { faker } from '@faker-js/faker'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/categoriesOptionGroupSetsSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    randomLongString,
    testCategoryOption,
    testCategoryOptionGroupForm,
    testCustomAttribute,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.categoryOptionGroup
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Category option groups form tests', () => {
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
                            categoryOptionGroups: (type: any, params: any) => {
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
                                            categoryOptionGroups: [
                                                testCategoryOptionGroupForm(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        categoryOptionGroups: [],
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
            await uiActions.submitForm(screen)

            await uiAssertions.expectNameToErrorWhenExceedsLength(screen)

            expect(createMock).not.toHaveBeenCalled()
        })

        it('should show an error if short name field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(54)
            await uiActions.enterInputFieldValue('shortName', longText, screen)
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
            const existingShortName = faker.word.words()
            const { screen } = await renderForm({
                matchingExistingElementFilter: `code:ieq:${existingShortName}`,
            })
            await uiAssertions.expectCodeToErrorWhenDuplicate(
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
                'categoryOptionGroups-transfer-actions-addall'
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
                            categoryOptionGroups: (type: any, params: any) => {
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
                                            categoryOptionGroups: [
                                                testCategoryOptionGroupForm(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        categoryOptionGroups: [],
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
            const { screen, categoryOptions } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'dhis2-uicore-transfer',
                {
                    lhs: categoryOptions,
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
                            name: aName,
                            shortName: aShortName,
                            categoryOptions: [
                                expect.objectContaining({
                                    id: categoryOptions[1].id,
                                    displayName: categoryOptions[1].displayName,
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
                const categoryOptionGroup = testCategoryOptionGroupForm({
                    id: id,
                    categoryOptions: [categoryOptions[0]],
                })

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
                            categoryOptionGroups: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read' && params?.id) {
                                    return { ...categoryOptionGroup }
                                }
                                return {
                                    pager: { total: 0 },
                                    categoryOptionGroups: [],
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, categoryOptions, categoryOptionGroup }
            }
        )

        it('contain all needed field prefilled', async () => {
            const { screen, categoryOptions, categoryOptionGroup } =
                await renderForm()

            uiAssertions.expectNameFieldExist(categoryOptionGroup.name, screen)
            uiAssertions.expectInputFieldToExist(
                'shortName',
                categoryOptionGroup.shortName,
                screen
            )
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'dhis2-uicore-transfer',
                {
                    lhs: [categoryOptions[1]],
                    rhs: [categoryOptions[0]],
                },
                screen
            )
        })

        it('should submit the data and return to the list view on success when a field is changed', async () => {
            const { screen, categoryOptions, categoryOptionGroup } =
                await renderForm()

            const aCode = faker.string.alpha(5)

            uiAssertions.expectNameFieldExist(categoryOptionGroup.name, screen)
            await uiActions.enterCode(aCode, screen)
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'dhis2-uicore-transfer',
                {
                    lhs: [categoryOptions[1]],
                    rhs: [categoryOptions[0]],
                },
                screen
            )

            await uiActions.submitForm(screen)

            await waitFor(() =>
                expect(updateMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: categoryOptionGroup.id,
                        data: [{ op: 'replace', path: '/code', value: aCode }],
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
