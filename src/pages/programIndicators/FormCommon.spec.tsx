import { faker } from '@faker-js/faker'
import { render, RenderResult, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/programIndicatorsSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
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
import { Program, ProgramTrackedEntityAttribute } from '../../types/generated'
import { staticOptions } from './form/OrgUnitField'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.programIndicator
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Program indicator form tests - Common', () => {
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
            programType: 'WITH_REGISTRATION' as Program.programType,
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
                    programTrackedEntityAttributes[0].trackedEntityAttribute,
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
            programType: 'WITH_REGISTRATION' as Program.programType,
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
                    programTrackedEntityAttributes[0].trackedEntityAttribute,
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
            programType: 'WITHOUT_REGISTRATION' as Program.programType,
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
                        programs: [programWithoutRegistration, testProgram()],
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
        await uiActions.enterName(longText, screen, { paste: true })
        await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
        await uiActions.submitForm(screen)
        expect(createMock).not.toHaveBeenCalled()
    })
    it('should show an error if code field is too long', async () => {
        const { screen } = await renderForm()
        const longText = randomLongString(60)
        await uiActions.enterCode(longText, screen, { paste: true })
        await uiAssertions.expectCodeToErrorWhenExceedsLength(screen)
        await uiActions.submitForm(screen)
        expect(createMock).not.toHaveBeenCalled()
    })
    it('should show an error if name field is a duplicate', async () => {
        const existingName = faker.company.name()
        const { screen } = await renderForm({
            matchingExistingElementFilter: `name:ieq:${existingName}`,
        })
        await uiAssertions.expectNameToErrorWhenDuplicate(existingName, screen)
        await uiActions.submitForm(screen)
        expect(createMock).not.toHaveBeenCalled()
    })
    it('should show an error if code field is a duplicate', async () => {
        const existingCode = faker.science.chemicalElement().symbol
        const { screen } = await renderForm({
            matchingExistingElementFilter: `code:ieq:${existingCode}`,
        })
        await uiAssertions.expectCodeToErrorWhenDuplicate(existingCode, screen)
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
        const editModal = await screen.findByTestId(`expression-builder-modal`)
        await uiActions.enterExpressionInModal(editModal, anExpression, screen)

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
        const editModal = await screen.findByTestId(`expression-builder-modal`)
        await uiActions.enterExpressionInModal(editModal, anExpression, screen)

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
