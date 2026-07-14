import {
    act,
    render,
    waitFor,
    within,
    type RenderResult,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/programRuleVariablesSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP, getConstantTranslation } from '../../lib'
import {
    randomLongString,
    testProgram,
    testProgramRuleVariable,
    testProgramStage,
    testTrackedEntityAttribute,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { ProgramRuleVariableSourceType, ValueType } from '../../types/generated'
import { Component as Edit } from './Edit'
import { Component as New } from './New'

const section = SECTIONS_MAP.programRuleVariable
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

const waitForLoadingToComplete = async (field: HTMLElement) => {
    await waitFor(() => {
        const loadingIndicator = field.querySelector(
            '[data-test="dhis2-uicore-circularloader"]'
        )
        expect(loadingIndicator).not.toBeInTheDocument()
    })
}

const waitForOptionsToPopulate = async (
    field: HTMLElement,
    screen: RenderResult
) => {
    const selectInput = field.querySelector(
        '[data-test="dhis2-uicore-select-input"]'
    )
    if (!selectInput) {
        return
    }

    await userEvent.click(selectInput)
    await waitFor(() => {
        const optionsWrapper = screen.queryByTestId(
            'dhis2-uicore-select-menu-menuwrapper'
        )
        expect(optionsWrapper).toBeInTheDocument()
        const options = optionsWrapper?.querySelectorAll(
            '[data-test="dhis2-uicore-singleselectoption"]'
        )
        expect(options?.length).toBeGreaterThan(0)
    })
    await userEvent.click(selectInput)
}

describe('Program Rule Variable form tests', () => {
    const createMock = jest.fn()
    const updateMock = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
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
                const programs = [
                    testProgram({
                        id: 'program1',
                        name: 'Test Program 1',
                        programTrackedEntityAttributes: [
                            {
                                trackedEntityAttribute:
                                    testTrackedEntityAttribute({
                                        id: 'attr1',
                                        displayName: 'Attribute 1',
                                    }),
                            },
                        ] as any,
                    }),
                    testProgram({
                        id: 'program2',
                        name: 'Test Program 2',
                        programTrackedEntityAttributes: [
                            {
                                trackedEntityAttribute:
                                    testTrackedEntityAttribute({
                                        id: 'attr2',
                                        displayName: 'Attribute 2',
                                    }),
                            },
                        ] as any,
                    }),
                ]

                const programStages = [
                    testProgramStage({
                        id: 'stage1',
                        displayName: 'Stage 1',
                    }),
                    testProgramStage({
                        id: 'stage2',
                        displayName: 'Stage 2',
                    }),
                ]

                const dataElements = [
                    { id: 'de1', displayName: 'Data Element 1' },
                    { id: 'de2', displayName: 'Data Element 2' },
                ]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            programs: (type: any, params: any) => {
                                if (params?.id === 'program1') {
                                    return {
                                        programStages: [
                                            {
                                                id: 'stage1',
                                                programStageDataElements: [
                                                    {
                                                        dataElement:
                                                            dataElements[0],
                                                    },
                                                ],
                                            },
                                            {
                                                id: 'stage2',
                                                programStageDataElements: [
                                                    {
                                                        dataElement:
                                                            dataElements[1],
                                                    },
                                                ],
                                            },
                                        ],
                                        programTrackedEntityAttributes: [
                                            {
                                                trackedEntityAttribute: {
                                                    id: 'attr1',
                                                    displayName: 'Attribute 1',
                                                },
                                            },
                                        ],
                                    }
                                }
                                return { programs }
                            },
                            programStages: () => ({ programStages }),
                            programRuleVariables: (type: any, params: any) => {
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
                                            programRuleVariables: [
                                                testProgramRuleVariable(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        programRuleVariables: [],
                                    }
                                }
                            },
                            ...customTestData,
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, programs, programStages, dataElements }
            }
        )

        describe('Name field validation', () => {
            it('should show an error if name field is too long', async () => {
                const { screen } = await renderForm()
                const longText = randomLongString(231)
                await uiActions.enterName(longText, screen)
                await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
                await uiActions.submitForm(screen)
                expect(createMock).not.toHaveBeenCalled()
            })

            it('should show an error if name contains invalid characters', async () => {
                const { screen } = await renderForm()
                const invalidName = 'Test@Name#123'
                await uiActions.enterName(invalidName, screen)
                await uiActions.submitForm(screen)
                expect(createMock).not.toHaveBeenCalled()
                uiAssertions.expectFieldToHaveError(
                    'formfields-name',
                    'Name can only contain letters, numbers, space, dash, dot and underscore',
                    screen
                )
            })

            it('should show an error if name contains forbidden word "and"', async () => {
                const { screen } = await renderForm()
                const forbiddenName = 'Test and Variable'
                await uiActions.enterName(forbiddenName, screen)
                await uiActions.submitForm(screen)
                expect(createMock).not.toHaveBeenCalled()
                uiAssertions.expectFieldToHaveError(
                    'formfields-name',
                    'Program rule variable name contains forbidden words: and, or, not.',
                    screen
                )
            })

            it('should show an error if name contains forbidden word "or"', async () => {
                const { screen } = await renderForm()
                const forbiddenName = 'Test or Variable'
                await uiActions.enterName(forbiddenName, screen)
                await uiActions.submitForm(screen)
                expect(createMock).not.toHaveBeenCalled()
                uiAssertions.expectFieldToHaveError(
                    'formfields-name',
                    'Program rule variable name contains forbidden words: and, or, not.',
                    screen
                )
            })

            it('should show an error if name contains forbidden word "not"', async () => {
                const { screen } = await renderForm()
                const forbiddenName = 'Test not Variable'
                await uiActions.enterName(forbiddenName, screen)
                await uiActions.submitForm(screen)
                expect(createMock).not.toHaveBeenCalled()
                uiAssertions.expectFieldToHaveError(
                    'formfields-name',
                    'Program rule variable name contains forbidden words: and, or, not.',
                    screen
                )
            })

            it('should show an error if name field is a duplicate', async () => {
                const existingName = 'ExistingVariableForDuplicateTest'
                const { screen } = await renderForm({
                    matchingExistingElementFilter: `name:ieq:${existingName}`,
                })
                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)
                await uiActions.enterName(existingName, screen)
                await userEvent.click(
                    screen.getByTestId('formfields-name-label')
                )
                uiAssertions.expectFieldToHaveError(
                    'formfields-name',
                    'A variable with this name already exists in this program.',
                    screen,
                    { skipClassCheck: true }
                )
                await uiActions.submitForm(screen)
                expect(createMock).not.toHaveBeenCalled()
            })
        })

        describe('Required fields', () => {
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
                    'program-field',
                    'Required',
                    screen
                )
            })
        })

        describe('Program "Add new" button', () => {
            it('should open a new tab when clicking "Add new" for programs instead of opening a drawer', async () => {
                const { screen } = await renderForm()

                const windowOpenSpy = jest
                    .spyOn(window, 'open')
                    .mockImplementation(() => null)

                // Flush the useEffect so LINK_ONLY_SECTIONS check runs and NewItemForm stays undefined
                await act(async () => {})

                const programField = screen.getByTestId('program-field')
                const addNewButton =
                    within(programField).getAllByRole('button')[1]
                await userEvent.click(addNewButton)

                expect(windowOpenSpy).toHaveBeenCalledWith(
                    expect.stringContaining('/programs/new'),
                    '_blank'
                )
                expect(
                    screen.queryByText('Add new Program')
                ).not.toBeInTheDocument()

                windowOpenSpy.mockRestore()
            })
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
                const programs = [
                    testProgram({
                        id: 'program1',
                        name: 'Test Program 1',
                        programTrackedEntityAttributes: [
                            {
                                trackedEntityAttribute:
                                    testTrackedEntityAttribute({
                                        id: 'attr1',
                                        displayName: 'Attribute 1',
                                    }),
                            },
                        ] as any,
                    }),
                ]

                const programStages = [
                    testProgramStage({
                        id: 'stage1',
                        displayName: 'Stage 1',
                    }),
                ]

                const dataElements = [
                    { id: 'de1', displayName: 'Data Element 1' },
                    { id: 'de2', displayName: 'Data Element 2' },
                ]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            programs: (type: any, params: any) => {
                                if (params?.id === 'program1') {
                                    return {
                                        programStages: [
                                            {
                                                id: 'stage1',
                                                programStageDataElements: [
                                                    {
                                                        dataElement:
                                                            dataElements[0],
                                                    },
                                                    {
                                                        dataElement:
                                                            dataElements[1],
                                                    },
                                                ],
                                            },
                                        ],
                                        programTrackedEntityAttributes: [
                                            {
                                                trackedEntityAttribute: {
                                                    id: 'attr1',
                                                    displayName: 'Attribute 1',
                                                },
                                            },
                                        ],
                                    }
                                }
                                return { programs }
                            },
                            programStages: () => ({ programStages }),
                            programRuleVariables: (type: any, params: any) => {
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
                                            programRuleVariables: [
                                                testProgramRuleVariable(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        programRuleVariables: [],
                                    }
                                }
                            },
                            ...customTestData,
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, programs, programStages, dataElements }
            }
        )

        describe('Field visibility', () => {
            it('should show program stage field when source type is DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE', async () => {
                const { screen } = await renderForm()

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE
                    )
                )
                await userEvent.click(sourceTypeOption)

                await screen.findByTestId('programStage-field')
                expect(screen.getByTestId('programStage-field')).toBeVisible()
            })

            it('should show data elements field after selecting program stage when source type is DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE', async () => {
                const { screen } = await renderForm()

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE
                    )
                )
                await userEvent.click(sourceTypeOption)

                const programStageField = await screen.findByTestId(
                    'programStage-field'
                )
                await uiActions.pickOptionFromSelect(
                    programStageField,
                    0,
                    screen
                )

                await screen.findByTestId('dataElement-field')
                expect(screen.getByTestId('dataElement-field')).toBeVisible()
            })
        })

        describe('Source type: DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE', () => {
            it('should not show tracked entity attribute and value type fields', async () => {
                const { screen } = await renderForm()

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE
                    )
                )
                await userEvent.click(sourceTypeOption)

                const programStageField = await screen.findByTestId(
                    'programStage-field'
                )
                await uiActions.pickOptionFromSelect(
                    programStageField,
                    0,
                    screen
                )

                expect(
                    screen.queryByTestId('trackedEntityAttribute-field')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('valueType-field')
                ).not.toBeInTheDocument()
            })
        })

        describe('Source type: DATAELEMENT_NEWEST_EVENT_PROGRAM', () => {
            it('should not show program stage, tracked entity attribute, and value type fields', async () => {
                const { screen } = await renderForm()

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM
                    )
                )
                await userEvent.click(sourceTypeOption)

                expect(
                    screen.queryByTestId('programStage-field')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('trackedEntityAttribute-field')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('valueType-field')
                ).not.toBeInTheDocument()

                await screen.findByTestId('dataElement-field')
                expect(screen.getByTestId('dataElement-field')).toBeVisible()
            })
        })

        describe('Source type: DATAELEMENT_CURRENT_EVENT', () => {
            it('should not show program stage, tracked entity attribute, and value type fields', async () => {
                const { screen } = await renderForm()

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT
                    )
                )
                await userEvent.click(sourceTypeOption)

                expect(
                    screen.queryByTestId('programStage-field')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('trackedEntityAttribute-field')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('valueType-field')
                ).not.toBeInTheDocument()

                await screen.findByTestId('dataElement-field')
                expect(screen.getByTestId('dataElement-field')).toBeVisible()
            })
        })

        describe('Source type: DATAELEMENT_PREVIOUS_EVENT', () => {
            it('should not show program stage, tracked entity attribute, and value type fields', async () => {
                const { screen } = await renderForm()

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.DATAELEMENT_PREVIOUS_EVENT
                    )
                )
                await userEvent.click(sourceTypeOption)

                expect(
                    screen.queryByTestId('programStage-field')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('trackedEntityAttribute-field')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('valueType-field')
                ).not.toBeInTheDocument()

                await screen.findByTestId('dataElement-field')
                expect(screen.getByTestId('dataElement-field')).toBeVisible()
            })
        })

        describe('Source type: CALCULATED_VALUE', () => {
            it('should not show program stage, tracked entity attribute, and data elements fields', async () => {
                const { screen } = await renderForm()

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.CALCULATED_VALUE
                    )
                )
                await userEvent.click(sourceTypeOption)

                expect(
                    screen.queryByTestId('programStage-field')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('trackedEntityAttribute-field')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('dataElement-field')
                ).not.toBeInTheDocument()

                await screen.findByTestId('valueType-field')
                expect(screen.getByTestId('valueType-field')).toBeVisible()
            })

            it('should auto-select value type to TEXT when source type is CALCULATED_VALUE', async () => {
                const { screen } = await renderForm()

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.CALCULATED_VALUE
                    )
                )
                await userEvent.click(sourceTypeOption)

                await screen.findByTestId('valueType-field')

                const valueTypeField = screen.getByTestId('valueType-field')
                const selectInput = valueTypeField.querySelector(
                    '[data-test="dhis2-uicore-select-input"]'
                )
                expect(selectInput).toHaveTextContent('Text')
            })
        })

        describe('Source type: TEI_ATTRIBUTE', () => {
            it('should not show program stage, value type, and data elements fields', async () => {
                const { screen } = await renderForm()

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.TEI_ATTRIBUTE
                    )
                )
                await userEvent.click(sourceTypeOption)

                expect(
                    screen.queryByTestId('programStage-field')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('valueType-field')
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByTestId('dataElement-field')
                ).not.toBeInTheDocument()

                await screen.findByTestId('trackedEntityAttribute-field')
                expect(
                    screen.getByTestId('trackedEntityAttribute-field')
                ).toBeVisible()
            })
        })

        describe('Form submission', () => {
            it('should submit the form with valid data for DATAELEMENT_CURRENT_EVENT', async () => {
                const aName = 'TestVariable123'
                const { screen, programs, dataElements } = await renderForm()

                await uiActions.enterName(aName, screen)

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT
                    )
                )
                await userEvent.click(sourceTypeOption)

                const dataElementField = await screen.findByTestId(
                    'dataElement-field'
                )
                await waitForLoadingToComplete(dataElementField)
                await waitForOptionsToPopulate(dataElementField, screen)
                await uiActions.pickOptionFromSelect(
                    dataElementField,
                    0,
                    screen
                )

                await uiActions.submitForm(screen)

                const expectedProgram = expect.objectContaining({
                    id: programs[0].id,
                })
                const expectedDataElement = expect.objectContaining({
                    id: dataElements[0].id,
                })
                const expectedData = {
                    name: aName,
                    program: expectedProgram,
                    programRuleVariableSourceType:
                        ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT,
                    dataElement: expectedDataElement,
                }
                const expectedCall = expect.objectContaining({
                    data: expect.objectContaining(expectedData),
                })
                expect(createMock).toHaveBeenCalledWith(expectedCall)
            })

            it('should submit form with CALCULATED_VALUE source type', async () => {
                const aName = 'CalculatedVariable'
                const { screen, programs } = await renderForm()

                await uiActions.enterName(aName, screen)

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.CALCULATED_VALUE
                    )
                )
                await userEvent.click(sourceTypeOption)

                await uiActions.submitForm(screen)

                const expectedProgram = expect.objectContaining({
                    id: programs[0].id,
                })
                const expectedData = {
                    name: aName,
                    program: expectedProgram,
                    programRuleVariableSourceType:
                        ProgramRuleVariableSourceType.CALCULATED_VALUE,
                    valueType: ValueType.TEXT,
                }
                const expectedCall = expect.objectContaining({
                    data: expect.objectContaining(expectedData),
                })
                expect(createMock).toHaveBeenCalledWith(expectedCall)
            })

            it('should submit form with TEI_ATTRIBUTE source type', async () => {
                const aName = 'TEIAttributeVariable'
                const { screen, programs } = await renderForm()

                await uiActions.enterName(aName, screen)

                const programField = screen.getByTestId('program-field')
                await uiActions.pickOptionFromSelect(programField, 0, screen)

                const sourceTypeOption = screen.getByLabelText(
                    getConstantTranslation(
                        ProgramRuleVariableSourceType.TEI_ATTRIBUTE
                    )
                )
                await userEvent.click(sourceTypeOption)

                const trackedEntityAttributeField = await screen.findByTestId(
                    'trackedEntityAttribute-field'
                )
                await waitForLoadingToComplete(trackedEntityAttributeField)
                await waitForOptionsToPopulate(
                    trackedEntityAttributeField,
                    screen
                )
                await uiActions.pickOptionFromSelect(
                    trackedEntityAttributeField,
                    0,
                    screen
                )

                await uiActions.submitForm(screen)

                const expectedProgram = expect.objectContaining({
                    id: programs[0].id,
                })
                const expectedTrackedEntityAttribute = expect.objectContaining({
                    id: 'attr1',
                })
                const expectedData = {
                    name: aName,
                    program: expectedProgram,
                    programRuleVariableSourceType:
                        ProgramRuleVariableSourceType.TEI_ATTRIBUTE,
                    trackedEntityAttribute: expectedTrackedEntityAttribute,
                }
                const expectedCall = expect.objectContaining({
                    data: expect.objectContaining(expectedData),
                })
                expect(createMock).toHaveBeenCalledWith(expectedCall)
            })
        })

        describe('Basic form structure', () => {
            it('contain all needed field', async () => {
                const { screen } = await renderForm()

                uiAssertions.expectNameFieldExist('', screen)

                expect(screen.getByTestId('program-field')).toBeVisible()
                expect(screen.getByTestId('sourceType-field')).toBeVisible()
                expect(
                    screen.getByTestId('useCodeForOptionSet-field')
                ).toBeVisible()
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

    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions, { customTestData = {} } = {}) => {
                const programs = [
                    testProgram({
                        id: 'program1',
                        name: 'Test Program 1',
                    }),
                ]

                const existingProgramRuleVariable = testProgramRuleVariable({
                    id: 'prv1',
                    name: 'Existing Variable',
                    program: programs[0],
                    programRuleVariableSourceType:
                        ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT,
                })

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/prv1`]}
                        customData={{
                            programs: () => ({ programs }),
                            programRuleVariables: (type: any, params: any) => {
                                if (type === 'read') {
                                    if (params?.id === 'prv1') {
                                        return existingProgramRuleVariable
                                    }
                                    if (params?.id === undefined) {
                                        return existingProgramRuleVariable
                                    }
                                }
                                if (type === 'update') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                            },
                            ...customTestData,
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, programs, existingProgramRuleVariable }
            }
        )

        describe('Program field disabled', () => {
            it('should disable program field in edit mode', async () => {
                const { screen } = await renderForm()

                const programField = await screen.findByTestId('program-field')
                const selectInput = programField.querySelector(
                    '[data-test="dhis2-uicore-select-input"]'
                ) as HTMLElement

                const isDisabled =
                    selectInput.hasAttribute('disabled') ||
                    selectInput.getAttribute('aria-disabled') === 'true' ||
                    selectInput.closest('[aria-disabled="true"]') !== null ||
                    selectInput.classList.contains('disabled')
                expect(isDisabled).toBe(true)
            })
        })

        it('contain all needed field prefilled', async () => {
            const { screen, existingProgramRuleVariable } = await renderForm()

            await screen.findByTestId('formfields-name')
            const nameField = screen.getByTestId('formfields-name')
            const nameInput = nameField.querySelector(
                'input'
            ) as HTMLInputElement

            expect(nameInput).toHaveValue(existingProgramRuleVariable.name)
        })
    })
})
