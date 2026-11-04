import { faker } from '@faker-js/faker'
import { render, within } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/validationRules.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { getConstantTranslation, SECTIONS_MAP } from '../../lib'
import {
    randomLongString,
    testCustomAttribute,
    testOrgUnitLevel,
    testValidationRule,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.validationRule
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe.skip('Validation Rule form tests', () => {
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

    describe.skip('Common', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            validationRules: (type: any, params: any) => {
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
                                            validationRules: [
                                                testValidationRule(),
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

                return { screen, attributes }
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

    describe.skip('New Validation Rule form', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const periodTypes = ['Daily', 'Monthly', 'Yearly']
                const organisationUnitLevels = [
                    testOrgUnitLevel({ level: 1 }),
                    testOrgUnitLevel({ level: 2 }),
                    testOrgUnitLevel({ level: 3 }),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            periodTypes: () => ({
                                periodTypes: periodTypes.map((pt) => ({
                                    name: pt,
                                })),
                            }),
                            organisationUnitLevels: () => ({
                                pager: {},
                                organisationUnitLevels,
                            }),
                            validationRules: (type: any, params: any) => {
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
                                            validationRules: [
                                                testValidationRule(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        validationRules: [],
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
                    attributes,
                    periodTypes,
                    organisationUnitLevels,
                }
            }
        )

        it('renders all needed fields', async () => {
            const { screen, periodTypes, organisationUnitLevels, attributes } =
                await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('shortName', '', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', '', screen)
            uiAssertions.expectRadioFieldToExist(
                'missingValueStategy-leftSide',
                [
                    { label: 'Never skip', checked: true },
                    { label: 'Skip if any value is missing', checked: false },
                    { label: 'Skip if all values are missing', checked: false },
                ],
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'leftSide.slidingWindow',
                false,
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-operator'),
                {
                    selected: 'Not equal to',
                    options: [
                        { displayName: 'Not equal to' },
                        ...mockSchema.properties.operator.constants
                            .filter((o) => o !== 'not_equal_to')
                            .map((o) => ({
                                displayName: getConstantTranslation(o),
                            })),
                    ],
                },
                screen
            )
            uiAssertions.expectRadioFieldToExist(
                'missingValueStategy-rightSide',
                [
                    { label: 'Never skip', checked: true },
                    { label: 'Skip if any value is missing', checked: false },
                    { label: 'Skip if all values are missing', checked: false },
                ],
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'rightSide.slidingWindow',
                false,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist('instruction', '', screen)
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-periodtype'),
                {
                    selected: 'Monthly',
                    options: periodTypes.map((pt: string) => ({
                        displayName: pt,
                    })),
                },
                screen
            )
            uiAssertions.expectRadioFieldToExist(
                'importance',
                [
                    { label: 'High', checked: false },
                    { label: 'Medium', checked: true },
                    { label: 'Low', checked: false },
                ],
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'skipFormValidation',
                false,
                screen
            )

            await uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-organisationunitlevels'),
                {
                    selected: [],
                    options: organisationUnitLevels,
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
            const { screen, periodTypes, organisationUnitLevels, attributes } =
                await renderForm()
            const aName = faker.person.firstName()
            const aShortName = faker.person.firstName()
            const aCode = faker.string.alpha(5)
            const aDescription = faker.lorem.paragraph()
            const operatorOriginalIndex =
                mockSchema.properties.operator.constants.length - 1
            const anOperator =
                mockSchema.properties.operator.constants[operatorOriginalIndex]
            const someInstructions = faker.lorem.paragraph()
            const periodTypeIndex = 2
            const aPeriodType = periodTypes[periodTypeIndex]
            const anAttribute = faker.internet.userName()
            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.enterCode(aCode, screen)
            await uiActions.enterInputFieldValue(
                'description',
                aDescription,
                screen
            )
            await uiActions.pickRadioField(
                'missingValueStategy-leftSide',
                'Skip if any value is missing',
                screen
            )
            await uiActions.clickOnCheckboxField(
                'leftSide.slidingWindow',
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-operator'),
                operatorOriginalIndex,
                screen
            )
            await uiActions.pickRadioField(
                'missingValueStategy-rightSide',
                'Skip if all values are missing',
                screen
            )
            await uiActions.clickOnCheckboxField(
                'rightSide.slidingWindow',
                screen
            )
            await uiActions.enterInputFieldValue(
                'instruction',
                someInstructions,
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-periodtype'),
                periodTypeIndex,
                screen
            )
            await uiActions.pickRadioField('importance', 'Low', screen)
            await uiActions.clickOnCheckboxField('skipFormValidation', screen)
            await uiActions.pickOptionFromMultiSelect(
                screen.getByTestId('formfields-organisationunitlevels'),
                [0, 2],
                screen
            )
            const attributeInput = within(
                screen.getByTestId(`attribute-${attributes[0].id}`)
            ).getByRole('textbox') as HTMLInputElement
            await uiActions.pasteIntoInput(attributeInput, anAttribute)

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        code: aCode,
                        description: aDescription,
                        leftSide: {
                            missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                            description: undefined,
                            expression: undefined,
                            slidingWindow: true,
                        },
                        rightSide: {
                            missingValueStrategy: 'SKIP_IF_ALL_VALUES_MISSING',
                            description: undefined,
                            expression: undefined,
                            slidingWindow: true,
                        },
                        operator: anOperator,
                        instruction: someInstructions,
                        periodType: aPeriodType,
                        importance: 'LOW',
                        skipFormValidation: true,
                        organisationUnitLevels: [
                            organisationUnitLevels[0].level,
                            organisationUnitLevels[2].level,
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

    describe.skip('Edit Validation Rule form', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const periodTypes = ['Daily', 'Monthly', 'Yearly']
                const organisationUnitLevels = [
                    testOrgUnitLevel({ level: 1 }),
                    testOrgUnitLevel({ level: 2 }),
                    testOrgUnitLevel({ level: 3 }),
                ]
                const validationRule = testValidationRule({
                    periodType: periodTypes[0],
                    organisationUnitLevels: [
                        organisationUnitLevels[1].level,
                        organisationUnitLevels[2].level,
                    ],
                    attributeValues: [
                        { attribute: attributes[0], value: 'attribute' },
                    ],
                })
                const id = validationRule.id

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            periodTypes: () => ({
                                periodTypes: periodTypes.map((pt) => ({
                                    name: pt,
                                })),
                            }),
                            organisationUnitLevels: () => ({
                                pager: {},
                                organisationUnitLevels,
                            }),
                            validationRules: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read' && params?.id) {
                                    return validationRule
                                }
                                return {
                                    pager: { total: 0 },
                                    validationRules: [],
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
                    validationRule,
                    periodTypes,
                    attributes,
                    organisationUnitLevels,
                }
            }
        )

        it('prefills all fields', async () => {
            const {
                screen,
                validationRule,
                organisationUnitLevels,
                attributes,
                periodTypes,
            } = await renderForm()

            uiAssertions.expectNameFieldExist(validationRule.name, screen)
            uiAssertions.expectInputFieldToExist(
                'shortName',
                validationRule.shortName,
                screen
            )
            uiAssertions.expectCodeFieldExist(validationRule.code, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                validationRule.description,
                screen
            )
            uiAssertions.expectRadioFieldToExist(
                'missingValueStategy-leftSide',
                [
                    {
                        label: 'Never skip',
                        checked:
                            validationRule.leftSide.missingValueStrategy ===
                            'NEVER_SKIP',
                    },
                    {
                        label: 'Skip if any value is missing',
                        checked:
                            validationRule.leftSide.missingValueStrategy ===
                            'SKIP_IF_ANY_VALUE_MISSING',
                    },
                    {
                        label: 'Skip if all values are missing',
                        checked:
                            validationRule.leftSide.missingValueStrategy ===
                            'SKIP_IF_ALL_VALUES_MISSING',
                    },
                ],
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'leftSide.slidingWindow',
                validationRule.leftSide.slidingWindow,
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-operator'),
                {
                    selected: getConstantTranslation(validationRule.operator),
                    options: [
                        { displayName: 'Not equal to' },
                        ...mockSchema.properties.operator.constants
                            .filter((o) => o !== 'not_equal_to')
                            .map((o) => ({
                                displayName: getConstantTranslation(o),
                            })),
                    ],
                },
                screen
            )
            uiAssertions.expectRadioFieldToExist(
                'missingValueStategy-rightSide',
                [
                    {
                        label: 'Never skip',
                        checked:
                            validationRule.rightSide.missingValueStrategy ===
                            'NEVER_SKIP',
                    },
                    {
                        label: 'Skip if any value is missing',
                        checked:
                            validationRule.rightSide.missingValueStrategy ===
                            'SKIP_IF_ANY_VALUE_MISSING',
                    },
                    {
                        label: 'Skip if all values are missing',
                        checked:
                            validationRule.rightSide.missingValueStrategy ===
                            'SKIP_IF_ALL_VALUES_MISSING',
                    },
                ],
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'rightSide.slidingWindow',
                validationRule.rightSide.slidingWindow,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'instruction',
                validationRule.instruction,
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-periodtype'),
                {
                    selected: validationRule.periodType,
                    options: periodTypes.map((pt: string) => ({
                        displayName: pt,
                    })),
                },
                screen
            )
            uiAssertions.expectRadioFieldToExist(
                'importance',
                [
                    {
                        label: 'High',
                        checked: validationRule.importance === 'HIGH',
                    },
                    {
                        label: 'Medium',
                        checked: validationRule.importance === 'MEDIUM',
                    },
                    {
                        label: 'Low',
                        checked: validationRule.importance === 'LOW',
                    },
                ],
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'skipFormValidation',
                validationRule.skipFormValidation,
                screen
            )

            await uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-organisationunitlevels'),
                {
                    selected: validationRule.organisationUnitLevels.map(
                        (level: number) =>
                            organisationUnitLevels.find(
                                (oul: any) => oul.level === level
                            ) || {}
                    ),
                    options: organisationUnitLevels,
                },
                screen
            )
            attributes.forEach((attribute: { id: string; value: string }) => {
                const attributeInput = screen.getByTestId(
                    `attribute-${attribute.id}`
                )
                expect(attributeInput).toBeVisible()
                expect(
                    within(
                        within(attributeInput).getByTestId('dhis2-uicore-input')
                    ).getByRole('textbox')
                ).toHaveValue(attribute.value)
            })
        })

        it('should submit the data', async () => {
            const { screen, validationRule } = await renderForm()
            const newCode = faker.science.chemicalElement().symbol
            await uiActions.clearInputField('code', screen)
            await uiActions.enterCode(newCode, screen)
            await uiActions.submitForm(screen)

            expect(updateMock).toHaveBeenCalledTimes(1)
            expect(updateMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    id: validationRule.id,
                    data: [{ op: 'replace', path: '/code', value: newCode }],
                })
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
