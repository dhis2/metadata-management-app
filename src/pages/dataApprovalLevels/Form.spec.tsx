import { faker } from '@faker-js/faker'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/dataApprovalLevel.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
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
            uiAssertions.expectCodeFieldExist('', screen)
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
            const aCode = faker.science.chemicalElement().symbol

            await uiActions.enterName(aName, screen)
            await uiActions.enterCode(aCode, screen)
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
                        code: aCode,
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
            const newCode = faker.science.chemicalElement().symbol

            await uiActions.enterCode(newCode, screen)
            await uiActions.submitForm(screen)

            await waitFor(() =>
                expect(updateMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: dataApprovalLevel.id,
                        data: [
                            {
                                op: 'replace',
                                path: '/code',
                                value: newCode,
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
