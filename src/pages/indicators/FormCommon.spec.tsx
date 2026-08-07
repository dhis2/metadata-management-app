import { faker } from '@faker-js/faker'
import { act, render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/indicators.json'
import indicatorTypesSchemaMock from '../../__mocks__/schema/indicatorTypes.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { ModelSchemas, SECTIONS_MAP } from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import {
    randomLongString,
    testCustomAttribute,
    testIndicator,
    testIndicatorGroup,
    testIndicatorType,
    testLegendSet,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

jest.setTimeout(40 * 1000) // set timeout to 40 seconds for these tests

const section = SECTIONS_MAP.indicator
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Indicators form tests - Common', () => {
    const createMock = jest.fn()

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
            const indicatorTypes = [
                testIndicatorType(),
                testIndicatorType(),
                testIndicatorType(),
            ]
            const legendSets = [testLegendSet(), testLegendSet()]
            const indicatorGroups = [testIndicatorGroup(), testIndicatorGroup()]
            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        attributes: () => ({ attributes }),
                        indicatorTypes: () => ({ indicatorTypes }),
                        legendSets: () => ({
                            legendSets,
                            pager: {
                                page: 1,
                                total: 2,
                                pageSize: 20,
                                pageCount: 1,
                            },
                        }),
                        indicatorGroups: () => ({
                            pager: {},
                            indicatorGroups,
                        }),
                        indicators: (type: any, params: any) => {
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
                                        indicators: [testIndicator()],
                                    }
                                }
                                return {
                                    pager: { total: 0 },
                                    indicators: [],
                                }
                            }
                        },
                        'indicators/expression/description': () => ({
                            status: 'OK',
                        }),
                        ...customTestData,
                    }}
                    routeOptions={routeOptions}
                >
                    <New />
                </TestComponentWithRouter>
            )
            return { screen, attributes, indicatorTypes, legendSets }
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
            'formfields-shortName',
            'Required',
            screen
        )
        uiAssertions.expectFieldToHaveError(
            'formfields-indicatortype',
            'Required',
            screen
        )
        uiAssertions.expectFieldToHaveError(
            'formfields-numerator',
            'Required',
            screen
        )
        uiAssertions.expectFieldToHaveError(
            'formfields-denominator',
            'Required',
            screen
        )
        uiAssertions.expectFieldToHaveError(
            'formfields-numeratorDescription',
            'Required',
            screen
        )
        uiAssertions.expectFieldToHaveError(
            'formfields-denominatorDescription',
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

    it('should show an error if code field is a duplicate', async () => {
        const existingCode = faker.science.chemicalElement().symbol
        const { screen } = await renderForm({
            matchingExistingElementFilter: `code:ieq:${existingCode}`,
        })
        await uiAssertions.expectCodeToErrorWhenDuplicate(existingCode, screen)
        await uiActions.submitForm(screen)
        expect(createMock).not.toHaveBeenCalled()
    })

    it('should show an error if numerator expression is malformed', async () => {
        const { screen } = await renderForm({
            customTestData: {
                'indicators/expression/description': () => ({
                    status: 'ERROR',
                }),
            },
        })
        const anExpression = faker.finance.routingNumber()
        await userEvent.click(
            screen.getByTestId('edit-numerator-expression-button')
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

    it('should not change the numerator expression if cancel is pressed', async () => {
        const { screen } = await renderForm({
            customTestData: {
                'indicators/expression/description': () => ({
                    status: 'OK',
                }),
            },
        })
        const anExpression = faker.finance.routingNumber()
        await userEvent.click(
            screen.getByTestId('edit-numerator-expression-button')
        )
        const editModal = await screen.findByTestId(`expression-builder-modal`)
        await uiActions.enterExpressionInModal(editModal, anExpression, screen)

        expect(
            within(editModal).getByTestId('apply-expression-button')
        ).toBeEnabled()
        await userEvent.click(
            within(editModal).getByTestId('cancel-expression-button')
        )
        uiAssertions.expectTextAreaFieldToExist('numerator', null, screen)
    })

    it('should show an error if denominator expression is malformed', async () => {
        const { screen } = await renderForm({
            customTestData: {
                'indicators/expression/description': () => ({
                    status: 'ERROR',
                }),
            },
        })

        const anExpression = faker.finance.routingNumber()
        await userEvent.click(
            screen.getByTestId('edit-numerator-expression-button')
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

    it('should not change the denominator expression if cancel is pressed', async () => {
        const { screen } = await renderForm({
            customTestData: {
                'indicators/expression/description': () => ({
                    status: 'OK',
                }),
            },
        })
        const anExpression = faker.finance.routingNumber()
        await userEvent.click(
            screen.getByTestId('edit-denominator-expression-button')
        )
        const editModal = await screen.findByTestId(`expression-builder-modal`)
        await uiActions.enterExpressionInModal(editModal, anExpression, screen)

        expect(
            within(editModal).getByTestId('apply-expression-button')
        ).toBeEnabled()
        await userEvent.click(
            within(editModal).getByTestId('cancel-expression-button')
        )
        uiAssertions.expectTextAreaFieldToExist('denominator', null, screen)
    })

    it('should show an error if URL field is invalid', async () => {
        const { screen } = await renderForm()
        const invalidUrl = 'not-a-valid-url'
        await uiActions.enterInputFieldValue('url', invalidUrl, screen, {
            paste: true,
        })
        await uiActions.submitForm(screen)

        uiAssertions.expectFieldToHaveError(
            'formfields-url',
            'Invalid url',
            screen
        )
        expect(createMock).not.toHaveBeenCalled()
    })

    it('should show an error if decimals is out of range', async () => {
        const { screen } = await renderForm()
        await uiActions.pickOptionFromSelect(
            screen.getByTestId('decimals-field'),
            7,
            screen
        )
        await uiActions.submitForm(screen)
        expect(createMock).not.toHaveBeenCalled()
    })

    it('should open the indicator type new form in a drawer when clicking the "Add new" button', async () => {
        const { screen } = await renderForm()

        useSchemaStore.getState().setSchemas({
            ...useSchemaStore.getState().schemas,
            indicatorType: indicatorTypesSchemaMock,
        } as unknown as ModelSchemas)

        // Flush the useEffect dynamic import in ModelSingleSelectRefreshableFormField
        await act(async () => {})

        const indicatorTypeField = screen.getByTestId(
            'formfields-indicatortype'
        )

        const addNewButton =
            within(indicatorTypeField).getAllByRole('button')[1]
        await userEvent.click(addNewButton)

        expect(
            await screen.findByText('Add new Indicator type')
        ).toBeInTheDocument()
        expect(screen.getByTestId('indicatorTypeNewForm')).toBeInTheDocument()
        expect(
            within(screen.getByTestId('indicatorTypeNewForm')).getByTestId(
                'form-submit-button'
            )
        ).toHaveTextContent('Save and close')
    })
})
