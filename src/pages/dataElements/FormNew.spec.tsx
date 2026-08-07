import { faker } from '@faker-js/faker'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/dataElements.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import {
    DEFAULT_CATEGORY_COMBO,
    getConstantTranslation,
    SECTIONS_MAP,
    VALUE_TYPE,
} from '../../lib'
import {
    testCategoryCombo,
    testCustomAttribute,
    testDataElementGroup,
    testLegendSet,
    testOptionSet,
    testOrgUnitLevel,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { DisplayableModel } from '../../types/models'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))
jest.mock(
    '../../components/metadataFormControls/ModelTransfer/BaseModelTransfer'
)

const section = SECTIONS_MAP.dataElement
const mockSchema = schemaMock

describe('Data elements form tests - New', () => {
    const createMock = jest.fn()

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
            const dataElementGroups = [
                testDataElementGroup(),
                testDataElementGroup(),
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
                        dataElementGroups: () => ({
                            pager: {},
                            dataElementGroups,
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
                dataElementGroups,
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
            dataElementGroups,
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
        await Promise.all([
            uiAssertions.expectTransferFieldToExistWithOptions(
                'legendset-transfer',
                { lhs: legendSets, rhs: [] },
                screen
            ),
            uiAssertions.expectMultiSelectToExistWithOptions(
                screen.getByTestId('formfields-aggregationlevels'),
                {
                    selected: [],
                    options: organisationUnitLevels,
                },
                screen
            ),
            uiAssertions.expectTransferFieldToExistWithOptions(
                'formfields-dataElementGroups',
                { lhs: dataElementGroups, rhs: [] },
                screen
            ),
        ])

        attributes.forEach((attribute: { id: string }) => {
            expect(
                screen.getByTestId(`attribute-${attribute.id}`)
            ).toBeVisible()
        })
    })
    it('should not show an "Add new" button for data element groups', async () => {
        const { screen } = await renderForm()

        uiAssertions.expectTransferFieldToHideAddNewButton(
            'formfields-dataElementGroups',
            screen
        )
    })
    it('should have a cancel button with a link back to the list view', async () => {
        const { screen } = await renderForm()
        const cancelButton = screen.getByTestId('form-cancel-link')
        expect(cancelButton).toBeVisible()
        expect(cancelButton).toHaveAttribute('href', `/${section.namePlural}`)
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

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
        await uiActions.enterCode(aCode, screen, { paste: true })
        await uiActions.enterInputFieldValue('formName', aFormName, screen, {
            paste: true,
        })
        await uiActions.enterInputFieldValue(
            'description',
            aDescription,
            screen,
            { paste: true }
        )
        await uiActions.enterInputFieldValue('url', aUrl, screen, {
            paste: true,
        })
        await uiActions.enterInputFieldValue('fieldMask', aFieldMask, screen, {
            paste: true,
        })
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

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
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

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
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

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
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

        const valueType = within(
            screen.getByTestId('formfields-valueType')
        ).getByTestId('dhis2-uicore-select-input')
        expect(valueType).toBeVisible()
        expect(valueType).toHaveTextContent(VALUE_TYPE.NUMBER)

        const aValueType = 'COORDINATE'

        const valueTypeOptions = await uiActions.openSingleSelect(
            screen.getByTestId('formfields-valueType'),
            screen
        )
        const valueTypeOption = valueTypeOptions.find((opt) =>
            opt.textContent?.includes(getConstantTranslation(aValueType))
        )!
        await userEvent.click(valueTypeOption)

        expect(screen.queryByText(warningText)).toBeNull()

        expect(valueType).toHaveTextContent(getConstantTranslation(aValueType))
    })
})
