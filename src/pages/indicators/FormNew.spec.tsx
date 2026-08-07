import { faker } from '@faker-js/faker'
import { render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/indicators.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    testCustomAttribute,
    testIndicator,
    testIndicatorGroup,
    testIndicatorType,
    testLegendSet,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

jest.setTimeout(40 * 1000) // set timeout to 40 seconds for these tests

const section = SECTIONS_MAP.indicator
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))
// Swaps in the fast test double from ModelTransfer/__mocks__ for the
// legend sets / indicator groups transfer fields - the real @dhis2/ui
// Transfer it replaces is covered directly by BaseModelTransfer.spec.tsx.
jest.mock(
    '../../components/metadataFormControls/ModelTransfer/BaseModelTransfer'
)

describe('Indicators form tests - New', () => {
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
        (
            routeOptions,
            {
                customTestData = {},
                matchingExistingElementFilter = undefined,
            } = {}
        ) => {
            const attributes = [testCustomAttribute({ mandatory: false })]
            const indicatorTypes = [
                testIndicatorType(),
                testIndicatorType(),
                testIndicatorType(),
            ]
            const legendSets = [testLegendSet(), testLegendSet()]
            const indicatorGroups = [testIndicatorGroup(), testIndicatorGroup()]
            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        attributes: () => ({ attributes }),
                        indicatorTypes: () => ({ indicatorTypes }),
                        legendSets: () => ({
                            legendSets,
                            pager: {
                                page: 1,
                                total: 2,
                                pageSize: 20,
                                pageCount: 1,
                            },
                        }),
                        indicatorGroups: () => ({
                            pager: {},
                            indicatorGroups,
                        }),
                        indicators: (type: any, params: any) => {
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
                                        indicators: [testIndicator()],
                                    }
                                }
                                return {
                                    pager: { total: 0 },
                                    indicators: [],
                                }
                            }
                        },
                        'indicators/expression/description': () => ({
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
                indicatorTypes,
                legendSets,
                indicatorGroups,
            }
        }
    )

    it('contain all needed field', async () => {
        const {
            screen,
            indicatorTypes,
            legendSets,
            indicatorGroups,
            attributes,
        } = await renderForm()

        // Basic Information Fields
        uiAssertions.expectNameFieldExist('', screen)
        uiAssertions.expectInputFieldToExist('shortName', '', screen)
        uiAssertions.expectCodeFieldExist('', screen)
        uiAssertions.expectColorAndIconFieldToExist(screen)
        uiAssertions.expectTextAreaFieldToExist('description', null, screen)
        uiAssertions.expectInputFieldToExist('url', '', screen)

        // Configuration Fields
        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('formfields-indicatortype'),
            { options: indicatorTypes },
            screen
        )

        const expectedDecimalsOptions = [
            { displayName: '<No value>' },
            { displayName: '0' },
            { displayName: '1' },
            { displayName: '2' },
            { displayName: '3' },
            { displayName: '4' },
            { displayName: '5' },
        ]
        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('decimals-field'),
            { options: expectedDecimalsOptions },
            screen
        )

        uiAssertions.expectCheckboxFieldToExist('annualized', false, screen)

        uiAssertions.expectTextAreaFieldToExist('numerator', null, screen)
        uiAssertions.expectTextAreaFieldToExist('denominator', null, screen)
        uiAssertions.expectTextAreaFieldToExist(
            'numeratorDescription',
            null,
            screen
        )
        uiAssertions.expectTextAreaFieldToExist(
            'denominatorDescription',
            null,
            screen
        )

        uiAssertions.expectInputFieldToExist(
            'aggregateExportCategoryOptionCombo',
            '',
            screen
        )
        uiAssertions.expectInputFieldToExist(
            'aggregateExportAttributeOptionCombo',
            '',
            screen
        )

        await uiAssertions.expectTransferFieldToExistWithOptions(
            'legendSets-field',
            { lhs: legendSets, rhs: [] },
            screen
        )

        await uiAssertions.expectTransferFieldToExistWithOptions(
            'formfields-indicatorGroups',
            { lhs: indicatorGroups, rhs: [] },
            screen
        )

        attributes.forEach((attribute: { id: string }) => {
            expect(
                screen.getByTestId(`attribute-${attribute.id}`)
            ).toBeVisible()
        })
    })

    it('should not show an "Add new" button for indicator groups', async () => {
        const { screen } = await renderForm()

        uiAssertions.expectTransferFieldToHideAddNewButton(
            'formfields-indicatorGroups',
            screen
        )
    })

    it('should have a cancel button with a link back to the list view', async () => {
        const { screen } = await renderForm()
        const cancelButton = screen.getByTestId('form-cancel-link')
        expect(cancelButton).toBeVisible()
        expect(cancelButton).toHaveAttribute('href', `/${section.namePlural}`)
    })
    it('should submit the basic information and expressions', async () => {
        const aName = faker.internet.userName()
        const aShortName = faker.internet.userName()
        const aCode = faker.science.chemicalElement().symbol
        const aDescription = faker.company.buzzPhrase()
        const aUrl = faker.internet.url()
        const aNumerator = faker.number.int().toString()
        const aDenominator = faker.number.int().toString()
        const aNumeratorDescription = faker.lorem.sentence()
        const aDenominatorDescription = faker.lorem.sentence()

        const { screen, indicatorTypes } = await renderForm()

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
        await uiActions.enterCode(aCode, screen, { paste: true })
        await uiActions.enterInputFieldValue(
            'description',
            aDescription,
            screen,
            { paste: true }
        )
        await uiActions.enterInputFieldValue('url', aUrl, screen, {
            paste: true,
        })

        await uiActions.pickOptionFromSelect(
            screen.getByTestId('formfields-indicatortype'),
            0,
            screen
        )
        await uiActions.applyNewExpressionWithinModal(
            'numerator',
            aNumerator,
            screen
        )
        await uiActions.applyNewExpressionWithinModal(
            'denominator',
            aDenominator,
            screen
        )

        await uiActions.enterInputFieldValue(
            'numeratorDescription',
            aNumeratorDescription,
            screen,
            { paste: true }
        )
        await uiActions.enterInputFieldValue(
            'denominatorDescription',
            aDenominatorDescription,
            screen,
            { paste: true }
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
                    url: aUrl,
                    indicatorType: expect.objectContaining({
                        id: indicatorTypes[0].id,
                    }),
                    decimals: undefined,
                    annualized: false,
                    numerator: aNumerator,
                    denominator: aDenominator,
                    numeratorDescription: aNumeratorDescription,
                    denominatorDescription: aDenominatorDescription,
                    aggregateExportCategoryOptionCombo: undefined,
                    aggregateExportAttributeOptionCombo: undefined,
                    legendSets: [],
                    attributeValues: [],
                }),
            })
        )
    })
    it('should submit the options fields and expressions fields', async () => {
        const aName = faker.internet.userName()
        const aShortName = faker.internet.userName()
        const aNumerator = faker.number.int().toString()
        const aDenominator = faker.number.int().toString()
        const aNumeratorDescription = faker.lorem.sentence()
        const aDenominatorDescription = faker.lorem.sentence()
        const aCatOptionExport = faker.internet.userName()
        const anAttOptionExport = faker.internet.userName()

        const { screen, indicatorTypes } = await renderForm()

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })

        await uiActions.pickOptionFromSelect(
            screen.getByTestId('formfields-indicatortype'),
            0,
            screen
        )
        await uiActions.applyNewExpressionWithinModal(
            'numerator',
            aNumerator,
            screen
        )
        await uiActions.applyNewExpressionWithinModal(
            'denominator',
            aDenominator,
            screen
        )

        await uiActions.enterInputFieldValue(
            'numeratorDescription',
            aNumeratorDescription,
            screen,
            { paste: true }
        )
        await uiActions.enterInputFieldValue(
            'denominatorDescription',
            aDenominatorDescription,
            screen,
            { paste: true }
        )

        await uiActions.clickOnCheckboxField('annualized', screen)
        await uiActions.pickOptionFromSelect(
            screen.getByTestId('decimals-field'),
            2,
            screen
        )
        await uiActions.enterInputFieldValue(
            'aggregateExportCategoryOptionCombo',
            aCatOptionExport,
            screen,
            { paste: true }
        )
        await uiActions.enterInputFieldValue(
            'aggregateExportAttributeOptionCombo',
            anAttOptionExport,
            screen,
            { paste: true }
        )

        await uiActions.submitForm(screen)
        expect(createMock).toHaveBeenCalledTimes(1)
        expect(createMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    id: undefined,
                    name: aName,
                    shortName: aShortName,
                    code: undefined,
                    description: undefined,
                    url: undefined,
                    indicatorType: expect.objectContaining({
                        id: indicatorTypes[0].id,
                    }),
                    decimals: 1,
                    annualized: true,
                    numerator: aNumerator,
                    denominator: aDenominator,
                    numeratorDescription: aNumeratorDescription,
                    denominatorDescription: aDenominatorDescription,
                    aggregateExportCategoryOptionCombo: aCatOptionExport,
                    aggregateExportAttributeOptionCombo: anAttOptionExport,
                    legendSets: [],
                    attributeValues: [],
                }),
            })
        )
    })
    it('should submit the legends fields and expressions fields', async () => {
        const aName = faker.internet.userName()
        const aShortName = faker.internet.userName()
        const aNumerator = faker.number.int().toString()
        const aDenominator = faker.number.int().toString()
        const aNumeratorDescription = faker.lorem.sentence()
        const aDenominatorDescription = faker.lorem.sentence()

        const { screen, indicatorTypes, legendSets } = await renderForm()

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })

        await uiActions.pickOptionFromSelect(
            screen.getByTestId('formfields-indicatortype'),
            0,
            screen
        )
        await uiActions.applyNewExpressionWithinModal(
            'numerator',
            aNumerator,
            screen
        )
        await uiActions.applyNewExpressionWithinModal(
            'denominator',
            aDenominator,
            screen
        )

        await uiActions.enterInputFieldValue(
            'numeratorDescription',
            aNumeratorDescription,
            screen,
            { paste: true }
        )
        await uiActions.enterInputFieldValue(
            'denominatorDescription',
            aDenominatorDescription,
            screen,
            { paste: true }
        )

        await uiActions.pickOptionInTransfer(
            'legendSets-field',
            legendSets[0].displayName,
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
                    code: undefined,
                    description: undefined,
                    url: undefined,
                    indicatorType: expect.objectContaining({
                        id: indicatorTypes[0].id,
                    }),
                    decimals: undefined,
                    annualized: false,
                    numerator: aNumerator,
                    denominator: aDenominator,
                    numeratorDescription: aNumeratorDescription,
                    denominatorDescription: aDenominatorDescription,
                    aggregateExportCategoryOptionCombo: undefined,
                    aggregateExportAttributeOptionCombo: undefined,
                    legendSets: [
                        expect.objectContaining({ id: legendSets[0].id }),
                    ],
                    attributeValues: [],
                }),
            })
        )
    })
    it('should submit the attributes fields and expressions fields', async () => {
        const aName = faker.internet.userName()
        const aShortName = faker.internet.userName()
        const aNumerator = faker.number.int().toString()
        const aDenominator = faker.number.int().toString()
        const aNumeratorDescription = faker.lorem.sentence()
        const aDenominatorDescription = faker.lorem.sentence()
        const anAttribute = faker.internet.userName()

        const { screen, indicatorTypes, attributes } = await renderForm()

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })

        await uiActions.pickOptionFromSelect(
            screen.getByTestId('formfields-indicatortype'),
            0,
            screen
        )

        await uiActions.applyNewExpressionWithinModal(
            'numerator',
            aNumerator,
            screen
        )
        await uiActions.applyNewExpressionWithinModal(
            'denominator',
            aDenominator,
            screen
        )

        await uiActions.enterInputFieldValue(
            'numeratorDescription',
            aNumeratorDescription,
            screen,
            { paste: true }
        )
        await uiActions.enterInputFieldValue(
            'denominatorDescription',
            aDenominatorDescription,
            screen,
            { paste: true }
        )

        const attributeInput = within(
            screen.getByTestId(`attribute-${attributes[0].id}`)
        ).getByRole('textbox') as HTMLInputElement
        await userEvent.type(attributeInput, anAttribute)

        await uiActions.submitForm(screen)
        expect(createMock).toHaveBeenCalledTimes(1)
        expect(createMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    id: undefined,
                    name: aName,
                    shortName: aShortName,
                    code: undefined,
                    description: undefined,
                    url: undefined,
                    indicatorType: expect.objectContaining({
                        id: indicatorTypes[0].id,
                    }),
                    decimals: undefined,
                    annualized: false,
                    numerator: aNumerator,
                    denominator: aDenominator,
                    numeratorDescription: aNumeratorDescription,
                    denominatorDescription: aDenominatorDescription,
                    aggregateExportCategoryOptionCombo: undefined,
                    aggregateExportAttributeOptionCombo: undefined,
                    legendSets: [],
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
})
