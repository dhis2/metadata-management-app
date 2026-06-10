import { faker } from '@faker-js/faker'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/validationRuleGroups.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomLongString,
    testCustomAttribute,
    testValidationRule,
    testValidationRuleGroupsForm,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.validationRuleGroup
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Validation Rule Groups form tests', () => {
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

    describe('Common validation', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const validationRules = [
                    testValidationRule(),
                    testValidationRule(),
                ]
                const attributes = [testCustomAttribute({ mandatory: false })]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            validationRules: () => ({
                                validationRules,
                                pager: {},
                            }),
                            validationRuleGroups: (type: any, params: any) => {
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
                                            validationRuleGroups: [
                                                testValidationRuleGroupsForm(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        validationRuleGroups: [],
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

        it('shows error if name exceeds max length', async () => {
            const { screen } = await renderForm()
            const longName = randomLongString(231)
            await uiActions.enterName(longName, screen)
            await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })

        it('shows error if code exceeds max length', async () => {
            const { screen } = await renderForm()
            const longCode = randomLongString(57)
            await uiActions.enterInputFieldValue('code', longCode, screen)
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'code',
                50,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })

        it('shows error if name is duplicate', async () => {
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

        it('shows error if code is duplicate', async () => {
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
    })

    describe('New Validation Rule Group form', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const validationRules = [
                    testValidationRule(),
                    testValidationRule(),
                ]
                const attributes = [testCustomAttribute({ mandatory: false })]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            validationRules: () => ({
                                validationRules,
                                pager: {},
                            }),
                            validationRuleGroups: (type: any, params: any) => {
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
                                            validationRuleGroups: [
                                                testValidationRuleGroupsForm(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        validationRuleGroups: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, validationRules, attributes }
            }
        )

        it('renders all needed fields', async () => {
            const { screen, validationRules, attributes } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', '', screen)
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'validationRules-transfer',
                {
                    lhs: validationRules,
                    rhs: [],
                },
                screen
            )
            attributes.forEach((attribute: { id: string }) => {
                expect(
                    screen.getByTestId(`attribute-${attribute.id}`)
                ).toBeVisible()
            })
        })

        it('submits correctly filled data', async () => {
            const { screen, validationRules, attributes } = await renderForm()
            const aName = faker.person.firstName()
            const aCode = faker.string.alpha(5)
            const anAttribute = faker.internet.userName()

            await uiActions.enterName(aName, screen)
            await uiActions.enterCode(aCode, screen)
            await uiActions.pickOptionInTransfer(
                'validationRules-transfer',
                validationRules[1].displayName,
                screen
            )
            const attributeInput = within(
                screen.getByTestId(`attribute-${attributes[0].id}`)
            ).getByRole('textbox') as HTMLInputElement
            await userEvent.type(attributeInput, anAttribute)

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        code: aCode,
                        validationRules: [
                            expect.objectContaining({
                                id: validationRules[1].id,
                            }),
                        ],
                        attributeValues: [
                            {
                                attribute: expect.objectContaining({
                                    id: attributes[0].id,
                                }),
                                value: anAttribute,
                            },
                        ],
                    }),
                })
            )
        })

        it('has a cancel button linking back to list', async () => {
            const { screen } = await renderForm()
            const cancelButton = screen.getByTestId('form-cancel-link')
            expect(cancelButton).toBeVisible()
            expect(cancelButton).toHaveAttribute(
                'href',
                `/${section.namePlural}`
            )
        })
    })

    describe('Edit Validation Rule Group form', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const validationRules = [
                    testValidationRule(),
                    testValidationRule(),
                ]
                const attributes = [testCustomAttribute({ mandatory: false })]
                const validationRuleGroups = testValidationRuleGroupsForm()
                validationRuleGroups.validationRules = [validationRules[0]]
                const id = validationRuleGroups.id

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            validationRules: () => ({
                                validationRules,
                                pager: {},
                            }),
                            validationRuleGroups: (type: any, params: any) => {
                                if (type === 'update') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read' && params?.id) {
                                    return { ...validationRuleGroups }
                                }
                                return {
                                    pager: { total: 0 },
                                    validationRuleGroups: [],
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, validationRules, validationRuleGroups }
            }
        )

        it('prefills all fields', async () => {
            const { screen, validationRules, validationRuleGroups } =
                await renderForm()

            uiAssertions.expectNameFieldExist(validationRuleGroups.name, screen)
            uiAssertions.expectCodeFieldExist(validationRuleGroups.code, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                validationRuleGroups.description,
                screen
            )
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'validationRules-transfer',
                {
                    lhs: [validationRules[1]],
                    rhs: [validationRules[0]],
                },
                screen
            )
        })

        it('does not submit when no changes are made', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })

        it('has cancel button linking back to list', async () => {
            const { screen } = await renderForm()
            const cancelButton = screen.getByTestId('form-cancel-link')
            expect(cancelButton).toBeVisible()
            expect(cancelButton).toHaveAttribute(
                'href',
                `/${section.namePlural}`
            )
        })
    })
})
