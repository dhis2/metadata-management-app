import { faker } from '@faker-js/faker'
import { render, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/dataElements.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { DISABLING_VALUE_TYPES } from '../../components/form/fields/AggregationTypeFieldByValueType'
import {
    DEFAULT_CATEGORY_COMBO,
    DEFAULT_CATEGORYCOMBO_SELECT_OPTION,
    getConstantTranslation,
    SECTIONS_MAP,
    VALUE_TYPE,
} from '../../lib'
import {
    randomLongString,
    randomValueIn,
    testCategoryCombo,
    testCustomAttribute,
    testDataElement,
    testLegendSet,
    testOptionSet,
    testOrgUnitLevel,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { DisplayableModel } from '../../types/models'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.dataElement
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Data elements form tests', () => {
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
                const categoryCombos = [
                    testCategoryCombo(),
                    testCategoryCombo(),
                    testCategoryCombo(),
                ]
                const optionSets = [testOptionSet(), testOptionSet()]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            optionSets: () => ({ pager: {}, optionSets }),
                            categoryCombos: () => ({
                                pager: {},
                                categoryCombos,
                            }),
                            dataElements: (type: any, params: any) => {
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
                                            dataElements: [testDataElement()],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        dataElements: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, attributes, categoryCombos, optionSets }
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
        })
        it('should show an error if name field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(231)
            await uiActions.enterName(longText, screen)
            await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
            await uiActions.submitForm(screen)
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
        it('should show an error if form name field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(247)
            await uiActions.enterInputFieldValue('formName', longText, screen)
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'formName',
                230,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })
        it('should show an error if url field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(312)
            await uiActions.enterInputFieldValue('url', longText, screen)
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'url',
                255,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })
        it('should show an error if field mask field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(312)
            await uiActions.enterInputFieldValue('fieldMask', longText, screen)
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'fieldMask',
                255,
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
        it('should change cat combo to default and disable cat combo field if domain is tracker', async () => {
            const { screen } = await renderForm()
            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-categorycombo'),
                2,
                screen
            )
            await uiActions.pickRadioField('domainType', 'Tracker', screen)
            const catComboSelectInput = within(
                screen.getByTestId('formfields-categorycombo')
            ).getByTestId('dhis2-uicore-select-input')
            expect(catComboSelectInput).toBeVisible()
            expect(catComboSelectInput).toHaveTextContent('None')
            expect(catComboSelectInput).toHaveClass('disabled')

            await uiActions.submitForm(screen)
            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        categoryCombo: expect.objectContaining({
                            id: DEFAULT_CATEGORYCOMBO_SELECT_OPTION.id,
                        }),
                    }),
                })
            )
        })
        it('should change aggregation type to NONE and disable if value type is of certain type', async () => {
            const { screen } = await renderForm()
            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()
            const aValueType = randomValueIn([...DISABLING_VALUE_TYPES])

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.pickRadioField('domainType', 'Aggregate', screen)
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-categorycombo'),
                2,
                screen
            )
            const valueTypeOptions = await uiActions.openSingleSelect(
                screen.getByTestId('formfields-valueType'),
                screen
            )
            const valueTypeOption = valueTypeOptions.find((opt) =>
                opt.textContent?.includes(getConstantTranslation(aValueType))
            )!
            await userEvent.click(valueTypeOption)
            await uiActions.closeSingleSelectIfOpen(
                screen.getByTestId('formfields-valueType'),
                screen
            )

            const aggregationTypeSelectInput = within(
                screen.getByTestId('formfields-aggregationType')
            ).getByTestId('dhis2-uicore-select-input')
            expect(aggregationTypeSelectInput).toBeVisible()
            expect(aggregationTypeSelectInput).toHaveTextContent('None')
            expect(aggregationTypeSelectInput).toHaveClass('disabled')

            await uiActions.submitForm(screen)
            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        aggregationType: 'NONE',
                    }),
                })
            )
        })
        it('should not have multi text as a value type by default', async () => {
            const { screen } = await renderForm()
            const valueTypeOptions = await uiActions.openSingleSelect(
                screen.getByTestId('formfields-valueType'),
                screen
            )
            const multiTextOptions = valueTypeOptions.filter((opt) =>
                opt.textContent?.includes(VALUE_TYPE.MULTI_TEXT)
            )
            expect(multiTextOptions).toHaveLength(0)
        })
        it('should change the value type accordingly when an option set is selected', async () => {
            const { screen, optionSets } = await renderForm()

            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()
            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.pickRadioField('domainType', 'Aggregate', screen)

            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-valueType'),
                5,
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-optionset'),
                1,
                screen
            )

            const valueType = within(
                screen.getByTestId('formfields-valueType')
            ).getByTestId('dhis2-uicore-select-input')
            expect(valueType).toBeVisible()
            expect(valueType).toHaveTextContent(
                getConstantTranslation(optionSets[0].valueType)
            )

            await uiActions.submitForm(screen)
            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        valueType: optionSets[0].valueType,
                        optionSet: expect.objectContaining({
                            id: optionSets[0].id,
                        }),
                    }),
                })
            )
        })
    })
    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const categoryCombos = [
                    testCategoryCombo(),
                    testCategoryCombo(),
                    testCategoryCombo(),
                ]
                const optionSets = [testOptionSet(), testOptionSet()]
                const legendSets = [
                    testLegendSet(),
                    testLegendSet(),
                    testLegendSet(),
                ]
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
                            categoryCombos: () => ({
                                pager: {},
                                categoryCombos,
                            }),
                            optionSets: () => ({ pager: {}, optionSets }),
                            legendSets: () => ({ pager: {}, legendSets }),
                            organisationUnitLevels: () => ({
                                pager: {},
                                organisationUnitLevels,
                            }),
                            dataElements: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    return {
                                        pager: { total: 0 },
                                        dataElements: [],
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
                    categoryCombos,
                    optionSets,
                    legendSets,
                    organisationUnitLevels,
                }
            }
        )
        it('contain all needed field', async () => {
            const {
                screen,
                categoryCombos,
                optionSets,
                legendSets,
                organisationUnitLevels,
                attributes,
            } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('shortName', '', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectInputFieldToExist('formName', '', screen)
            uiAssertions.expectTextAreaFieldToExist('description', '', screen)
            uiAssertions.expectInputFieldToExist('url', '', screen)
            uiAssertions.expectInputFieldToExist('fieldMask', '', screen)
            uiAssertions.expectCheckboxFieldToExist(
                'zeroIsSignificant',
                false,
                screen
            )
            uiAssertions.expectRadioFieldToExist(
                'domainType',
                [
                    { label: 'Aggregate', checked: false },
                    {
                        label: 'Tracker',
                        checked: false,
                    },
                ],
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-valueType'),
                {
                    selected: 'Number',
                    options: mockSchema.properties.valueType.constants
                        .filter((o) => o !== 'MULTI_TEXT')
                        .map((o) => ({
                            displayName: getConstantTranslation(o),
                        })),
                },
                screen
            )

            const aggregationType = within(
                screen.getByTestId('formfields-aggregationType')
            ).getByTestId('dhis2-uicore-select-input')
            expect(aggregationType).toBeVisible()
            expect(aggregationType).toHaveTextContent('None')

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-categorycombo'),
                {
                    selected: 'None',
                    options: [
                        { displayName: 'None' },
                        ...categoryCombos.map((cc: DisplayableModel) => ({
                            displayName: cc.displayName,
                        })),
                    ],
                },
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionset'),
                {
                    options: [
                        { displayName: '<No value>' },
                        ...optionSets.map((cc: DisplayableModel) => ({
                            displayName: cc.displayName,
                        })),
                    ],
                },
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-commentoptionset'),
                {
                    options: [
                        { displayName: '<No value>' },
                        ...optionSets.map((cc: DisplayableModel) => ({
                            displayName: cc.displayName,
                        })),
                    ],
                },
                screen
            )
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'legendset-transfer',
                { lhs: legendSets, rhs: [] },
                screen
            )

            await uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-aggregationlevels'),
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
        it('should have a cancel button with a link back to the list view', async () => {
            const { screen } = await renderForm()
            const cancelButton = screen.getByTestId('form-cancel-link')
            expect(cancelButton).toBeVisible()
            expect(cancelButton).toHaveAttribute(
                'href',
                `/${section.namePlural}`
            )
        })
        it('should submit the basic information', async () => {
            const { screen } = await renderForm()
            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()
            const aCode = faker.science.chemicalElement().symbol
            const aFormName = faker.person.firstName()
            const aDescription = faker.company.buzzPhrase()
            const aUrl = faker.internet.url()
            const aFieldMask = faker.internet.displayName()

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.enterCode(aCode, screen)
            await uiActions.enterInputFieldValue('formName', aFormName, screen)
            await uiActions.enterInputFieldValue(
                'description',
                aDescription,
                screen
            )
            await uiActions.enterInputFieldValue('url', aUrl, screen)
            await uiActions.enterInputFieldValue(
                'fieldMask',
                aFieldMask,
                screen
            )
            await uiActions.clickOnCheckboxField('zeroIsSignificant', screen)
            await uiActions.pickRadioField('domainType', 'Aggregate', screen)
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-valueType'),
                1,
                screen
            )
            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        code: aCode,
                        formName: aFormName,
                        description: aDescription,
                        url: aUrl,
                        fieldMask: aFieldMask,
                        zeroIsSignificant: true,
                        domainType: 'AGGREGATE',
                        valueType: 'LONG_TEXT',
                        categoryCombo: expect.objectContaining({
                            id: DEFAULT_CATEGORY_COMBO.id,
                        }),
                        optionSet: undefined,
                        commentOptionSet: undefined,
                        legendSets: [],
                        aggregationLevels: [],
                        attributeValues: [],
                    }),
                })
            )
        })
        it('should submit the disaggregation and option sets', async () => {
            const { screen, categoryCombos, optionSets } = await renderForm()
            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.pickRadioField('domainType', 'Aggregate', screen)

            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-categorycombo'),
                1,
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-optionset'),
                0,
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-commentoptionset'),
                2,
                screen
            )
            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        code: undefined,
                        formName: undefined,
                        description: undefined,
                        url: undefined,
                        fieldMask: undefined,
                        zeroIsSignificant: false,
                        domainType: 'AGGREGATE',
                        valueType: 'NUMBER',
                        categoryCombo: expect.objectContaining({
                            id: categoryCombos[0].id,
                        }),
                        optionSet: undefined,
                        commentOptionSet: expect.objectContaining({
                            id: optionSets[1].id,
                        }),
                        legendSets: [],
                        aggregationLevels: [],
                        attributeValues: [],
                    }),
                })
            )
        })
        it('should submit the legend set and aggregation levels', async () => {
            const { screen, legendSets, organisationUnitLevels } =
                await renderForm()
            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.pickRadioField('domainType', 'Aggregate', screen)

            await uiActions.pickOptionInTransfer(
                'legendset-transfer',
                legendSets[1].displayName,
                screen
            )
            await uiActions.pickOptionFromMultiSelect(
                screen.getByTestId('formfields-aggregationlevels'),
                [1, 2],
                screen
            )

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        code: undefined,
                        formName: undefined,
                        description: undefined,
                        url: undefined,
                        fieldMask: undefined,
                        zeroIsSignificant: false,
                        domainType: 'AGGREGATE',
                        valueType: 'NUMBER',
                        categoryCombo: expect.objectContaining({
                            id: DEFAULT_CATEGORY_COMBO.id,
                        }),
                        optionSet: undefined,
                        commentOptionSet: undefined,
                        legendSets: [
                            expect.objectContaining({ id: legendSets[1].id }),
                        ],
                        aggregationLevels: [
                            organisationUnitLevels[1].level,
                            organisationUnitLevels[2].level,
                        ],
                        attributeValues: [],
                    }),
                })
            )
        })
        it('should submit the attributes', async () => {
            const { screen, attributes } = await renderForm()
            const aName = faker.animal.bird()
            const aShortName = faker.person.firstName()
            const anAttribute = faker.internet.userName()

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
            await uiActions.pickRadioField('domainType', 'Aggregate', screen)
            const attributeInput = within(
                screen.getByTestId(`attribute-${attributes[0].id}`)
            ).getByRole('textbox') as HTMLInputElement
            await userEvent.type(attributeInput, anAttribute)
            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        shortName: aShortName,
                        code: undefined,
                        formName: undefined,
                        description: undefined,
                        url: undefined,
                        fieldMask: undefined,
                        zeroIsSignificant: false,
                        domainType: 'AGGREGATE',
                        valueType: 'NUMBER',
                        categoryCombo: expect.objectContaining({
                            id: DEFAULT_CATEGORY_COMBO.id,
                        }),
                        optionSet: undefined,
                        commentOptionSet: undefined,
                        legendSets: [],
                        aggregationLevels: [],
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
        it('should let user select value type without showing warning modal', async () => {
            const { screen } = await renderForm()

            const warningText = 'Change value type?'

            expect(screen.queryByText(warningText)).toBeNull()

            // value type is text by default
            const valueType = within(
                screen.getByTestId('formfields-valueType')
            ).getByTestId('dhis2-uicore-select-input')
            expect(valueType).toBeVisible()
            expect(valueType).toHaveTextContent(VALUE_TYPE.NUMBER)

            // Click a new value type
            const aValueType = 'COORDINATE'

            const valueTypeOptions = await uiActions.openSingleSelect(
                screen.getByTestId('formfields-valueType'),
                screen
            )
            const valueTypeOption = valueTypeOptions.find((opt) =>
                opt.textContent?.includes(getConstantTranslation(aValueType))
            )!
            await userEvent.click(valueTypeOption)

            // no warning should be shown
            expect(screen.queryByText(warningText)).toBeNull()

            // value type should be updated and warning should be removed
            expect(valueType).toHaveTextContent(
                getConstantTranslation(aValueType)
            )
        })
    })
    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions, { dataElementOverwrites } = {}) => {
                const attributes = [testCustomAttribute()]
                const categoryCombos = [
                    testCategoryCombo(),
                    testCategoryCombo(),
                    testCategoryCombo(),
                    testCategoryCombo(),
                ].filter((cc) => cc !== undefined)
                const optionSets =
                    dataElementOverwrites?.optionSets ??
                    [testOptionSet(), testOptionSet(), testOptionSet()].filter(
                        (cc) => cc !== undefined
                    )

                const legendSets = [
                    testLegendSet(),
                    testLegendSet(),
                    testLegendSet(),
                    testLegendSet(),
                ]
                const organisationUnitLevels = [
                    testOrgUnitLevel({ level: 1 }),
                    testOrgUnitLevel({ level: 2 }),
                    testOrgUnitLevel({ level: 3 }),
                ]
                const dataElement = testDataElement({
                    zeroIsSignificant: true,
                    aggregationLevels: [],
                    domainType: 'AGGREGATE',
                    commentOptionSet: optionSets[0],
                    optionSet: optionSets[2],
                    valueType: optionSets[2].valueType,
                    legendSets: [legendSets[3]],
                    categoryCombo: categoryCombos[3],
                    attributeValues: [
                        { attribute: attributes[0], value: 'attribute' },
                    ],
                    ...dataElementOverwrites,
                })

                const id = dataElement.id

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            categoryCombos: () => ({
                                pager: {},
                                categoryCombos,
                            }),
                            optionSets: () => ({ pager: {}, optionSets }),
                            legendSets: () => ({ pager: {}, legendSets }),
                            organisationUnitLevels: () => ({
                                organisationUnitLevels,
                            }),
                            dataElements: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return dataElement
                                    }
                                    return {
                                        pager: { total: 0 },
                                        dataElements: [],
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
                    categoryCombos,
                    optionSets,
                    legendSets,
                    organisationUnitLevels,
                    dataElement,
                }
            }
        )
        it('contains the basic information field prefilled', async () => {
            const { screen, dataElement } = await renderForm()

            uiAssertions.expectNameFieldExist(dataElement.name, screen)
            uiAssertions.expectInputFieldToExist(
                'shortName',
                dataElement.shortName,
                screen
            )
            uiAssertions.expectCodeFieldExist(dataElement.code, screen)
            uiAssertions.expectInputFieldToExist(
                'formName',
                dataElement.formName,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                dataElement.description,
                screen
            )
            uiAssertions.expectInputFieldToExist('url', dataElement.url, screen)
            uiAssertions.expectInputFieldToExist(
                'fieldMask',
                dataElement.fieldMask,
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'zeroIsSignificant',
                true,
                screen
            )
            uiAssertions.expectRadioFieldToExist(
                'domainType',
                [
                    { label: 'Aggregate', checked: true },
                    {
                        label: 'Tracker',
                        checked: false,
                    },
                ],
                screen
            )
            const valueTypeInput = within(
                screen.getByTestId('formfields-valueType')
            ).getByTestId('dhis2-uicore-select-input')
            expect(valueTypeInput).toBeVisible()
            expect(valueTypeInput).toHaveTextContent(
                getConstantTranslation(dataElement.valueType)
            )

            const aggregationType = within(
                screen.getByTestId('formfields-aggregationType')
            ).getByTestId('dhis2-uicore-select-input')
            expect(aggregationType).toBeVisible()
            if (
                DISABLING_VALUE_TYPES.includes(
                    dataElement.valueType as (typeof DISABLING_VALUE_TYPES)[number]
                )
            ) {
                expect(aggregationType).toHaveTextContent('None')
            } else {
                expect(aggregationType).toHaveTextContent(
                    getConstantTranslation(dataElement.aggregationType)
                )
            }
        })
        it('contains the disaggregation and option sets field prefilled', async () => {
            const { screen, dataElement, categoryCombos, optionSets } =
                await renderForm()

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-categorycombo'),
                {
                    selected: dataElement.categoryCombo.displayName,
                    options: [
                        { displayName: 'None' },
                        ...categoryCombos.map((cc: DisplayableModel) => ({
                            displayName: cc.displayName,
                        })),
                    ],
                },
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionset'),
                {
                    selected: dataElement.optionSet!.displayName,
                    options: [
                        { displayName: '<No value>' },
                        ...optionSets.map((cc: DisplayableModel) => ({
                            displayName: cc.displayName,
                        })),
                    ],
                },
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-commentoptionset'),
                {
                    selected: dataElement.commentOptionSet!.displayName,
                    options: [
                        { displayName: '<No value>' },
                        ...optionSets.map((cc: DisplayableModel) => ({
                            displayName: cc.displayName,
                        })),
                    ],
                },
                screen
            )
        })
        it('contains the legend set field prefilled', async () => {
            const { screen, legendSets } = await renderForm()

            await uiAssertions.expectTransferFieldToExistWithOptions(
                'legendset-transfer',
                {
                    lhs: [legendSets[0], legendSets[1], legendSets[2]],
                    rhs: [legendSets[3]],
                },
                screen
            )
        })
        it('contains attributes prefilled', async () => {
            const { screen, dataElement, attributes } = await renderForm()

            attributes.forEach((attribute: { id: string }) => {
                const attributeInput = screen.getByTestId(
                    `attribute-${attribute.id}`
                )
                expect(attributeInput).toBeVisible()
                expect(
                    within(
                        within(attributeInput).getByTestId('dhis2-uicore-input')
                    ).getByRole('textbox')
                ).toHaveValue(dataElement.attributeValues[0].value)
            })
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
            const { screen } = await renderForm({
                dataElementOverwrites: {
                    valueType: 'TEXT',
                    aggregationType: 'NONE',
                    optionSet: null,
                },
            })
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
        it('should have multi text as a value type if data element has option set with that value type', async () => {
            const { screen } = await renderForm({
                dataElementOverwrites: {
                    valueType: 'MULTI_TEXT',
                    optionSet: { ...testOptionSet(), valueType: 'MULTI_TEXT' },
                },
            })

            const valueType = within(
                screen.getByTestId('formfields-valueType')
            ).getByTestId('dhis2-uicore-select-input')
            expect(valueType).toBeVisible()
            expect(valueType).toHaveTextContent(VALUE_TYPE.MULTI_TEXT)
        })
        it('should require clicking through warning modal to change value type', async () => {
            const { screen } = await renderForm({
                dataElementOverwrites: {
                    valueType: 'NUMBER',
                    optionSet: null,
                },
            })
            const warningText = 'Change value type?'

            expect(screen.queryByText(warningText)).toBeNull()

            const valueType = within(
                screen.getByTestId('formfields-valueType')
            ).getByTestId('dhis2-uicore-select-input')
            expect(valueType).toBeVisible()
            expect(valueType).toHaveTextContent(VALUE_TYPE.NUMBER)

            // Click a new value type
            const aValueType = 'COORDINATE'
            // const aValueType =
            //     DISABLING_VALUE_TYPES[
            //         Math.floor(Math.random() * DISABLING_VALUE_TYPES.length)
            //     ]

            const valueTypeOptions = await uiActions.openSingleSelect(
                screen.getByTestId('formfields-valueType'),
                screen
            )
            const valueTypeOption = valueTypeOptions.find((opt) =>
                opt.textContent?.includes(getConstantTranslation(aValueType))
            )!
            await userEvent.click(valueTypeOption)

            expect(screen.getByText(warningText)).toBeInTheDocument()

            // click confirm
            await userEvent.click(
                screen.getByTestId('confirmationModal-confirm')
            )

            // value type should be updated and warning should be removed
            expect(valueType).toHaveTextContent(
                getConstantTranslation(aValueType)
            )
            expect(screen.queryByText(warningText)).toBeNull()
        })
        it('should revert to original value type if warning modal is cancelled', async () => {
            const { screen } = await renderForm({
                dataElementOverwrites: {
                    valueType: 'NUMBER',
                    optionSet: null,
                },
            })
            const warningText = 'Change value type?'

            expect(screen.queryByText(warningText)).toBeNull()

            const valueType = within(
                screen.getByTestId('formfields-valueType')
            ).getByTestId('dhis2-uicore-select-input')
            expect(valueType).toBeVisible()
            expect(valueType).toHaveTextContent(VALUE_TYPE.NUMBER)

            // Click a new value type
            const aValueType = 'COORDINATE'
            // const aValueType =
            //     DISABLING_VALUE_TYPES[
            //         Math.floor(Math.random() * DISABLING_VALUE_TYPES.length)
            //     ]

            const valueTypeOptions = await uiActions.openSingleSelect(
                screen.getByTestId('formfields-valueType'),
                screen
            )
            const valueTypeOption = valueTypeOptions.find((opt) =>
                opt.textContent?.includes(getConstantTranslation(aValueType))
            )!
            await userEvent.click(valueTypeOption)

            await waitFor(() => {
                expect(screen.getByText(warningText)).toBeInTheDocument()
            })

            // click confirm
            await userEvent.click(
                screen.getByTestId('confirmationModal-cancel')
            )

            // value type should NOT be updated and warning should be removed
            expect(valueType).toHaveTextContent(VALUE_TYPE.NUMBER)
            expect(screen.queryByText(warningText)).toBeNull()
        })
        it.skip('should require clicking through warning modal to change option set if that changes value type', async () => {
            const optionSets = [
                testOptionSet(),
                testOptionSet(),
                testOptionSet(),
            ]

            // ensure that the value types for options are different
            if (optionSets[0].valueType === optionSets[2].valueType) {
                optionSets[2].valueType = 'NUMBER'
                optionSets[0].valueType = 'COORDINATE'
            }
            const { screen } = await renderForm({
                dataElementOverwrites: {
                    optionSets,
                },
            })
            const warningText =
                'Updating the option set will change the value type which may cause problems when generating analytics tables if there is existing data for this data element.'

            expect(screen.queryByText(warningText)).toBeNull()

            // Click a new option set (first from list, as None is in index 0)
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-optionset'),
                1,
                screen
            )

            expect(screen.getByText(warningText)).toBeInTheDocument()

            // click confirm
            await userEvent.click(
                screen.getByTestId('confirmationModal-confirm')
            )

            // option set should be updated and warning should be removed
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionset'),
                {
                    selected: optionSets[0].displayName,
                    options: [
                        { displayName: '<No value>' },
                        ...optionSets.map((cc: DisplayableModel) => ({
                            displayName: cc.displayName,
                        })),
                    ],
                },
                screen
            )
            expect(screen.queryByText(warningText)).toBeNull()
        })
        it('should not change option set without confirmation if it does not change value type', async () => {
            const optionSets = [
                testOptionSet(),
                testOptionSet(),
                testOptionSet(),
            ]

            // ensure that the value types for options are different
            if (optionSets[0].valueType === optionSets[2].valueType) {
                optionSets[2].valueType = 'NUMBER'
                optionSets[0].valueType = 'COORDINATE'
            }
            const { screen } = await renderForm({
                dataElementOverwrites: {
                    optionSets,
                },
            })
            const warningText = 'Change option set and value type?'

            expect(screen.queryByText(warningText)).toBeNull()

            // Click a new option set (first from list, as None is in index 0)
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-optionset'),
                1,
                screen
            )

            expect(screen.getByText(warningText)).toBeInTheDocument()

            // click confirm
            await userEvent.click(
                screen.getByTestId('confirmationModal-cancel')
            )

            // option set should be updated and warning should be removed
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-optionset'),
                {
                    selected: optionSets[2].displayName,
                    options: [
                        { displayName: '<No value>' },
                        ...optionSets.map((cc: DisplayableModel) => ({
                            displayName: cc.displayName,
                        })),
                    ],
                },
                screen
            )
            expect(screen.queryByText(warningText)).toBeNull()
        })
    })
})
