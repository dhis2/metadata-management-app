import { faker } from '@faker-js/faker'
import { render } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/predictorGroups.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    randomLongString,
    testPredictorGroup,
    testPredictorList,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.predictorGroup
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Predictor groups form tests', () => {
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
                const predictors = [testPredictorList(), testPredictorList()]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            predictors: (type: any) => {
                                if (type === 'read') {
                                    return { pager: {}, predictors }
                                }
                            },
                            predictorGroups: (type: any, params: any) => {
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
                                            predictorGroups: [
                                                testPredictorGroup(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        predictorGroups: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, predictors }
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
            const longText = randomLongString(51)
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
            (routeOptions) => {
                const predictors = [
                    testPredictorList(),
                    testPredictorList(),
                    testPredictorList(),
                ]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            predictors: (type: any) => {
                                if (type === 'read') {
                                    return { pager: {}, predictors }
                                }
                            },
                            predictorGroups: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    return {
                                        pager: { total: 0 },
                                        predictorGroups: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, predictors }
            }
        )

        it('should contain all needed fields', async () => {
            const { screen, predictors } = await renderForm()
            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectCodeFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', '', screen)
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'predictors-transfer',
                { lhs: predictors, rhs: [] },
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
            const { screen, predictors } = await renderForm()
            const aName = faker.animal.bird()
            const aCode = faker.science.chemicalElement().symbol

            await uiActions.enterName(aName, screen)
            await uiActions.enterCode(aCode, screen)
            await uiActions.pickOptionInTransfer(
                'predictors-transfer',
                predictors[1].displayName,
                screen
            )
            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledTimes(1)
            expect(createMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        code: aCode,
                        predictors: [predictors[1]],
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
                    id = randomDhis2Id(),
                    matchingExistingElementFilter = undefined,
                } = {}
            ) => {
                const predictors = [
                    testPredictorList(),
                    testPredictorList(),
                    testPredictorList(),
                ]
                const aName = faker.company.name()
                const aDescription = faker.company.buzzPhrase()
                const predictorGroup = testPredictorGroup({
                    id,
                    name: aName,
                    description: aDescription,
                    predictors: [predictors[0], predictors[1]],
                })

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            predictors: (type: any) => {
                                if (type === 'read') {
                                    return { pager: {}, predictors }
                                }
                            },
                            predictorGroups: (type: any, params: any) => {
                                if (type === 'read') {
                                    if (params?.id) {
                                        return predictorGroup
                                    }
                                    if (
                                        params?.params?.filter?.includes(
                                            matchingExistingElementFilter
                                        )
                                    ) {
                                        return {
                                            pager: { total: 1 },
                                            predictorGroups: [
                                                testPredictorGroup(),
                                            ],
                                        }
                                    }
                                    return {
                                        pager: { total: 0 },
                                        predictorGroups: [],
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
                return {
                    screen,
                    predictors,
                    predictorGroup,
                    aName,
                    aDescription,
                }
            }
        )

        it('should contain all needed fields prefilled', async () => {
            const { screen, predictors, predictorGroup, aName, aDescription } =
                await renderForm()

            uiAssertions.expectNameFieldExist(aName, screen)
            uiAssertions.expectCodeFieldExist(predictorGroup.code, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                aDescription,
                screen
            )
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'predictors-transfer',
                {
                    lhs: [predictors[2]],
                    rhs: [predictors[0], predictors[1]],
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

        it('should submit changes when a field is changed', async () => {
            const { screen, predictors, predictorGroup } = await renderForm()
            const newCode = faker.science.chemicalElement().symbol

            await uiActions.clearInputField('code', screen)
            await uiActions.enterCode(newCode, screen)
            await uiActions.pickOptionInTransfer(
                'predictors-transfer',
                predictors[2].displayName,
                screen
            )
            await uiActions.submitForm(screen)

            expect(updateMock).toHaveBeenCalledTimes(1)
            const patchPayload = updateMock.mock.calls[0][0]
            expect(patchPayload).toEqual(
                expect.objectContaining({ id: predictorGroup.id })
            )

            const operations = patchPayload.data as Array<{
                op: string
                path: string
                value: unknown
            }>
            expect(operations).toContainEqual({
                op: 'replace',
                path: '/code',
                value: newCode,
            })

            const predictorsPatch = operations.find(
                (o) => o.path === '/predictors'
            )
            expect(predictorsPatch).toMatchObject({ op: 'replace' })
            const patchedIds = (predictorsPatch!.value as { id: string }[]).map(
                (p) => p.id
            )
            const expectedIds = [
                predictors[0].id,
                predictors[1].id,
                predictors[2].id,
            ].sort((a, b) => a.localeCompare(b))
            expect([...patchedIds].sort((a, b) => a.localeCompare(b))).toEqual(
                expectedIds
            )
        })

        it('should do nothing when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})
