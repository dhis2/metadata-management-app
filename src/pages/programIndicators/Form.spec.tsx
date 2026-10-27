import { faker } from '@faker-js/faker'
import { render, RenderResult, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/programIndicatorsSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { getConstantTranslation, SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    randomLongString,
    testCustomAttribute,
    testLegendSet,
    testProgram,
    testProgramIndicator,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import {
    ProgramTrackedEntityAttribute,
    ProgramType,
} from '../../types/generated'
import { Component as Edit } from './Edit'
import { staticOptions } from './form/OrgUnitField'
import { PROGRAM_INDICATOR_SPECIFIC_TRANSLATIONS } from './form/ProgramIndicatorFormFields'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.programIndicator
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Program indicator form tests', () => {
    const createMock = jest.fn()
    const updateMock = jest.fn()

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
    describe('Common', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                {
                    customTestData = {},
                    matchingExistingElementFilter = undefined,
                } = {}
            ) => {
                const attributes = [testCustomAttribute()]
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

        it('should show the org unit field when there is a program selected with type WITH_REGISTRATION and analytics type is event', async () => {
            const programTrackedEntityAttributes = [
                {
                    trackedEntityAttribute: {
                        valueType: 'ORGANISATION_UNIT',
                        displayName: 'entity attribute org unit',
                        id: randomDhis2Id(),
                    },
                },
                {
                    trackedEntityAttribute: {
                        valueType: 'TEXT',
                        displayName: 'other entity attribute',
                        id: randomDhis2Id(),
                    },
                },
            ] as unknown as ProgramTrackedEntityAttribute[]
            const programWithRegistration = testProgram({
                programType: 'WITH_REGISTRATION' as ProgramType,
                programTrackedEntityAttributes,
            })
            const programStageDataElements = [
                {
                    dataElement: {
                        valueType: 'BOOLEAN',
                        displayName: 'boolean data element',
                        id: randomDhis2Id(),
                    },
                },
                {
                    dataElement: {
                        valueType: 'ORGANISATION_UNIT',
                        displayName: 'org unit data element',
                        id: randomDhis2Id(),
                    },
                },
            ]
            const { screen } = await renderForm({
                customTestData: {
                    programs: (type: any, params: any) => {
                        if (params.id === programWithRegistration.id) {
                            return {
                                programStages: [
                                    {
                                        programStageDataElements,
                                        id: randomDhis2Id(),
                                    },
                                ],
                            }
                        }
                        return Promise.resolve({
                            programs: [programWithRegistration, testProgram()],
                        })
                    },
                },
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

            const orgUnitField = await screen.findByTestId('org-unit-field')
            await uiAssertions.expectSelectToExistWithOptions(
                orgUnitField,
                {
                    options: [
                        { displayName: staticOptions.eventDefault.label },
                        programTrackedEntityAttributes[0]
                            .trackedEntityAttribute,
                        programStageDataElements[1].dataElement,
                        { displayName: staticOptions.registration.label },
                        { displayName: staticOptions.enrollment.label },
                        { displayName: staticOptions.ownerAtStart.label },
                        { displayName: staticOptions.ownerAtEnd.label },
                    ],
                },
                screen
            )
        })
        it('should show the org unit field when there is a program selected with type WITH_REGISTRATION and analytics type is enrollment', async () => {
            const programTrackedEntityAttributes = [
                {
                    trackedEntityAttribute: {
                        valueType: 'ORGANISATION_UNIT',
                        displayName: 'entity attribute org unit',
                        id: randomDhis2Id(),
                    },
                },
                {
                    trackedEntityAttribute: {
                        valueType: 'TEXT',
                        displayName: 'other entity attribute',
                        id: randomDhis2Id(),
                    },
                },
            ] as unknown as ProgramTrackedEntityAttribute[]
            const programWithRegistration = testProgram({
                programType: 'WITH_REGISTRATION' as ProgramType,
                programTrackedEntityAttributes,
            })
            const programStageDataElements = [
                {
                    dataElement: {
                        valueType: 'BOOLEAN',
                        displayName: 'boolean data element',
                        id: randomDhis2Id(),
                    },
                },
                {
                    dataElement: {
                        valueType: 'ORGANISATION_UNIT',
                        displayName: 'org unit data element',
                        id: randomDhis2Id(),
                    },
                },
            ]
            const { screen } = await renderForm({
                customTestData: {
                    programs: (type: any, params: any) => {
                        if (params.id === programWithRegistration.id) {
                            return {
                                programStages: [
                                    {
                                        programStageDataElements,
                                        id: randomDhis2Id(),
                                    },
                                ],
                            }
                        }
                        return Promise.resolve({
                            programs: [programWithRegistration, testProgram()],
                        })
                    },
                },
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
                'Enrollment: Uses data combined from the latest events across the enrollment',
                screen
            )

            const orgUnitField = await screen.findByTestId('org-unit-field')
            await uiAssertions.expectSelectToExistWithOptions(
                orgUnitField,
                {
                    options: [
                        { displayName: staticOptions.enrollmentDefault.label },
                        programTrackedEntityAttributes[0]
                            .trackedEntityAttribute,
                        { displayName: staticOptions.registration.label },
                        { displayName: staticOptions.ownerAtStart.label },
                        { displayName: staticOptions.ownerAtEnd.label },
                    ],
                },
                screen
            )
        })
        it('should show the org unit field when there is a program selected with type WITHOUT_REGISTRATION', async () => {
            const programWithoutRegistration = testProgram({
                programType: 'WITHOUT_REGISTRATION' as ProgramType,
            })
            const programStageDataElements = [
                {
                    dataElement: {
                        valueType: 'BOOLEAN',
                        displayName: 'boolean data element',
                        id: randomDhis2Id(),
                    },
                },
                {
                    dataElement: {
                        valueType: 'ORGANISATION_UNIT',
                        displayName: 'org unit data element',
                        id: randomDhis2Id(),
                    },
                },
            ]
            const { screen } = await renderForm({
                customTestData: {
                    programs: (type: any, params: any) => {
                        if (params.id === programWithoutRegistration.id) {
                            return {
                                programStages: [
                                    {
                                        programStageDataElements,
                                        id: randomDhis2Id(),
                                    },
                                ],
                            }
                        }
                        return Promise.resolve({
                            programs: [
                                programWithoutRegistration,
                                testProgram(),
                            ],
                        })
                    },
                },
            })

            const programOptions = await uiActions.openSingleSelect(
                screen.getByTestId('programs-field'),
                screen
            )
            expect(programOptions).toHaveLength(2)
            await userEvent.click(programOptions[0])
            await uiActions.closeSingleSelectIfOpen(
                screen.getByTestId('programs-field'),
                screen
            )

            const orgUnitField = await screen.findByTestId('org-unit-field')
            await uiAssertions.expectSelectToExistWithOptions(
                orgUnitField,
                {
                    options: [
                        { displayName: staticOptions.eventDefault.label },
                        programStageDataElements[1].dataElement,
                    ],
                },
                screen
            )
        })
        it('should not show the org unit field when no program is selected', async () => {
            const { screen } = await renderForm()

            await waitFor(() => {
                expect(
                    screen.queryByTestId('org-unit-field')
                ).not.toBeInTheDocument()
            })
        })
        it('should add  and delete period boundaries', async () => {
            const periodTypes = ['Daily', 'Monthly', 'Yearly']
            const { screen } = await renderForm({
                customTestData: {
                    periodTypes: () => ({
                        periodTypes: periodTypes.map((pt) => ({ name: pt })),
                    }),
                },
            })
            await addPeriodBoundary(
                { target: 0, periodType: 1, type: 1, offset: 5 },
                periodTypes.length,
                screen
            )
            const boundariesList = screen.getAllByTestId(
                'analytics-period-boundary'
            )
            expect(boundariesList).toHaveLength(1)

            const customText = 'lalala'
            await addPeriodBoundary(
                { target: 3, customText, periodType: 1, type: 1, offset: 5 },
                periodTypes.length,
                screen
            )
            const newBoundariesList = screen.getAllByTestId(
                'analytics-period-boundary'
            )
            expect(newBoundariesList).toHaveLength(2)

            await userEvent.click(
                within(newBoundariesList[1]).getByTestId('apb-remove-button')
            )
            const newBoundariesList2 = screen.getAllByTestId(
                'analytics-period-boundary'
            )
            expect(newBoundariesList2).toHaveLength(1)
        })
        it('should not submit when required values are missing', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
            uiAssertions.expectFieldToHaveError(
                'programs-field',
                'Required',
                screen
            )
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
        it('should show an error if code field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(60)
            await uiActions.enterCode(longText, screen)
            await uiAssertions.expectCodeToErrorWhenExceedsLength(screen)
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
        it('should show an error if expression field is malformed', async () => {
            const { screen } = await renderForm({
                customTestData: {
                    'programIndicators/expression/description': () => ({
                        status: 'ERROR',
                    }),
                },
            })
            const anExpression = faker.finance.routingNumber()
            await userEvent.click(
                screen.getByTestId('edit-expression-expression-button')
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
        it('should show an error if filter field is malformed', async () => {
            const { screen } = await renderForm({
                customTestData: {
                    'programIndicators/filter/description': () => ({
                        status: 'ERROR',
                    }),
                },
            })
            const anExpression = faker.finance.routingNumber()
            await userEvent.click(
                screen.getByTestId('edit-filter-expression-button')
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
            const { screen, programs, legendSets, attributes } =
                await renderForm()
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
                    options:
                        mockSchema.properties.aggregationType.constants.map(
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

            uiAssertions.expectCheckboxFieldToExist(
                'displayInForm',
                false,
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
            expect(cancelButton).toHaveAttribute(
                'href',
                `/${section.namePlural}`
            )
        })
        it('should submit the basic information and configuration data', async () => {
            const programWithoutRegistration = testProgram({
                programType: 'WITHOUT_REGISTRATION' as ProgramType,
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
                            programs: [
                                programWithoutRegistration,
                                testProgram(),
                            ],
                        })
                    },
                    periodTypes: () => ({
                        periodTypes: periodTypes.map((pt) => ({ name: pt })),
                    }),
                },
            })

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
                programType: 'WITHOUT_REGISTRATION' as ProgramType,
            })
            const aName = faker.internet.userName()
            const aShortName = faker.internet.userName()
            // const anAggDataExport = faker.internet.userName()
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
                            programs: [
                                programWithoutRegistration,
                                testProgram(),
                            ],
                        })
                    },
                    periodTypes: () => ({
                        periodTypes: periodTypes.map((pt) => ({ name: pt })),
                    }),
                },
            })

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
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
            await uiActions.applyNewExpressionWithinModal(
                'filter',
                aFilter,
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
                        expression: anExpression,
                        filter: aFilter,
                        analyticsPeriodBoundaries: [],
                    }),
                })
            )
        })
        it('should submit analytics period boundaries', async () => {
            const programWithoutRegistration = testProgram({
                programType: 'WITHOUT_REGISTRATION' as ProgramType,
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
                            programs: [
                                programWithoutRegistration,
                                testProgram(),
                            ],
                        })
                    },
                    periodTypes: () => ({
                        periodTypes: periodTypes.map((pt) => ({ name: pt })),
                    }),
                },
            })

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
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
                programType: 'WITHOUT_REGISTRATION' as ProgramType,
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
                            programs: [
                                programWithoutRegistration,
                                testProgram(),
                            ],
                        })
                    },
                    periodTypes: () => ({
                        periodTypes: periodTypes.map((pt) => ({ name: pt })),
                    }),
                },
            })

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
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
                screen
            )
            await uiActions.enterInputFieldValue(
                'aggregateExportAttributeOptionCombo',
                anAttOptionExport,
                screen
            )
            await uiActions.enterInputFieldValue(
                'aggregateExportDataElement',
                anAggDataExport,
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
                programType: 'WITHOUT_REGISTRATION' as ProgramType,
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
                            programs: [
                                programWithoutRegistration,
                                testProgram(),
                            ],
                        })
                    },
                    periodTypes: () => ({
                        periodTypes: periodTypes.map((pt) => ({ name: pt })),
                    }),
                },
            })

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
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
                programType: 'WITHOUT_REGISTRATION' as ProgramType,
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
                            programs: [
                                programWithoutRegistration,
                                testProgram(),
                            ],
                        })
                    },
                    periodTypes: () => ({
                        periodTypes: periodTypes.map((pt) => ({ name: pt })),
                    }),
                },
            })

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'shortName',
                aShortName,
                screen
            )
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
    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                {
                    customTestData = {},
                    programIndicatorOverwrites = {},
                    matchingExistingElementFilter = undefined,
                    id = randomDhis2Id(),
                    overridePrograms,
                } = {}
            ) => {
                const programWithoutRegistration = testProgram({
                    programType: 'WITHOUT_REGISTRATION' as ProgramType,
                })
                const programs = overridePrograms ?? [
                    programWithoutRegistration,
                    testProgram(),
                    testProgram(),
                ]
                const attributes = [testCustomAttribute()]
                const legendSets = [testLegendSet(), testLegendSet()]
                const periodTypes = ['Daily', 'Monthly', 'Yearly']

                const programIndicator = testProgramIndicator({
                    id,
                    program: programWithoutRegistration,
                    legendSets: [legendSets[0]],
                    attributeValues: [
                        { attribute: attributes[0], value: 'attribute' },
                    ],
                    analyticsPeriodBoundaries: [
                        {
                            boundaryTarget: 'INCIDENT_DATE',
                            analyticsPeriodBoundaryType:
                                'BEFORE_START_OF_REPORTING_PERIOD',
                            offsetPeriodType: periodTypes[0],
                            offsetPeriods: 5,
                        },
                    ],
                    ...programIndicatorOverwrites,
                })
                if (programIndicatorOverwrites.orgUnitField === null) {
                    delete programIndicator.orgUnitField
                }
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            programs: (_: any, params: any) => {
                                if (
                                    params.params.id ===
                                    programWithoutRegistration.id
                                ) {
                                    return {
                                        programStages: [],
                                    }
                                }
                                return Promise.resolve({
                                    programs,
                                })
                            },
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
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return programIndicator
                                    }
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
                            periodTypes: () => ({
                                periodTypes: periodTypes.map((pt) => ({
                                    name: pt,
                                })),
                            }),
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
                        <Edit />
                    </TestComponentWithRouter>
                )
                return {
                    screen,
                    attributes,
                    programs,
                    legendSets,
                    programIndicator,
                }
            }
        )

        it('contain all the basic information fields', async () => {
            const { screen, programIndicator } = await renderForm()
            uiAssertions.expectNameFieldExist(programIndicator.name, screen)
            uiAssertions.expectInputFieldToExist(
                'shortName',
                programIndicator.shortName,
                screen
            )

            uiAssertions.expectCodeFieldExist(programIndicator.code, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                programIndicator.description,
                screen
            )
            uiAssertions.expectColorAndIconFieldToExist(screen)
        })
        it('contain all the configuration field', async () => {
            const { screen, programs, programIndicator } = await renderForm()

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('programs-field'),
                {
                    selected: programIndicator.program.displayName,
                    options: programs,
                },
                screen
            )

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('aggregation-type-field'),
                {
                    selected: getConstantTranslation(
                        programIndicator.aggregationType
                    ),
                    options:
                        mockSchema.properties.aggregationType.constants.map(
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
                        checked: programIndicator.analyticsType === 'EVENT',
                    },
                    {
                        label: PROGRAM_INDICATOR_SPECIFIC_TRANSLATIONS.ENROLLMENT,
                        checked:
                            programIndicator.analyticsType === 'ENROLLMENT',
                    },
                ],
                screen
            )

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('org-unit-field'),
                {
                    selected: staticOptions.eventDefault.label,
                    options: [
                        {
                            displayName: staticOptions.eventDefault.label,
                        },
                    ],
                },
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
                {
                    selected: programIndicator.decimals,
                    options: expectedDecimalsOptions,
                },
                screen
            )
        })
        it('shows the selected org-unit-field value (tracker program)', async () => {
            const programTrackedEntityAttributes = [
                {
                    trackedEntityAttribute: {
                        valueType: 'ORGANISATION_UNIT',
                        displayName: 'entity attribute org unit',
                        id: randomDhis2Id(),
                    },
                },
                {
                    trackedEntityAttribute: {
                        valueType: 'TEXT',
                        displayName: 'other entity attribute',
                        id: randomDhis2Id(),
                    },
                },
            ] as unknown as ProgramTrackedEntityAttribute[]
            const programWithRegistration = testProgram({
                programType: 'WITH_REGISTRATION' as ProgramType,
                programTrackedEntityAttributes,
            })
            const orgUnitOptions = [
                { displayName: staticOptions.eventDefault.label },
                programTrackedEntityAttributes[0].trackedEntityAttribute,
                { displayName: staticOptions.registration.label },
                { displayName: staticOptions.enrollment.label },
                { displayName: staticOptions.ownerAtStart.label },
                { displayName: staticOptions.ownerAtEnd.label },
            ]
            const orgUnitOption = staticOptions.ownerAtStart
            const overridePrograms = [
                programWithRegistration,
                testProgram(),
                testProgram(),
                testProgram(),
            ]
            const { screen, programs, programIndicator } = await renderForm({
                programIndicatorOverwrites: {
                    orgUnitField: orgUnitOption.value,
                    program: programWithRegistration,
                    analyticsType: 'EVENT',
                },
                overridePrograms,
            })

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('programs-field'),
                {
                    selected: programIndicator.program.displayName,
                    options: programs,
                },
                screen
            )

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('org-unit-field'),
                {
                    selected: orgUnitOption.label,
                    options: orgUnitOptions,
                },
                screen
            )
        })
        it('shows default org unit field if none is selected (tracker program)', async () => {
            const programTrackedEntityAttributes = [
                {
                    trackedEntityAttribute: {
                        valueType: 'ORGANISATION_UNIT',
                        displayName: 'entity attribute org unit',
                        id: randomDhis2Id(),
                    },
                },
                {
                    trackedEntityAttribute: {
                        valueType: 'TEXT',
                        displayName: 'other entity attribute',
                        id: randomDhis2Id(),
                    },
                },
            ] as unknown as ProgramTrackedEntityAttribute[]
            const programWithRegistration = testProgram({
                programType: 'WITH_REGISTRATION' as ProgramType,
                programTrackedEntityAttributes,
            })
            const orgUnitOptions = [
                { displayName: staticOptions.eventDefault.label },
                programTrackedEntityAttributes[0].trackedEntityAttribute,
                { displayName: staticOptions.registration.label },
                { displayName: staticOptions.enrollment.label },
                { displayName: staticOptions.ownerAtStart.label },
                { displayName: staticOptions.ownerAtEnd.label },
            ]
            const orgUnitOption = staticOptions.eventDefault
            const overridePrograms = [
                programWithRegistration,
                testProgram(),
                testProgram(),
                testProgram(),
            ]
            const { screen, programs, programIndicator } = await renderForm({
                programIndicatorOverwrites: {
                    orgUnitField: undefined,
                    program: programWithRegistration,
                    analyticsType: 'EVENT',
                },
                overridePrograms,
            })

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('programs-field'),
                {
                    selected: programIndicator.program.displayName,
                    options: programs,
                },
                screen
            )

            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('org-unit-field'),
                {
                    selected: orgUnitOption.label,
                    options: orgUnitOptions,
                },
                screen
            )
        })
        it('contain expression and filter field', async () => {
            const { screen, programIndicator } = await renderForm()
            uiAssertions.expectTextAreaFieldToExist(
                'expression',
                programIndicator.expression,
                screen
            )
            uiAssertions.expectTextAreaFieldToExist(
                'filter',
                programIndicator.filter,
                screen
            )
        })
        it('contain the period boundaries', async () => {
            const { screen } = await renderForm()

            const boundariesList = screen.getAllByTestId(
                'analytics-period-boundary'
            )
            expect(boundariesList).toHaveLength(1)
            expect(boundariesList[0]).toHaveTextContent('Incident date')
            expect(boundariesList[0]).toHaveTextContent('Offset: 5')
            expect(boundariesList[0]).toHaveTextContent(
                'Type: Before start of reporting period'
            )
            expect(boundariesList[0]).toHaveTextContent('Period: Daily')
        })
        it('contain all the advance options fields', async () => {
            const { screen, programIndicator } = await renderForm()

            uiAssertions.expectCheckboxFieldToExist(
                'displayInForm',
                programIndicator.displayInForm,
                screen
            )
            uiAssertions.expectInputFieldToExist(
                'aggregateExportCategoryOptionCombo',
                programIndicator.aggregateExportCategoryOptionCombo,
                screen
            )
            uiAssertions.expectInputFieldToExist(
                'aggregateExportAttributeOptionCombo',
                programIndicator.aggregateExportAttributeOptionCombo,
                screen
            )
            uiAssertions.expectInputFieldToExist(
                'aggregateExportDataElement',
                programIndicator.aggregateExportDataElement,
                screen
            )
        })
        it('contain the legend transfer', async () => {
            const { screen, legendSets } = await renderForm()

            await uiAssertions.expectTransferFieldToExistWithOptions(
                'legendSets-field',
                { lhs: [legendSets[1]], rhs: [legendSets[0]] },
                screen
            )
        })
        it('contain all the attributes fields ', async () => {
            const { screen, attributes, programIndicator } = await renderForm()
            attributes.forEach((attribute: { id: string }) => {
                const attributeInput = screen.getByTestId(
                    `attribute-${attribute.id}`
                )
                expect(attributeInput).toBeVisible()
                expect(
                    within(
                        within(attributeInput).getByTestId('dhis2-uicore-input')
                    ).getByRole('textbox')
                ).toHaveValue(programIndicator.attributeValues[0].value)
            })
        })
        it('maps orgUnitField:EVENT to null on save', async () => {
            const { screen, programIndicator } = await renderForm({
                programIndicatorOverwrites: { orgUnitField: 'EVENT' },
            })
            await uiActions.submitForm(screen)
            expect(updateMock).toHaveBeenCalledWith({
                data: [{ op: 'add', path: '/orgUnitField', value: null }],
                id: programIndicator.id,
                params: undefined,
                resource: 'programIndicators',
            })
        })
        it('shows null orgUnitField value with appropriate label', async () => {
            const programWithRegistration = testProgram({
                programType: 'WITH_REGISTRATION' as ProgramType,
            })
            const { screen } = await renderForm({
                programIndicatorOverwrites: {
                    orgUnitField: null,
                    program: programWithRegistration,
                    analyticsType: 'EVENT',
                },
            })
            expect(screen.getByTestId('org-unit-field')).toHaveTextContent(
                staticOptions.eventDefault.label
            )
        })
        it('leaves other orgUnitField values unchanged', async () => {
            const orgUnitOption = staticOptions.ownerAtStart

            const programWithRegistration = testProgram({
                programType: 'WITH_REGISTRATION' as ProgramType,
            })
            const { screen } = await renderForm({
                programIndicatorOverwrites: {
                    orgUnitField: orgUnitOption.value,
                    program: programWithRegistration,
                    analyticsType: 'EVENT',
                },
            })
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
        it('update decimals to 0', async () => {
            const { screen, programIndicator } = await renderForm({
                programIndicatorOverwrites: { decimals: 1, orgUnitField: null },
            })
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('decimals-field'),
                1,
                screen
            )
            await uiActions.submitForm(screen)
            expect(updateMock).toHaveBeenCalledWith({
                data: [{ op: 'replace', path: '/decimals', value: 0 }],
                id: programIndicator.id,
                params: undefined,
                resource: 'programIndicators',
            })
        })
        it('displays 0 decimals correctly', async () => {
            const { screen } = await renderForm({
                programIndicatorOverwrites: { decimals: 0 },
            })
            const decimals = within(
                screen.getByTestId('decimals-field')
            ).getByTestId('dhis2-uicore-select-input')
            expect(decimals).toBeVisible()
            expect(decimals).toHaveTextContent('0')
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
                programIndicatorOverwrites: { orgUnitField: null },
            })
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})
