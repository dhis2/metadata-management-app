import { faker } from '@faker-js/faker'
import { render, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import predictorSchemaMock from '../../__mocks__/schema/predictor.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { getConstantTranslation, SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    randomLongString,
    testCategoryOptionCombo,
    testCustomAttribute,
    testDataElement,
    testPredictor,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Predictor } from '../../types/generated'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

jest.setTimeout(40 * 1000) // set timeout to 40 seconds for these tests

const section = SECTIONS_MAP.predictor

// a mock expression schema is needed because the expression validator uses this rather than predictor schema
const mockExpressionSchema = {
    name: 'expression',
    plural: 'expressions',
    properties: {
        expression: {
            name: 'expression',
            fieldName: 'expression',
            propertyType: 'TEXT',
            klass: 'java.lang.String',
            unique: false,
            required: false,
            persisted: true,
            collection: false,
            attribute: false,
            simple: true,
            embeddedObject: false,
            identifiableObject: false,
            translatable: false,
            owner: true,
            readable: true,
            writable: true,
            max: 2147483647,
            min: 0,
        },
    },
}

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

jest.mock('../../lib/schemas/schemaStore', () => {
    const actual = jest.requireActual('../../lib/schemas/schemaStore')
    return {
        ...actual,
        useSchema: (schemaName: string) =>
            schemaName === 'expression'
                ? mockExpressionSchema
                : actual.useSchema(schemaName),
    }
})

describe('Predictors form tests', () => {
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
            { section, mockSchema: predictorSchemaMock },
            (
                routeOptions,
                {
                    customTestData = {},
                    matchingExistingElementFilter = undefined,
                } = {}
            ) => {
                const attributes = [testCustomAttribute()]
                const dataElements = [
                    testDataElement(),
                    testDataElement(),
                    testDataElement(),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            dataElements: () => ({ dataElements }),
                            predictors: (type: any, params: any) => {
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
                                            predictors: [testPredictor()],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        predictors: [],
                                    }
                                }
                            },
                            'predictors/expression/description': () => ({
                                status: 'OK',
                            }),
                            ...customTestData,
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
            expect(createMock).not.toHaveBeenCalled()

            uiAssertions.expectFieldToHaveError(
                'formfields-name',
                'Required',
                screen
            )
            uiAssertions.expectFieldToHaveError(
                'formfields-shortName',
                'Required',
                screen
            )
            uiAssertions.expectFieldToHaveError(
                'formfields-output',
                'Required',
                screen
            )
            uiAssertions.expectFieldToHaveError(
                'formfields-organisationunitlevels',
                'At least one organisation unit level is required',
                screen
            )
            uiAssertions.expectFieldToHaveError(
                'formfields-generator.expression',
                'Required',
                screen
            )
            uiAssertions.expectFieldToHaveError(
                'formfields-generator.description',
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

        it('should show an error if short name field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(231)
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
            const longText = randomLongString(60)
            await uiActions.enterCode(longText, screen)
            await uiAssertions.expectCodeToErrorWhenExceedsLength(screen)
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

        it('should show an error if numerator expression is malformed', async () => {
            const { screen } = await renderForm({
                customTestData: {
                    'predictors/expression/description': () => ({
                        status: 'ERROR',
                    }),
                },
            })
            const anExpression = faker.finance.routingNumber()
            await userEvent.click(
                screen.getByTestId(
                    'edit-generator.expression-expression-button'
                )
            )
            const editModal = await screen.findByTestId(
                `expression-builder-modal`
            )
            await uiActions.enterExpressionInModal(
                editModal,
                anExpression,
                screen
            )

            const error = within(editModal).getByTestId(
                `expression-builder-modal-input-validation`
            )
            expect(error).toBeVisible()
            expect(error).toHaveTextContent('Invalid expression')

            expect(
                within(editModal).getByTestId('apply-expression-button')
            ).toBeDisabled()
        })
    })
    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema: predictorSchemaMock },
            (
                routeOptions,
                {
                    customTestData = {},
                    matchingExistingElementFilter = undefined,
                } = {}
            ) => {
                const attributes = [testCustomAttribute()]
                const categoryCombo = { id: randomDhis2Id(), isDefault: false }
                const dataElementWithCategoryCombo = testDataElement({
                    categoryCombo,
                })
                const dataElementWithDefaultCategoryCombo = testDataElement({
                    categoryCombo: { id: randomDhis2Id(), isDefault: true },
                })
                const categoryOptionCombos = [
                    testCategoryOptionCombo({ categoryCombo }),
                    testCategoryOptionCombo({ categoryCombo }),
                ]
                const dataElements = [
                    dataElementWithCategoryCombo,
                    dataElementWithDefaultCategoryCombo,
                    testDataElement(),
                ]
                const organisationUnitLevels = [
                    {
                        level: 1,
                        id: randomDhis2Id(),
                        displayName: faker.word.noun(),
                    },
                    {
                        level: 2,
                        id: randomDhis2Id(),
                        displayName: faker.word.noun(),
                    },
                ]
                const periodTypes = ['Daily', 'Monthly', 'Yearly']
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            categoryOptionCombos: () => ({
                                categoryOptionCombos,
                            }),
                            dataElements: () => ({ dataElements }),
                            organisationUnitLevels: () => ({
                                pager: {},
                                organisationUnitLevels,
                            }),
                            periodTypes: () => ({
                                periodTypes: periodTypes.map((pt) => ({
                                    name: pt,
                                })),
                            }),
                            predictors: (type: any, params: any) => {
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
                                            predictors: [testPredictor()],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        predictors: [],
                                    }
                                }
                            },
                            'predictors/expression/description': () => ({
                                status: 'OK',
                            }),
                            'predictors/skipTest/description': () => ({
                                status: 'OK',
                            }),
                            ...customTestData,
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return {
                    screen,
                    attributes,
                    dataElements,
                    categoryOptionCombos,
                    organisationUnitLevels,
                    periodTypes,
                }
            }
        )

        it('contains all needed fields', async () => {
            const {
                screen,
                dataElements,
                organisationUnitLevels,
                periodTypes,
            } = await renderForm()

            // Basic information fields
            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('shortName', '', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', null, screen)

            // Predictor logic fields
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('dhis2-uiwidgets-singleselectfield'),
                {
                    selected: 'At selected level(s) only',
                    options: [
                        { displayName: 'At selected level(s) only' },
                        {
                            displayName:
                                'At selected level(s) and all levels below',
                        },
                    ],
                },
                screen
            )
            await uiAssertions.expectInputFieldToExist(
                'sequentialSampleCount',
                '0',
                screen,
                'spinbutton'
            )
            await uiAssertions.expectInputFieldToExist(
                'annualSampleCount',
                '0',
                screen,
                'spinbutton'
            )
            await uiAssertions.expectInputFieldToExist(
                'sequentialSkipCount',
                '',
                screen,
                'spinbutton'
            )

            uiAssertions.expectTextAreaFieldToExist(
                'generator.expression',
                null,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'generator.description',
                null,
                screen
            )
            expect(
                screen.getByTestId(
                    'edit-generator.expression-expression-button'
                )
            ).toBeVisible()
            uiAssertions.expectRadioFieldToExist(
                'missingValueStategy-generator',
                [
                    { label: 'Never skip', checked: false },
                    { label: 'Skip if any value is missing', checked: false },
                    { label: 'Skip if all values are missing', checked: false },
                ],
                screen
            )

            uiAssertions.expectTextAreaFieldToExist(
                'sampleSkipTest.expression',
                null,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'sampleSkipTest.description',
                null,
                screen
            )
            expect(
                screen.getByTestId(
                    'edit-sampleSkipTest.expression-expression-button'
                )
            ).toBeVisible()

            // Output fields
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-output'),
                { options: dataElements },
                screen
            )
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
            await uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-organisationunitlevels'),
                { selected: [], options: organisationUnitLevels },
                screen
            )
        })

        it('shows the output category option combo field appropriately based on selected data element', async () => {
            const { screen, categoryOptionCombos } = await renderForm()

            expect(
                screen.queryByTestId('formfields-outputCombo')
            ).not.toBeInTheDocument()

            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-output'),
                0,
                screen
            )

            await uiAssertions.expectSelectToExistWithOptions(
                await screen.findByTestId('formfields-outputCombo'),
                {
                    options: [
                        {
                            displayName:
                                'Predict using input category option combination',
                        },
                        ...categoryOptionCombos,
                    ],
                },
                screen
            )

            // Selections are cleared when outputCombo is toggled back to DE with default Category Combo
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-outputCombo'),
                1,
                screen
            )

            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-output'),
                1,
                screen
            )

            await waitFor(() => {
                expect(
                    screen.queryByTestId('formfields-outputCombo')
                ).not.toBeInTheDocument()
            })

            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-output'),
                0,
                screen
            )

            await uiAssertions.expectSelectToExistWithOptions(
                await screen.findByTestId('formfields-outputCombo'),
                {
                    selected: 'Predict using input category option combination',
                    options: [
                        {
                            displayName:
                                'Predict using input category option combination',
                        },
                        ...categoryOptionCombos,
                    ],
                },
                screen
            )
        })

        it('should submit the populated form successfully', async () => {
            const aName = faker.internet.userName()
            const aShortName = faker.internet.userName()
            const aCode = faker.science.chemicalElement().symbol
            const aDescription = faker.lorem.sentence()
            const aSequentialSampleCount = faker.number
                .int({ min: 1, max: 5 })
                .toString()
            const anAnnualSampleCount = faker.number
                .int({ min: 1, max: 5 })
                .toString()
            const aSequentialSkipCount = faker.number
                .int({ min: 1, max: 5 })
                .toString()
            const aGeneratorExpression = faker.number.int().toString()
            const aGeneratorDescription = faker.lorem.sentence()
            const aSkipTestExpression = faker.number.int().toString()
            const aSkipTestDescription = faker.lorem.sentence()

            const {
                screen,
                organisationUnitLevels,
                dataElements,
                categoryOptionCombos,
            } = await renderForm()

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

            await uiActions.pickOptionFromSelect(
                screen.getByTestId('dhis2-uiwidgets-singleselectfield'),
                1,
                screen
            )
            await uiActions.enterInputFieldValue(
                'sequentialSampleCount',
                aSequentialSampleCount,
                screen,
                { type: 'spinbutton' }
            )
            await uiActions.enterInputFieldValue(
                'annualSampleCount',
                anAnnualSampleCount,
                screen,
                { type: 'spinbutton' }
            )
            await uiActions.enterInputFieldValue(
                'sequentialSkipCount',
                aSequentialSkipCount,
                screen,
                { type: 'spinbutton' }
            )

            await uiActions.applyNewExpressionWithinModal(
                'generator.expression',
                aGeneratorExpression,
                screen
            )
            await uiActions.enterInputFieldValue(
                'generator.description',
                aGeneratorDescription,
                screen
            )
            await uiActions.pickRadioField(
                'missingValueStategy-generator',
                'Skip if any value is missing',
                screen
            )

            await uiActions.applyNewExpressionWithinModal(
                'sampleSkipTest.expression',
                aSkipTestExpression,
                screen
            )
            await uiActions.enterInputFieldValue(
                'sampleSkipTest.description',
                aSkipTestDescription,
                screen
            )

            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-output'),
                0,
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-outputCombo'),
                1,
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-periodtype'),
                2,
                screen
            )
            await uiActions.pickOptionFromMultiSelect(
                screen.getByTestId('formfields-organisationunitlevels'),
                [0, 1],
                screen
            )

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledTimes(1)
            expect(createMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        id: undefined,
                        name: aName,
                        shortName: aShortName,
                        code: aCode,
                        description: aDescription,
                        organisationUnitDescendants: 'DESCENDANTS',
                        sequentialSampleCount: Number(aSequentialSampleCount),
                        annualSampleCount: Number(anAnnualSampleCount),
                        sequentialSkipCount: Number(aSequentialSkipCount),
                        generator: expect.objectContaining({
                            expression: aGeneratorExpression,
                            description: aGeneratorDescription,
                            missingValueStrategy: 'SKIP_IF_ANY_VALUE_MISSING',
                        }),
                        sampleSkipTest: expect.objectContaining({
                            expression: aSkipTestExpression,
                            description: aSkipTestDescription,
                        }),
                        output: expect.objectContaining({
                            id: dataElements[0].id,
                        }),
                        outputCombo: expect.objectContaining({
                            id: categoryOptionCombos[0].id,
                        }),

                        periodType: 'Yearly',
                        organisationUnitLevels: expect.arrayContaining([
                            expect.objectContaining({
                                id: organisationUnitLevels[0].id,
                            }),
                            expect.objectContaining({
                                id: organisationUnitLevels[1].id,
                            }),
                        ]),
                    }),
                })
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
    })
    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema: predictorSchemaMock },
            (
                routeOptions,
                {
                    customTestData = {},
                    matchingExistingElementFilter = undefined,
                    useDefaultCCOutputDE = false,
                } = {}
            ) => {
                const attributes = [testCustomAttribute()]
                const categoryCombo = { id: randomDhis2Id(), isDefault: false }
                const dataElementWithCategoryCombo = testDataElement({
                    categoryCombo,
                })
                const dataElementWithDefaultCategoryCombo = testDataElement({
                    categoryCombo: { id: randomDhis2Id(), isDefault: true },
                })
                const categoryOptionCombos = [
                    testCategoryOptionCombo({ categoryCombo }),
                    testCategoryOptionCombo({ categoryCombo }),
                ]
                const dataElements = [
                    dataElementWithCategoryCombo,
                    dataElementWithDefaultCategoryCombo,
                    testDataElement(),
                ]
                const organisationUnitLevels = [
                    {
                        level: 1,
                        id: randomDhis2Id(),
                        displayName: faker.word.noun(),
                    },
                    {
                        level: 2,
                        id: randomDhis2Id(),
                        displayName: faker.word.noun(),
                    },
                ]
                const periodTypes = ['Daily', 'Monthly', 'Yearly']
                const id = randomDhis2Id()
                const predictor = testPredictor()
                predictor.id = id
                predictor.output = useDefaultCCOutputDE
                    ? dataElementWithDefaultCategoryCombo
                    : dataElementWithCategoryCombo
                if (!useDefaultCCOutputDE) {
                    predictor.outputCombo = categoryOptionCombos[0]
                }
                predictor.organisationUnitLevels = organisationUnitLevels
                predictor.periodType = periodTypes[1] as Predictor.periodType
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            categoryOptionCombos: () => ({
                                categoryOptionCombos,
                            }),
                            dataElements: () => ({ dataElements }),
                            organisationUnitLevels: () => ({
                                pager: {},
                                organisationUnitLevels,
                            }),
                            periodTypes: () => ({
                                periodTypes: periodTypes.map((pt) => ({
                                    name: pt,
                                })),
                            }),
                            predictors: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return predictor
                                    }
                                    if (
                                        params?.params?.filter?.includes(
                                            matchingExistingElementFilter
                                        )
                                    ) {
                                        return {
                                            pager: { total: 1 },
                                            predictors: [predictor],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        predictors: [],
                                    }
                                }
                            },
                            'predictors/expression/description': () => ({
                                status: 'OK',
                            }),
                            'predictors/skipTest/description': () => ({
                                status: 'OK',
                            }),
                            ...customTestData,
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return {
                    screen,
                    attributes,
                    dataElements,
                    categoryOptionCombos,
                    organisationUnitLevels,
                    periodTypes,
                    predictor,
                }
            }
        )

        it('contains all needed fields prefilled', async () => {
            const {
                screen,
                dataElements,
                categoryOptionCombos,
                organisationUnitLevels,
                periodTypes,
                predictor,
            } = await renderForm()

            const missingValueStrategyLabels: Record<string, string> = {
                NEVER_SKIP: 'Never skip',
                SKIP_IF_ANY_VALUE_MISSING: 'Skip if any value is missing',
                SKIP_IF_ALL_VALUES_MISSING: 'Skip if all values are missing',
            }

            // Basic information fields
            uiAssertions.expectNameFieldExist(predictor.name, screen)
            uiAssertions.expectInputFieldToExist(
                'shortName',
                predictor.shortName,
                screen
            )
            uiAssertions.expectCodeFieldExist(predictor.code, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                predictor.description,
                screen
            )

            // Predictor logic fields
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('dhis2-uiwidgets-singleselectfield'),
                {
                    selected: getConstantTranslation(
                        predictor.organisationUnitDescendants
                    ),
                    options: [
                        { displayName: 'At selected level(s) only' },
                        {
                            displayName:
                                'At selected level(s) and all levels below',
                        },
                    ],
                },
                screen
            )
            await uiAssertions.expectInputFieldToExist(
                'sequentialSampleCount',
                predictor.sequentialSampleCount.toString(),
                screen,
                'spinbutton'
            )
            await uiAssertions.expectInputFieldToExist(
                'annualSampleCount',
                predictor.annualSampleCount.toString(),
                screen,
                'spinbutton'
            )
            await uiAssertions.expectInputFieldToExist(
                'sequentialSkipCount',
                predictor.sequentialSkipCount?.toString() ?? '',
                screen,
                'spinbutton'
            )

            uiAssertions.expectTextAreaFieldToExist(
                'generator.expression',
                predictor.generator.expression,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'generator.description',
                predictor.generator.description,
                screen
            )
            expect(
                screen.getByTestId(
                    'edit-generator.expression-expression-button'
                )
            ).toBeVisible()
            uiAssertions.expectRadioFieldToExist(
                'missingValueStategy-generator',
                Object.entries(missingValueStrategyLabels).map(
                    ([strategy, label]) => ({
                        label,
                        checked:
                            predictor.generator.missingValueStrategy ===
                            strategy,
                    })
                ),
                screen
            )

            uiAssertions.expectTextAreaFieldToExist(
                'sampleSkipTest.expression',
                predictor.sampleSkipTest?.expression,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'sampleSkipTest.description',
                predictor.sampleSkipTest?.description,
                screen
            )
            expect(
                screen.getByTestId(
                    'edit-sampleSkipTest.expression-expression-button'
                )
            ).toBeVisible()

            // Output fields
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-output'),
                {
                    selected: predictor.output.displayName,
                    options: dataElements,
                },
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-outputCombo'),
                {
                    selected: predictor.outputCombo.displayName,
                    options: [
                        {
                            displayName:
                                'Predict using input category option combination',
                        },
                        ...categoryOptionCombos,
                    ],
                },
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-periodtype'),
                {
                    selected: predictor.periodType,
                    options: periodTypes.map((pt: string) => ({
                        displayName: pt,
                    })),
                },
                screen
            )
            await uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-organisationunitlevels'),
                {
                    selected: organisationUnitLevels,
                    options: organisationUnitLevels,
                },
                screen
            )
        })

        it('hides the output combo field if output de has default category combo', async () => {
            const { screen, dataElements, predictor } = await renderForm({
                useDefaultCCOutputDE: true,
            })
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-output'),
                {
                    selected: predictor.output.displayName,
                    options: dataElements,
                },
                screen
            )
            await waitFor(() => {
                expect(
                    screen.queryByTestId('formfields-outputCombo')
                ).not.toBeInTheDocument()
            })
        })

        it('should submit the data successfully when a field is changed', async () => {
            const { screen, predictor } = await renderForm()
            const newName = faker.internet.userName()

            await uiActions.enterName(newName, screen)

            await uiActions.submitForm(screen)

            expect(updateMock).toHaveBeenCalledWith({
                data: [
                    {
                        op: 'replace',
                        path: '/name',
                        value: newName,
                    },
                ],
                id: predictor.id,
                params: undefined,
                resource: 'predictors',
            })
        })

        it('should do nothing when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
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
    })
})
