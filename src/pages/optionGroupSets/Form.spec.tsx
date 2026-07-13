import { faker } from '@faker-js/faker'
import { act, render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/optionGroupSetsSchema.json'
import optionSetSchemaMock from '../../__mocks__/schema/optionSet.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { ModelSchemas, SECTIONS_MAP } from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import {
    randomLongString,
    testCustomAttribute,
    testOptionSet,
    testOptionGroupSet,
    testOptionGroup,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.optionGroupSet
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Option group sets form tests', () => {
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
                const optionSets = [testOptionSet()]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            optionSets: () => ({ optionSets }),
                            optionGroupSets: (type: any, params: any) => {
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
                                            optionGroupSets: [
                                                testOptionGroupSet(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        optionGroupSets: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, attributes, optionSets }
            }
        )
        it('should show an error if name field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(231)
            await uiActions.enterName(longText, screen)
            await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
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

        it('should open the option set new form in a drawer when clicking the "Add new" button', async () => {
            const { screen } = await renderForm()

            useSchemaStore.getState().setSchemas({
                ...useSchemaStore.getState().schemas,
                optionSet: optionSetSchemaMock,
            } as unknown as ModelSchemas)

            // Flush the useEffect dynamic import in ModelSingleSelectRefreshableFormField
            await act(async () => {})

            const optionSetField = screen.getByTestId('formfields-optionSet')
            const addNewButton =
                within(optionSetField).getAllByRole('button')[1]
            await userEvent.click(addNewButton)

            expect(
                await screen.findByText('Add new Option set')
            ).toBeInTheDocument()
            expect(screen.getByTestId('optionSetNewForm')).toBeInTheDocument()
            expect(
                within(screen.getByTestId('optionSetNewForm')).getByTestId(
                    'form-submit-button'
                )
            ).toHaveTextContent('Save and close')
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
                const optionSets = [
                    testOptionSet(),
                    testOptionSet(),
                    testOptionSet(),
                ]

                const optionGroups = [testOptionGroup(), testOptionGroup()]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            optionSets: () => ({ optionSets }),
                            optionGroups: () => ({
                                optionGroups,
                                pager: {},
                            }),
                            optionGroupSets: (type: any, params: any) => {
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
                                            optionGroupSets: [
                                                testOptionGroupSet(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        optionGroupSets: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, attributes, optionSets, optionGroups }
            }
        )

        it('contains all needed field', async () => {
            const { screen, optionSets } = await renderForm()

            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', '', screen)
            uiAssertions.expectCheckboxFieldToExist(
                'dataDimension',
                false,
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionSet'),
                { options: optionSets },
                screen
            )
        })
        it('shows options transfer when option set is selected', async () => {
            const { screen, optionSets, optionGroups } = await renderForm()
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionSet'),
                { options: optionSets },
                screen
            )
            expect(
                screen.getByText(
                    'Choose an option set to start adding option groups.'
                )
            ).toBeInTheDocument()
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-optionSet'),
                2,
                screen
            )
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'optionGroups-transfer',
                { lhs: optionGroups, rhs: [] },
                screen
            )
            expect(
                screen.queryByText(
                    'You must select an option set before you can select options.'
                )
            ).toBeNull()
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
            const { screen, optionSets } = await renderForm()
            const aName = faker.animal.bird()
            const aCode = faker.science.chemicalElement().symbol
            const aDescription = faker.company.buzzPhrase()

            await uiActions.enterName(aName, screen)
            await uiActions.enterCode(aCode, screen)
            await uiActions.enterInputFieldValue(
                'description',
                aDescription,
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-optionSet'),
                2,
                screen
            )
            await uiActions.clickOnCheckboxField('dataDimension', screen)

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        code: aCode,
                        description: aDescription,
                        optionSet: expect.objectContaining({
                            id: optionSets[2].id,
                        }),
                        dataDimension: true,
                    }),
                })
            )
        })
    })
    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const optionSets = [
                    testOptionSet(),
                    testOptionSet(),
                    testOptionSet(),
                ]
                const optionGroups = [testOptionGroup(), testOptionGroup()]
                const optionGroupSet = {
                    ...testOptionGroupSet(),
                    optionSet: {
                        id: optionSets[0].id,
                        displayName: optionSets[0].displayName,
                    },
                    optionGroups: [
                        {
                            id: optionGroups[0].id,
                            displayName: optionGroups[0].displayName,
                        },
                    ],
                }
                const id = optionGroupSet.id
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            optionSets: () => ({ optionSets }),
                            optionGroups: () => ({
                                optionGroups,
                                pager: {},
                            }),
                            optionGroupSets: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return {
                                            ...optionGroupSet,
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        optionGroupSets: [],
                                    }
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
                    attributes,
                    optionSets,
                    optionGroups,
                    optionGroupSet,
                }
            }
        )
        it('contain all needed field prefilled', async () => {
            const { screen, optionGroups, optionSets, optionGroupSet } =
                await renderForm()
            screen.debug()

            uiAssertions.expectNameFieldExist(optionGroupSet.name, screen)
            uiAssertions.expectCodeFieldExist(optionGroupSet.code, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                optionGroupSet.description,
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'dataDimension',
                optionGroupSet.dataDimension,
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionSet'),
                {
                    options: optionSets,
                    selected: optionGroupSet?.optionSet?.displayName,
                    disabled: true,
                },
                screen
            )

            await uiAssertions.expectTransferFieldToExistWithOptions(
                'optionGroups-transfer',
                {
                    lhs: [optionGroups[1]],
                    rhs: [optionGroups[0]],
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
        it('should do nothing and return to the list view on success when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})
