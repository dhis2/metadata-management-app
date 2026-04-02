import { faker } from '@faker-js/faker'
import { render } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/programIndicatorGroupsSchema.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    randomLongString,
    testFormProgramIndicatorGroup,
    testProgramIndicator,
    testProgramIndicatorGroup,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.programIndicatorGroup
const mockSchema = schemaMock
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Program indicator groups form tests', () => {
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
                const programIndicators = [
                    testProgramIndicator(),
                    testProgramIndicator(),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            programIndicators: (type: any) => {
                                if (type === 'read') {
                                    return {
                                        pager: {},
                                        programIndicators: programIndicators,
                                    }
                                }
                            },
                            programIndicatorGroups: (
                                type: any,
                                params: any
                            ) => {
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
                                            programIndicatorGroups: [
                                                testProgramIndicatorGroup(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        programIndicatorGroups: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, programIndicators }
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
    })
    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (
                routeOptions,
                { matchingExistingElementFilter = undefined } = {}
            ) => {
                const programIndicators = [
                    testProgramIndicator(),
                    testProgramIndicator(),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            programIndicators: (type: any) => {
                                if (type === 'read') {
                                    return {
                                        pager: {},
                                        programIndicators: programIndicators,
                                    }
                                }
                            },
                            programIndicatorGroups: (
                                type: any,
                                params: any
                            ) => {
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
                                            programIndicatorGroups: [
                                                testProgramIndicatorGroup(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        programIndicatorGroups: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, programIndicators }
            }
        )
        it('contain all needed field', async () => {
            const { screen, programIndicators } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTransferFieldToExistWithOptions(
                'program-indicators-transfer',
                { lhs: programIndicators, rhs: [] },
                screen
            )
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
            const { screen, programIndicators } = await renderForm()
            const aName = faker.internet.userName()
            const aCode = faker.science.chemicalElement().symbol
            const selectedPiIndicator = programIndicators[1]
            await uiActions.enterName(aName, screen)
            await uiActions.enterCode(aCode, screen)
            await uiActions.pickOptionInTransfer(
                'program-indicators-transfer',
                selectedPiIndicator.displayName,
                screen
            )
            await uiActions.submitForm(screen)
            expect(createMock).toHaveBeenCalledTimes(1)
            expect(createMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    id: undefined,
                    data: {
                        id: undefined,
                        name: aName,
                        code: aCode,
                        programIndicators: [selectedPiIndicator],
                    },
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
                    id = randomDhis2Id(),
                    matchingExistingElementFilter = undefined,
                } = {}
            ) => {
                const programIndicators = [
                    testProgramIndicator(),
                    testProgramIndicator(),
                    testProgramIndicator(),
                    testProgramIndicator(),
                    testProgramIndicator(),
                ]
                const programIndicatorGroup = testFormProgramIndicatorGroup({
                    id,
                    programIndicators: [
                        programIndicators[0],
                        programIndicators[2],
                    ],
                })
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            programIndicators: (type: any) => {
                                if (type === 'read') {
                                    return {
                                        pager: {},
                                        programIndicators: programIndicators,
                                    }
                                }
                            },
                            programIndicatorGroups: (
                                type: any,
                                params: any
                            ) => {
                                if (type === 'read') {
                                    if (params?.id) {
                                        return programIndicatorGroup
                                    }
                                    if (
                                        params?.params?.filter?.includes(
                                            matchingExistingElementFilter
                                        )
                                    ) {
                                        return {
                                            pager: { total: 1 },
                                            // this is mocking that the request comes back with any value
                                            programIndicatorGroups: [
                                                testProgramIndicatorGroup(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        programIndicatorGroups: [],
                                    }
                                }
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, programIndicators, programIndicatorGroup }
            }
        )
        it('contain all needed field prefilled', async () => {
            const { screen, programIndicators, programIndicatorGroup } =
                await renderForm()
            uiAssertions.expectNameFieldExist(
                programIndicatorGroup.name,
                screen
            )
            uiAssertions.expectCodeFieldExist(
                programIndicatorGroup.code,
                screen
            )
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'program-indicators-transfer',
                {
                    lhs: [
                        programIndicators[1],
                        programIndicators[3],
                        programIndicators[4],
                    ],
                    rhs: [programIndicators[0], programIndicators[2]],
                },
                screen
            )
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
            const { screen, programIndicators, programIndicatorGroup } =
                await renderForm()
            const newCode = faker.science.chemicalElement().symbol
            const additionalPiIndicator = programIndicators[1]
            await uiActions.clearInputField('code', screen)
            await uiActions.enterCode(newCode, screen)
            await uiActions.pickOptionInTransfer(
                'program-indicators-transfer',
                additionalPiIndicator.displayName,
                screen
            )
            await uiActions.submitForm(screen)
            expect(updateMock).toHaveBeenCalledTimes(1)
            const patchPayload = updateMock.mock.calls[0][0]
            expect(patchPayload).toEqual(
                expect.objectContaining({
                    id: programIndicatorGroup.id,
                })
            )
            const operations = patchPayload.data as Array<{
                op: string
                path: string
                value: unknown
            }>
            expect(operations).toHaveLength(2)
            expect(operations).toContainEqual({
                op: 'replace',
                path: '/code',
                value: newCode,
            })
            const piPatch = operations.find(
                (o) => o.path === '/programIndicators'
            )
            expect(piPatch).toMatchObject({ op: 'replace' })
            const piIds = (piPatch!.value as { id: string }[]).map((p) => p.id)
            const sortedPiIds = [...piIds].sort((a, b) => a.localeCompare(b))
            const expectedSortedIds = [
                programIndicators[0].id,
                programIndicators[1].id,
                programIndicators[2].id,
            ].sort((a, b) => a.localeCompare(b))
            expect(sortedPiIds).toEqual(expectedSortedIds)
        })
        it('should do nothing and return to the list view on success when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})
