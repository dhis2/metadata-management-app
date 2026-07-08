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

const section = SECTIONS_MAP.predictorGroup
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Predictor groups form tests', () => {
    const createMock = jest.fn()
    const updateMock = jest.fn()

    beforeEach(() => {
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
            (routeOptions) => {
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            predictors: () => ({ predictors: [], pager: {} }),
                            predictorGroups: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                return {
                                    pager: { total: 0 },
                                    predictorGroups: [],
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

        it('should not submit when a required value is missing', async () => {
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
            await uiActions.enterInputFieldValue('code', longText, screen)
            await uiAssertions.expectInputToErrorWhenExceedsLength(
                'code',
                50,
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
                            predictors: () => ({ predictors, pager: {} }),
                            predictorGroups: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                return {
                                    pager: { total: 0 },
                                    predictorGroups: [],
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

        it('contains all needed fields', async () => {
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
            const aName = faker.company.name()
            const aCode = faker.science.chemicalElement().symbol
            const aDescription = faker.company.buzzPhrase()

            await uiActions.enterName(aName, screen)
            await uiActions.enterCode(aCode, screen)
            await uiActions.enterInputFieldValue(
                'description',
                aDescription,
                screen
            )
            await uiActions.pickOptionInTransfer(
                'predictors-transfer',
                predictors[1].displayName,
                screen
            )
            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        code: aCode,
                        description: aDescription,
                        predictors: [
                            expect.objectContaining({ id: predictors[1].id }),
                        ],
                    }),
                })
            )
        })
    })

    describe('Edit', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions, { id = randomDhis2Id() } = {}) => {
                const predictors = [
                    testPredictorList(),
                    testPredictorList(),
                    testPredictorList(),
                ]
                const predictorGroup = testPredictorGroup({
                    id,
                    name: faker.company.name(),
                    predictors: [predictors[1]],
                })
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            predictors: () => ({ predictors, pager: {} }),
                            predictorGroups: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return predictorGroup
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
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, predictors, predictorGroup }
            }
        )

        it('contains all needed fields prefilled', async () => {
            const { screen, predictors, predictorGroup } = await renderForm()

            uiAssertions.expectNameFieldExist(predictorGroup.name, screen)
            uiAssertions.expectCodeFieldExist(predictorGroup.code, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                predictorGroup.description,
                screen
            )
            await uiAssertions.expectTransferFieldToExistWithOptions(
                'predictors-transfer',
                {
                    lhs: [predictors[0], predictors[2]],
                    rhs: [predictors[1]],
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

        it('should do nothing and return to the list view on success when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })

        it('should submit the data when a field is changed', async () => {
            const { screen, predictorGroup } = await renderForm()
            const newName = faker.company.name()
            await uiActions.enterName(newName, screen)
            await uiActions.submitForm(screen)
            expect(updateMock).toHaveBeenCalledWith({
                data: [{ op: 'replace', path: '/name', value: newName }],
                id: predictorGroup.id,
                params: undefined,
                resource: 'predictorGroups',
            })
        })
    })
})
