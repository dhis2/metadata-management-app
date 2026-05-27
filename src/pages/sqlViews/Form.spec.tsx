import { faker } from '@faker-js/faker'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/sqlView.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { getConstantTranslation, SECTIONS_MAP } from '../../lib'
import {
    randomLongString,
    testCustomAttribute,
    testSqlViews,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { SqlView } from '../../types/generated'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.sqlView
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('SQL Views form tests', () => {
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

    describe('New', () => {
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            sqlViews: (type: any, params: any) => {
                                if (type === 'create') {
                                    createMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    return { pager: { total: 0 }, sqlViews: [] }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, attributes }
            }
        )

        it('should contain all needed fields', async () => {
            const { screen, attributes } = await renderForm()

            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectTextAreaFieldToExist('description', '', screen)

            const cacheStrategyField = screen.getByTestId(
                'formfields-cacheStrategy'
            )
            const selectInput = within(cacheStrategyField).getByTestId(
                'dhis2-uicore-select-input'
            )
            expect(selectInput).toHaveTextContent(
                getConstantTranslation(
                    SqlView.cacheStrategy.RESPECT_SYSTEM_SETTING
                )
            )

            uiAssertions.expectRadioFieldToExist(
                'type',
                [
                    { label: 'View: SQL', checked: true },
                    { label: 'Materialized view:', checked: false },
                    { label: 'Query only:', checked: false },
                ],
                screen
            )

            uiAssertions.expectTextAreaFieldToExist('sqlQuery', '', screen)

            attributes.forEach((attribute: { id: string }) => {
                expect(
                    screen.getByTestId(`attribute-${attribute.id}`)
                ).toBeVisible()
            })
        })

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

        it('should show query variable buttons only when type is QUERY', async () => {
            const { screen } = await renderForm()

            // View type selected initially — buttons not rendered
            uiAssertions.expectRadioFieldToExist(
                'type',
                [
                    { label: 'View: SQL', checked: true },
                    { label: 'Materialized view:', checked: false },
                    { label: 'Query only:', checked: false },
                ],
                screen
            )
            expect(
                screen.queryByTestId('queryVariable_button__current_user_id')
            ).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('queryVariable_button__current_username')
            ).not.toBeInTheDocument()

            // Select QUERY (third radio)
            const typeField = screen.getByTestId('formfields-type')
            const typeRadios = within(typeField).getAllByRole('radio')
            await userEvent.click(typeRadios[2])

            expect(
                screen.getByTestId('queryVariable_button__current_user_id')
            ).toBeVisible()
            expect(
                screen.getByTestId('queryVariable_button__current_username')
            ).toBeVisible()

            // Switch to MATERIALIZED_VIEW (second radio) — buttons should disappear
            await userEvent.click(typeRadios[1])

            expect(
                screen.queryByTestId('queryVariable_button__current_user_id')
            ).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('queryVariable_button__current_username')
            ).not.toBeInTheDocument()
        })

        it('should show an error if name field is too long', async () => {
            const { screen } = await renderForm()
            const longText = randomLongString(231)
            await uiActions.enterName(longText, screen)
            await uiAssertions.expectNameToErrorWhenExceedsLength(screen)
            await uiActions.submitForm(screen)
            expect(createMock).not.toHaveBeenCalled()
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
            const { screen } = await renderForm()
            const aName = faker.animal.bird()
            const aDescription = faker.company.buzzPhrase()
            const aSqlQuery = `SELECT * FROM ${faker.database.column()}`

            await uiActions.enterName(aName, screen)
            await uiActions.enterInputFieldValue(
                'description',
                aDescription,
                screen
            )

            const cacheStrategyField = screen.getByTestId(
                'formfields-cacheStrategy'
            )
            await uiActions.pickOptionFromSelect(cacheStrategyField, 0, screen)

            const typeField = screen.getByTestId('formfields-type')
            const typeRadios = within(typeField).getAllByRole('radio')
            await userEvent.click(typeRadios[0])

            await uiActions.enterInputFieldValue('sqlQuery', aSqlQuery, screen)

            await uiActions.submitForm(screen)

            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        description: aDescription,
                        type: SqlView.type.VIEW,
                        sqlQuery: aSqlQuery,
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
                const sqlView = testSqlViews({
                    type: SqlView.type.VIEW,
                    cacheStrategy: SqlView.cacheStrategy.NO_CACHE,
                    sqlQuery: faker.lorem.sentence(),
                    description: faker.lorem.sentence(),
                })
                const id = sqlView.id

                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[`/${section.namePlural}/${id}`]}
                        customData={{
                            attributes: () => ({ attributes }),
                            sqlViews: (type: any, params: any) => {
                                if (type === 'json-patch') {
                                    updateMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return sqlView
                                    }
                                    return { pager: { total: 0 }, sqlViews: [] }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, attributes, sqlView }
            }
        )

        it('should contain all needed fields prefilled', async () => {
            const { screen, sqlView } = await renderForm()

            uiAssertions.expectNameFieldExist(sqlView.name, screen)
            uiAssertions.expectTextAreaFieldToExist(
                'description',
                sqlView.description ?? '',
                screen
            )
            const cacheStrategyField = screen.getByTestId(
                'formfields-cacheStrategy'
            )
            const selectInput = within(cacheStrategyField).getByTestId(
                'dhis2-uicore-select-input'
            )
            expect(selectInput).toHaveTextContent(
                getConstantTranslation(sqlView.cacheStrategy)
            )

            uiAssertions.expectRadioFieldToExist(
                'type',
                [
                    { label: 'View: SQL', checked: true },
                    { label: 'Materialized view:', checked: false },
                    { label: 'Query only:', checked: false },
                ],
                screen
            )

            uiAssertions.expectTextAreaFieldToExist(
                'sqlQuery',
                sqlView.sqlQuery,
                screen
            )
        })

        it('should have type radio group disabled in edit mode', async () => {
            const { screen } = await renderForm()
            const typeField = screen.getByTestId('formfields-type')
            const radioButtons = within(typeField).getAllByRole('radio')
            radioButtons.forEach((radio) => {
                expect(radio).toBeDisabled()
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

        it('should do nothing and return to the list view on success when no field is changed', async () => {
            const { screen } = await renderForm()
            await uiActions.submitForm(screen)
            expect(updateMock).not.toHaveBeenCalled()
        })
    })
})
