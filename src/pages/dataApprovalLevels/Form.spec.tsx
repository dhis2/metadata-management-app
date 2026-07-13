import { faker } from '@faker-js/faker'
import { act, render, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import categoryOptionGroupSetSchemaMock from '../../__mocks__/schema/categoriesOptionGroupSetsSchema.json'
import schemaMock from '../../__mocks__/schema/dataApprovalLevel.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { ModelSchemas, SECTIONS_MAP } from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import {
    randomDhis2Id,
    randomLongString,
    testDataApprovalLevelForm,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.dataApprovalLevel
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

const testOrgUnitLevel = ({
    level = 1,
    displayName = faker.word.words(),
} = {}) => ({
    level,
    displayName,
})

const testCategoryOptionGroupSet = ({
    id = randomDhis2Id(),
    displayName = faker.word.words(),
} = {}) => ({
    id,
    displayName,
})

describe('Data approval levels form tests', () => {
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
                const organisationUnitLevels = [
                    testOrgUnitLevel({ level: 1, displayName: 'National' }),
                    testOrgUnitLevel({ level: 2, displayName: 'District' }),
                ]
                const categoryOptionGroupSets = [
                    testCategoryOptionGroupSet(),
                    testCategoryOptionGroupSet(),
                ]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            organisationUnitLevels: () => ({
                                organisationUnitLevels,
                                pager: {},
                            }),
                            categoryOptionGroupSets: () => ({
                                categoryOptionGroupSets,
                                pager: {},
                            }),
                            attributes: () => ({ attributes: [] }),
                            dataApprovalLevels: (type: any, params: any) => {
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
                                            dataApprovalLevels: [
                                                testDataApprovalLevelForm(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        dataApprovalLevels: [],
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
                    organisationUnitLevels,
                    categoryOptionGroupSets,
                }
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

        it('should show an error if name field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(231)
            await uiActions.enterName(longText, screen)
            await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
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

        it('should open the category option group set new form in a drawer when clicking the "Add new" button', async () => {
            const { screen } = await renderForm()

            useSchemaStore.getState().setSchemas({
                ...useSchemaStore.getState().schemas,
                categoryOptionGroupSet: categoryOptionGroupSetSchemaMock,
            } as unknown as ModelSchemas)

            // Flush the useEffect dynamic import in ModelSingleSelectRefreshableFormField
            await act(async () => {})

            const categoryOptionGroupSetField = screen.getByTestId(
                'formfields-categoryoptiongroupset'
            )

            const addNewButton = within(
                categoryOptionGroupSetField
            ).getAllByRole('button')[1]
            await userEvent.click(addNewButton)

            expect(
                await screen.findByText('Add new Category option group set')
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('categoryOptionGroupSetNewForm')
            ).toBeInTheDocument()
            expect(
                within(
                    screen.getByTestId('categoryOptionGroupSetNewForm')
                ).getByTestId('form-submit-button')
            ).toHaveTextContent('Save and close')
        })

        it('should show an error if the org unit level and category option group set combination already exists', async () => {
            const { screen } = await renderForm({
                matchingExistingElementFilter: 'orgUnitLevel:eq:1',
            })

            await uiActions.enterName(faker.word.words(), screen)
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-orgunitlevel'),
                0,
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-categoryoptiongroupset'),
                0,
                screen
            )

            await uiActions.submitForm(screen)

            uiAssertions.expectFieldToHaveError(
                'formfields-categoryoptiongroupset',
                'An approval level for this organisation unit level and category option group set combination already exists.',
                screen
            )
            expect(createMock).not.toHaveBeenCalled()
        })
    })

    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const organisationUnitLevels = [
                    testOrgUnitLevel({ level: 1, displayName: 'National' }),
                    testOrgUnitLevel({ level: 2, displayName: 'District' }),
                ]
                const categoryOptionGroupSets = [
                    testCategoryOptionGroupSet(),
                    testCategoryOptionGroupSet(),
                ]

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            organisationUnitLevels: () => ({
                                organisationUnitLevels,
                                pager: {},
                            }),
                            categoryOptionGroupSets: () => ({
                                categoryOptionGroupSets,
                                pager: {},
                            }),
                            dataApprovalLevels: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                return {
                                    pager: { total: 0 },
                                    dataApprovalLevels: [],
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
                    organisationUnitLevels,
                    categoryOptionGroupSets,
                }
            }
        )

        it('should contain all needed fields', async () => {
            const { screen } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            expect(
                screen.getByTestId('formfields-orgunitlevel')
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('formfields-categoryoptiongroupset')
            ).toBeInTheDocument()
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

        it('should submit the data', async () => {
            const { screen, organisationUnitLevels } = await renderForm()
            const aName = faker.word.words()

            await uiActions.enterName(aName, screen)
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-orgunitlevel'),
                0,
                screen
            )

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        orgUnitLevel: organisationUnitLevels[0].level,
                    }),
                })
            )
        })
    })

    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions, { id = randomDhis2Id() } = {}) => {
                const organisationUnitLevels = [
                    testOrgUnitLevel({ level: 1, displayName: 'National' }),
                    testOrgUnitLevel({ level: 2, displayName: 'District' }),
                    testOrgUnitLevel({ level: 3, displayName: 'Facility' }),
                ]
                const categoryOptionGroupSets = [
                    testCategoryOptionGroupSet(),
                    testCategoryOptionGroupSet(),
                ]
                const dataApprovalLevel = testDataApprovalLevelForm({
                    id,
                    orgUnitLevel: organisationUnitLevels[0].level,
                    categoryOptionGroupSet: categoryOptionGroupSets[0],
                })

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            organisationUnitLevels: () => ({
                                organisationUnitLevels,
                                pager: {},
                            }),
                            categoryOptionGroupSets: () => ({
                                categoryOptionGroupSets,
                                pager: {},
                            }),
                            dataApprovalLevels: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read' && params?.id) {
                                    return dataApprovalLevel
                                }
                                return {
                                    pager: { total: 0 },
                                    dataApprovalLevels: [],
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
                    organisationUnitLevels,
                    categoryOptionGroupSets,
                    dataApprovalLevel,
                }
            }
        )

        it('should contain all needed fields prefilled', async () => {
            const { screen, dataApprovalLevel } = await renderForm()
            uiAssertions.expectNameFieldExist(dataApprovalLevel.name, screen)
        })

        it('should submit updated data when a field is changed', async () => {
            const { screen, dataApprovalLevel } = await renderForm()
            const newName = faker.word.words()

            await uiActions.enterName(newName, screen)
            await uiActions.submitForm(screen)

            await waitFor(() =>
                expect(updateMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: dataApprovalLevel.id,
                        data: [
                            {
                                op: 'replace',
                                path: '/name',
                                value: newName,
                            },
                        ],
                    })
                )
            )
        })

        it('should do nothing when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})
