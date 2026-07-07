import { faker } from '@faker-js/faker'
import { act, render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/relationshipTypes.json'
import trackedEntityTypesSchemaMock from '../../__mocks__/schema/trackedEntityTypes.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { ModelSchemas, SECTIONS_MAP } from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import {
    randomLongString,
    testCustomAttribute,
    testProgram,
    testRelationshipType,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.relationshipType
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Relationship types form tests', () => {
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
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            trackedEntityTypes: () => ({
                                trackedEntityTypes: [],
                            }),
                            programs: () => ({ programs: [] }),
                            relationshipTypes: (type: any, params: any) => {
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
                                            relationshipTypes: [
                                                testRelationshipType(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        relationshipTypes: [],
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
                'formfields-fromToName',
                'Required',
                screen
            )
            uiAssertions.expectFieldToHaveError(
                'from-constraint-field',
                'Required',
                screen
            )
            uiAssertions.expectFieldToHaveError(
                'to-constraint-field',
                'Required',
                screen
            )
        })

        it('should show an error if name field is too long', async () => {
            const { screen } = await renderForm()
            const longName = randomLongString(231)
            await uiActions.enterName(longName, screen)
            await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
        })

        it('should show an error if code field is too long', async () => {
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
            const existingCode = faker.string.alpha(5)
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

        it('should require fromToName field', async () => {
            const { screen } = await renderForm()
            await uiActions.enterName('Test Name', screen)
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
            uiAssertions.expectFieldToHaveError(
                'formfields-fromToName',
                'Required',
                screen
            )
        })

        it('should require toFromName field when bidirectional is checked', async () => {
            const { screen } = await renderForm()
            const aName = faker.company.name()
            const aFromToName = faker.lorem.word()

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'fromToName',
                aFromToName,
                screen
            )
            await uiActions.clickOnCheckboxField('bidirectional', screen)

            const toFromNameField = await screen.findByTestId(
                'formfields-toFromName'
            )
            expect(toFromNameField).toBeInTheDocument()

            await uiActions.submitForm(screen)

            expect(createMock).not.toHaveBeenCalled()
            uiAssertions.expectFieldToHaveError(
                'formfields-toFromName',
                'Relationship name seen from receiving entity is required when bidirectional is checked',
                screen
            )
        })

        it('should show an error if fromToName field is too long', async () => {
            const { screen } = await renderForm()
            const longFromToName = randomLongString(256)
            await uiActions.enterName('Test Name', screen)
            await uiActions.enterInputFieldValue(
                'fromToName',
                longFromToName,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
            const field = screen.getByTestId('formfields-fromToName')
            const validation = field.querySelector('[data-test*="validation"]')
            if (validation) {
                expect(validation).toBeInTheDocument()
            }
        })

        it('should show toFromName field only when bidirectional is checked', async () => {
            const { screen } = await renderForm()

            const hiddenField = screen.queryByTestId('formfields-toFromName')
            expect(hiddenField).not.toBeVisible()

            await uiActions.clickOnCheckboxField('bidirectional', screen)

            const toFromNameField = await screen.findByTestId(
                'formfields-toFromName'
            )
            expect(toFromNameField).toBeVisible()
        })

        it('should open the tracked entity type new form in a drawer when clicking the "Add new" button', async () => {
            const { screen } = await renderForm()

            await uiActions.clickButtonGroupOption(
                'from-constraint-field',
                'TRACKED_ENTITY_INSTANCE',
                screen
            )

            await screen.findByTestId('from-tracked-entity-type-selector')

            useSchemaStore.getState().setSchemas({
                ...useSchemaStore.getState().schemas,
                trackedEntityType: trackedEntityTypesSchemaMock,
            } as unknown as ModelSchemas)

            await act(async () => {})

            const tetField = screen.getByTestId(
                'from-tracked-entity-type-selector'
            )
            const addNewButton = within(tetField).getAllByRole('button')[1]
            await userEvent.click(addNewButton)

            expect(
                await screen.findByText('Add new Tracked entity type')
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('trackedEntityTypeNewForm')
            ).toBeInTheDocument()
            expect(
                within(
                    screen.getByTestId('trackedEntityTypeNewForm')
                ).getByTestId('form-submit-button')
            ).toHaveTextContent('Save and close')
        })

        it('should open a new tab when clicking "Add new" for programs instead of opening a drawer', async () => {
            const { screen } = await renderForm()

            const windowOpenSpy = jest
                .spyOn(window, 'open')
                .mockImplementation(() => null)

            await uiActions.clickButtonGroupOption(
                'from-constraint-field',
                'PROGRAM_INSTANCE',
                screen
            )

            await screen.findByTestId('from-program-selector')

            // Flush the useEffect so LINK_ONLY_SECTIONS check runs and NewItemForm stays undefined
            await act(async () => {})

            const programField = screen.getByTestId('from-program-selector')
            const addNewButton = within(programField).getAllByRole('button')[1]
            await userEvent.click(addNewButton)

            expect(windowOpenSpy).toHaveBeenCalledWith(
                expect.stringContaining('/programs/new'),
                '_blank'
            )

            windowOpenSpy.mockRestore()
        })
    })

    describe('New Relationship type form', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const programs = [testProgram(), testProgram()]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            programs: () => ({ programs }),
                            relationshipTypes: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    return {
                                        pager: { total: 0 },
                                        relationshipTypes: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, attributes, programs }
            }
        )

        it('contain all needed field', async () => {
            const { screen } = await renderForm()

            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', null, screen)
            uiAssertions.expectCheckboxFieldToExist(
                'bidirectional',
                false,
                screen
            )
            uiAssertions.expectInputFieldToExist('fromToName', '', screen)
            uiAssertions.expectButtonGroupToExistWithOptions(
                'from-constraint-field',
                [
                    {
                        value: 'PROGRAM_STAGE_INSTANCE',
                        label: 'Event',
                    },
                    {
                        value: 'PROGRAM_INSTANCE',
                        label: 'Enrollment',
                    },
                    {
                        value: 'TRACKED_ENTITY_INSTANCE',
                        label: 'Tracked entity',
                    },
                ],
                screen
            )
            uiAssertions.expectButtonGroupToExistWithOptions(
                'to-constraint-field',
                [
                    {
                        value: 'PROGRAM_STAGE_INSTANCE',
                        label: 'Event',
                    },
                    {
                        value: 'PROGRAM_INSTANCE',
                        label: 'Enrollment',
                    },
                    {
                        value: 'TRACKED_ENTITY_INSTANCE',
                        label: 'Tracked entity',
                    },
                ],
                screen
            )
        })

        it('should submit the data', async () => {
            const { screen, programs } = await renderForm()
            const aName = faker.company.name()
            const aCode = faker.string.alpha(5)
            const aDescription = faker.lorem.sentence()
            const aFromToName = faker.lorem.word()

            await uiActions.enterName(aName, screen)
            await uiActions.enterCode(aCode, screen)
            await uiActions.enterInputFieldValue(
                'description',
                aDescription,
                screen
            )
            await uiActions.enterInputFieldValue(
                'fromToName',
                aFromToName,
                screen
            )

            await uiActions.clickButtonGroupOption(
                'from-constraint-field',
                'PROGRAM_INSTANCE',
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('from-program-selector'),
                0,
                screen
            )
            await uiActions.clickButtonGroupOption(
                'to-constraint-field',
                'PROGRAM_INSTANCE',
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('to-program-selector'),
                0,
                screen
            )
            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        code: aCode,
                        description: aDescription,
                        fromToName: aFromToName,
                        bidirectional: false,
                        fromConstraint: expect.objectContaining({
                            relationshipEntity: 'PROGRAM_INSTANCE',
                            program: expect.objectContaining({
                                id: programs[0].id,
                            }),
                        }),
                        toConstraint: expect.objectContaining({
                            relationshipEntity: 'PROGRAM_INSTANCE',
                            program: expect.objectContaining({
                                id: programs[0].id,
                            }),
                        }),
                    }),
                })
            )
        })
    })

    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const programs = [testProgram(), testProgram()]
                const relationshipType = testRelationshipType()
                const id = relationshipType.id

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            programs: () => ({ programs }),
                            relationshipTypes: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read' && params?.id) {
                                    return relationshipType
                                }
                                return {
                                    pager: { total: 0 },
                                    relationshipTypes: [],
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, relationshipType, programs }
            }
        )

        it('contain all needed field prefilled', async () => {
            const { screen, relationshipType } = await renderForm()

            uiAssertions.expectNameFieldExist(relationshipType.name, screen)
            uiAssertions.expectCodeFieldExist(relationshipType.code, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                relationshipType.description,
                screen
            )
            uiAssertions.expectCheckboxFieldToExist(
                'bidirectional',
                relationshipType.bidirectional || false,
                screen
            )
            uiAssertions.expectInputFieldToExist(
                'fromToName',
                relationshipType.fromToName,
                screen
            )

            if (relationshipType.bidirectional) {
                uiAssertions.expectInputFieldToExist(
                    'toFromName',
                    relationshipType.toFromName,
                    screen
                )
            }
        })

        it('should do nothing and return to the list view on success when no field is changed', async () => {
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
