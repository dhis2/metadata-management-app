import { faker } from '@faker-js/faker'
import { render, RenderResult, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/programIndicatorsSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { getConstantTranslation, SECTIONS_MAP } from '../../lib'
import {
    testCustomAttribute,
    testLegendSet,
    testProgram,
    testProgramIndicator,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Program } from '../../types/generated'
import { PROGRAM_INDICATOR_SPECIFIC_TRANSLATIONS } from './form/ProgramIndicatorFormFields'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.programIndicator
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))
// Swaps in the fast test double from ModelTransfer/__mocks__ for the
// legend sets transfer field - the real @dhis2/ui Transfer it replaces is
// covered directly by BaseModelTransfer.spec.tsx.
jest.mock(
    '../../components/metadataFormControls/ModelTransfer/BaseModelTransfer'
)

describe('Program indicator form tests - New', () => {
    const createMock = jest.fn()

    const addPeriodBoundary = async (
        {
            target,
            customText,
            type,
            offset,
            periodType,
        }: {
            target?: number
            customText?: string
            type?: number
            offset?: number
            periodType?: number
        },
        availablePeriodTypes = 1,
        screen: RenderResult
    ) => {
        const addPeriodBoundaryButton = screen.getByTestId(
            'add-boundary-button'
        )
        expect(addPeriodBoundaryButton).toBeVisible()
        await userEvent.click(addPeriodBoundaryButton)
        const periodBoundaryModal = await screen.findByTestId(
            'analytics-period-boundary-modal'
        )
        expect(periodBoundaryModal).toBeVisible()
        if (target !== undefined) {
            const targets = await uiActions.openSingleSelect(
                within(periodBoundaryModal).getByTestId('apb-target-select'),
                screen
            )
            expect(targets).toHaveLength(4)
            await userEvent.click(targets[target])
            await uiActions.closeSingleSelectIfOpen(
                screen.getByTestId('apb-target-select'),
                screen
            )
        }
        if (customText !== undefined) {
            const customTextInput = within(
                within(periodBoundaryModal).getByTestId(
                    'apb-custom-target-text-content'
                )
            ).getByRole('textbox')
            await userEvent.type(customTextInput, customText)
        }
        if (type !== undefined) {
            const types = await uiActions.openSingleSelect(
                within(periodBoundaryModal).getByTestId('apb-type-select'),
                screen
            )
            expect(types).toHaveLength(5)
            await userEvent.click(types[type])
            await uiActions.closeSingleSelectIfOpen(
                screen.getByTestId('apb-type-select'),
                screen
            )
        }
        if (offset !== undefined) {
            const offsetInput = within(
                within(periodBoundaryModal).getByTestId('apb-offset-input')
            ).getByRole('spinbutton')
            await userEvent.type(offsetInput, offset.toString())
        }
        if (periodType !== undefined) {
            const periodTypes = await uiActions.openSingleSelect(
                within(periodBoundaryModal).getByTestId(
                    'apb-period-type-select'
                ),
                screen
            )
            expect(periodTypes).toHaveLength(availablePeriodTypes + 1)
            await userEvent.click(periodTypes[periodType])
            await uiActions.closeSingleSelectIfOpen(
                screen.getByTestId('apb-period-type-select'),
                screen
            )
        }
        await userEvent.click(
            within(periodBoundaryModal).getByTestId('save-apb-button')
        )
    }

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
            const programs = [testProgram(), testProgram(), testProgram()]
            const legendSets = [testLegendSet(), testLegendSet()]
            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        attributes: () => ({ attributes }),
                        programs: () => ({ programs }),
                        legendSets: () => ({
                            legendSets,
                            pager: {
                                page: 1,
                                total: 2,
                                pageSize: 20,
                                pageCount: 1,
                            },
                        }),
                        programIndicators: (type: any, params: any) => {
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
                                        programIndicators: [
                                            testProgramIndicator(),
                                        ],
                                    }
                                }
                                return {
                                    pager: { total: 0 },
                                    programIndicators: [],
                                }
                            }
                        },
                        'programIndicators/expression/description': () => ({
                            status: 'OK',
                        }),
                        'programIndicators/filter/description': () => ({
                            status: 'OK',
                        }),
                        ...customTestData,
                    }}
                    routeOptions={routeOptions}
                >
                    <New />
                </TestComponentWithRouter>
            )
            return { screen, attributes, programs, legendSets }
        }
    )
    it('contain all needed field', async () => {
        const { screen, programs, legendSets, attributes } = await renderForm()
        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('programs-field'),
            { options: programs },
            screen
        )
        uiAssertions.expectNameFieldExist('', screen)
        uiAssertions.expectInputFieldToExist('shortName', '', screen)
        uiAssertions.expectCodeFieldExist('', screen)
        uiAssertions.expectColorAndIconFieldToExist(screen)
        uiAssertions.expectTextAreaFieldToExist('description', null, screen)
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
        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('aggregation-type-field'),
            {
                options: mockSchema.properties.aggregationType.constants.map(
                    (o) => ({
                        displayName: getConstantTranslation(o),
                    })
                ),
            },
            screen
        )

        uiAssertions.expectRadioFieldToExist(
            'analyticsType',
            [
                {
                    label: PROGRAM_INDICATOR_SPECIFIC_TRANSLATIONS.EVENT,
                    checked: false,
                },
                {
                    label: PROGRAM_INDICATOR_SPECIFIC_TRANSLATIONS.ENROLLMENT,
                    checked: false,
                },
            ],
            screen
        )

        uiAssertions.expectCheckboxFieldToExist('displayInForm', false, screen)
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
        uiAssertions.expectInputFieldToExist(
            'aggregateExportDataElement',
            '',
            screen
        )
        expect(screen.getByTestId('add-boundary-button')).toBeVisible()
        await uiAssertions.expectTransferFieldToExistWithOptions(
            'legendSets-field',
            { lhs: legendSets, rhs: [] },
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
        expect(cancelButton).toHaveAttribute('href', `/${section.namePlural}`)
    })
    it('should submit the basic information and configuration data', async () => {
        const programWithoutRegistration = testProgram({
            programType: 'WITHOUT_REGISTRATION' as Program.programType,
        })
        const aName = faker.internet.userName()
        const aShortName = faker.internet.userName()
        const aCode = faker.science.chemicalElement().symbol
        const aDescription = faker.company.buzzPhrase()

        const periodTypes = ['Daily', 'Monthly', 'Yearly']
        const { screen } = await renderForm({
            customTestData: {
                programs: (type: any, params: any) => {
                    if (params.id === programWithoutRegistration.id) {
                        return {
                            programStages: [],
                        }
                    }
                    return Promise.resolve({
                        programs: [programWithoutRegistration, testProgram()],
                    })
                },
                periodTypes: () => ({
                    periodTypes: periodTypes.map((pt) => ({ name: pt })),
                }),
            },
        })

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
        // await uiActions.pickColor(screen)

        const programOptions = await uiActions.openSingleSelect(
            screen.getByTestId('programs-field'),
            screen
        )
        await userEvent.click(programOptions[0])
        await uiActions.closeSingleSelectIfOpen(
            screen.getByTestId('programs-field'),
            screen
        )

        const aggregationTypeOptions = await uiActions.openSingleSelect(
            screen.getByTestId('aggregation-type-field'),
            screen
        )
        await userEvent.click(aggregationTypeOptions[0])
        await uiActions.closeSingleSelectIfOpen(
            screen.getByTestId('aggregation-type-field'),
            screen
        )

        await uiActions.pickRadioField(
            'analyticsType',
            'Event: Uses data from all events within a program stage',
            screen
        )

        const orgUnitOptions = await uiActions.openSingleSelect(
            screen.getByTestId('org-unit-field'),
            screen
        )
        await userEvent.click(orgUnitOptions[0])
        await uiActions.closeSingleSelectIfOpen(
            screen.getByTestId('org-unit-field'),
            screen
        )

        const decimalsOptions = await uiActions.openSingleSelect(
            screen.getByTestId('decimals-field'),
            screen
        )
        await userEvent.click(decimalsOptions[2])
        await uiActions.closeSingleSelectIfOpen(
            screen.getByTestId('decimals-field'),
            screen
        )

        await uiActions.submitForm(screen)
        expect(createMock).toHaveBeenCalledTimes(1)
        expect(createMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    id: undefined,
                    program: expect.objectContaining({
                        id: programWithoutRegistration.id,
                    }),
                    name: aName,
                    shortName: aShortName,
                    code: aCode,
                    description: aDescription,
                    decimals: 1,
                    aggregationType: 'SUM',
                    analyticsType: 'EVENT',
                    displayInForm: false,
                    aggregateExportAttributeOptionCombo: undefined,
                    aggregateExportCategoryOptionCombo: undefined,
                    aggregateExportDataElement: undefined,
                    legendSets: [],
                    attributeValues: [],
                    expression: undefined,
                    filter: undefined,
                    analyticsPeriodBoundaries: [],
                }),
            })
        )
    })
    it('should submit the expression and a filter', async () => {
        const programWithoutRegistration = testProgram({
            programType: 'WITHOUT_REGISTRATION' as Program.programType,
        })
        const aName = faker.internet.userName()
        const aShortName = faker.internet.userName()
        const anExpression = faker.finance.routingNumber()
        const aFilter = faker.finance.routingNumber()

        const periodTypes = ['Daily', 'Monthly', 'Yearly']
        const { screen } = await renderForm({
            customTestData: {
                programs: (type: any, params: any) => {
                    if (params.id === programWithoutRegistration.id) {
                        return {
                            programStages: [],
                        }
                    }
                    return Promise.resolve({
                        programs: [programWithoutRegistration, testProgram()],
                    })
                },
                periodTypes: () => ({
                    periodTypes: periodTypes.map((pt) => ({ name: pt })),
                }),
            },
        })

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
        const programOptions = await uiActions.openSingleSelect(
            screen.getByTestId('programs-field'),
            screen
        )
        await userEvent.click(programOptions[0])
        await uiActions.closeSingleSelectIfOpen(
            screen.getByTestId('programs-field'),
            screen
        )

        await uiActions.pickRadioField(
            'analyticsType',
            'Event: Uses data from all events within a program stage',
            screen
        )

        await uiActions.applyNewExpressionWithinModal(
            'expression',
            anExpression,
            screen
        )
        await uiActions.applyNewExpressionWithinModal('filter', aFilter, screen)

        await uiActions.submitForm(screen)
        expect(createMock).toHaveBeenCalledTimes(1)
        expect(createMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    id: undefined,
                    program: expect.objectContaining({
                        id: programWithoutRegistration.id,
                    }),
                    name: aName,
                    shortName: aShortName,
                    code: undefined,
                    decimals: undefined,
                    aggregationType: undefined,
                    analyticsType: 'EVENT',
                    displayInForm: false,
                    aggregateExportAttributeOptionCombo: undefined,
                    aggregateExportCategoryOptionCombo: undefined,
                    aggregateExportDataElement: undefined,
                    legendSets: [],
                    attributeValues: [],
                    expression: anExpression,
                    filter: aFilter,
                    analyticsPeriodBoundaries: [],
                }),
            })
        )
    })
    it('should submit analytics period boundaries', async () => {
        const programWithoutRegistration = testProgram({
            programType: 'WITHOUT_REGISTRATION' as Program.programType,
        })
        const aName = faker.internet.userName()
        const aShortName = faker.internet.userName()

        const periodTypes = ['Daily', 'Monthly', 'Yearly']
        const { screen } = await renderForm({
            customTestData: {
                programs: (type: any, params: any) => {
                    if (params.id === programWithoutRegistration.id) {
                        return {
                            programStages: [],
                        }
                    }
                    return Promise.resolve({
                        programs: [programWithoutRegistration, testProgram()],
                    })
                },
                periodTypes: () => ({
                    periodTypes: periodTypes.map((pt) => ({ name: pt })),
                }),
            },
        })

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
        const programOptions = await uiActions.openSingleSelect(
            screen.getByTestId('programs-field'),
            screen
        )
        await userEvent.click(programOptions[0])
        await uiActions.closeSingleSelectIfOpen(
            screen.getByTestId('programs-field'),
            screen
        )

        await uiActions.pickRadioField(
            'analyticsType',
            'Event: Uses data from all events within a program stage',
            screen
        )

        await addPeriodBoundary(
            { target: 0, periodType: 1, type: 1, offset: 5 },
            periodTypes.length,
            screen
        )

        await uiActions.submitForm(screen)
        expect(createMock).toHaveBeenCalledTimes(1)
        expect(createMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    id: undefined,
                    program: expect.objectContaining({
                        id: programWithoutRegistration.id,
                    }),
                    name: aName,
                    shortName: aShortName,
                    code: undefined,
                    decimals: undefined,
                    aggregationType: undefined,
                    analyticsType: 'EVENT',
                    displayInForm: false,
                    aggregateExportAttributeOptionCombo: undefined,
                    aggregateExportCategoryOptionCombo: undefined,
                    aggregateExportDataElement: undefined,
                    legendSets: [],
                    attributeValues: [],
                    expression: undefined,
                    filter: undefined,
                    analyticsPeriodBoundaries: [
                        {
                            boundaryTarget: 'INCIDENT_DATE',
                            analyticsPeriodBoundaryType:
                                'BEFORE_START_OF_REPORTING_PERIOD',
                            offsetPeriodType: periodTypes[0],
                            offsetPeriods: 5,
                        },
                    ],
                }),
            })
        )
    })
    it('should submit the advanced options', async () => {
        const programWithoutRegistration = testProgram({
            programType: 'WITHOUT_REGISTRATION' as Program.programType,
        })
        const aName = faker.internet.userName()
        const aShortName = faker.internet.userName()
        const aCatOptionExport = faker.internet.userName()
        const anAttOptionExport = faker.internet.userName()
        const anAggDataExport = faker.internet.userName()

        const periodTypes = ['Daily', 'Monthly', 'Yearly']
        const { screen } = await renderForm({
            customTestData: {
                programs: (type: any, params: any) => {
                    if (params.id === programWithoutRegistration.id) {
                        return {
                            programStages: [],
                        }
                    }
                    return Promise.resolve({
                        programs: [programWithoutRegistration, testProgram()],
                    })
                },
                periodTypes: () => ({
                    periodTypes: periodTypes.map((pt) => ({ name: pt })),
                }),
            },
        })

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
        const programOptions = await uiActions.openSingleSelect(
            screen.getByTestId('programs-field'),
            screen
        )
        await userEvent.click(programOptions[0])
        await uiActions.closeSingleSelectIfOpen(
            screen.getByTestId('programs-field'),
            screen
        )

        await uiActions.pickRadioField(
            'analyticsType',
            'Event: Uses data from all events within a program stage',
            screen
        )

        await uiActions.clickOnCheckboxField('displayInForm', screen)
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
        await uiActions.enterInputFieldValue(
            'aggregateExportDataElement',
            anAggDataExport,
            screen,
            { paste: true }
        )

        await uiActions.submitForm(screen)
        expect(createMock).toHaveBeenCalledTimes(1)
        expect(createMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    id: undefined,
                    program: expect.objectContaining({
                        id: programWithoutRegistration.id,
                    }),
                    name: aName,
                    shortName: aShortName,
                    code: undefined,
                    decimals: undefined,
                    aggregationType: undefined,
                    analyticsType: 'EVENT',
                    displayInForm: true,
                    aggregateExportAttributeOptionCombo: anAttOptionExport,
                    aggregateExportCategoryOptionCombo: aCatOptionExport,
                    aggregateExportDataElement: anAggDataExport,
                    legendSets: [],
                    attributeValues: [],
                    expression: undefined,
                    filter: undefined,
                    analyticsPeriodBoundaries: [],
                }),
            })
        )
    })
    it('should submit the legends', async () => {
        const programWithoutRegistration = testProgram({
            programType: 'WITHOUT_REGISTRATION' as Program.programType,
        })
        const aName = faker.internet.userName()
        const aShortName = faker.internet.userName()

        const periodTypes = ['Daily', 'Monthly', 'Yearly']
        const { screen, legendSets } = await renderForm({
            customTestData: {
                programs: (type: any, params: any) => {
                    if (params.id === programWithoutRegistration.id) {
                        return {
                            programStages: [],
                        }
                    }
                    return Promise.resolve({
                        programs: [programWithoutRegistration, testProgram()],
                    })
                },
                periodTypes: () => ({
                    periodTypes: periodTypes.map((pt) => ({ name: pt })),
                }),
            },
        })

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
        const programOptions = await uiActions.openSingleSelect(
            screen.getByTestId('programs-field'),
            screen
        )
        await userEvent.click(programOptions[0])
        await uiActions.closeSingleSelectIfOpen(
            screen.getByTestId('programs-field'),
            screen
        )

        await uiActions.pickRadioField(
            'analyticsType',
            'Event: Uses data from all events within a program stage',
            screen
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
                    program: expect.objectContaining({
                        id: programWithoutRegistration.id,
                    }),
                    name: aName,
                    shortName: aShortName,
                    code: undefined,
                    decimals: undefined,
                    aggregationType: undefined,
                    analyticsType: 'EVENT',
                    displayInForm: false,
                    aggregateExportAttributeOptionCombo: undefined,
                    aggregateExportCategoryOptionCombo: undefined,
                    aggregateExportDataElement: undefined,
                    legendSets: [
                        expect.objectContaining({ id: legendSets[0].id }),
                    ],
                    attributeValues: [],
                    expression: undefined,
                    filter: undefined,
                    analyticsPeriodBoundaries: [],
                }),
            })
        )
    })
    it('should submit the attributes', async () => {
        const programWithoutRegistration = testProgram({
            programType: 'WITHOUT_REGISTRATION' as Program.programType,
        })
        const aName = faker.internet.userName()
        const aShortName = faker.internet.userName()
        const anAttribute = faker.internet.userName()

        const periodTypes = ['Daily', 'Monthly', 'Yearly']
        const { screen, attributes } = await renderForm({
            customTestData: {
                programs: (type: any, params: any) => {
                    if (params.id === programWithoutRegistration.id) {
                        return {
                            programStages: [],
                        }
                    }
                    return Promise.resolve({
                        programs: [programWithoutRegistration, testProgram()],
                    })
                },
                periodTypes: () => ({
                    periodTypes: periodTypes.map((pt) => ({ name: pt })),
                }),
            },
        })

        await uiActions.enterName(aName, screen, { paste: true })
        await uiActions.enterInputFieldValue('shortName', aShortName, screen, {
            paste: true,
        })
        const programOptions = await uiActions.openSingleSelect(
            screen.getByTestId('programs-field'),
            screen
        )
        await userEvent.click(programOptions[0])
        await uiActions.closeSingleSelectIfOpen(
            screen.getByTestId('programs-field'),
            screen
        )

        await uiActions.pickRadioField(
            'analyticsType',
            'Event: Uses data from all events within a program stage',
            screen
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
                    program: expect.objectContaining({
                        id: programWithoutRegistration.id,
                    }),
                    name: aName,
                    shortName: aShortName,
                    code: undefined,
                    decimals: undefined,
                    aggregationType: undefined,
                    analyticsType: 'EVENT',
                    displayInForm: false,
                    aggregateExportAttributeOptionCombo: undefined,
                    aggregateExportCategoryOptionCombo: undefined,
                    aggregateExportDataElement: undefined,
                    legendSets: [],
                    attributeValues: [
                        {
                            attribute: expect.objectContaining({
                                id: attributes[0].id,
                            }),
                            value: anAttribute,
                        },
                    ],
                    expression: undefined,
                    filter: undefined,
                    analyticsPeriodBoundaries: [],
                }),
            })
        )
    })
})
