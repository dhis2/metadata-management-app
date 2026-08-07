import { faker } from '@faker-js/faker'
import { render, within } from '@testing-library/react'
import React from 'react'
import schemaMock from '../../__mocks__/schema/indicators.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    testCustomAttribute,
    testIndicator,
    testIndicatorType,
    testLegendSet,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import resetAllMocks = jest.resetAllMocks

jest.setTimeout(40 * 1000) // set timeout to 40 seconds for these tests

const section = SECTIONS_MAP.indicator
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))
jest.mock(
    '../../components/metadataFormControls/ModelTransfer/BaseModelTransfer'
)

describe('Indicators form tests - Edit', () => {
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

    const renderForm = generateRenderer(
        { section, mockSchema },
        (
            routeOptions,
            {
                customTestData = {},
                indicatorOverwrites = {},
                matchingExistingElementFilter = undefined,
                id = randomDhis2Id(),
            } = {}
        ) => {
            const indicatorType = testIndicatorType()
            const indicatorTypes = [
                indicatorType,
                testIndicatorType(),
                testIndicatorType(),
            ]
            const attributes = [testCustomAttribute()]
            const legendSets = [testLegendSet(), testLegendSet()]
            const indicator = testIndicator({
                id,
                indicatorType,
                legendSets: [legendSets[0]],
                attributeValues: [
                    { attribute: attributes[0], value: 'attribute value' },
                ],
                ...indicatorOverwrites,
            })
            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}/:id`}
                    initialEntries={[`/${section.namePlural}/${id}`]}
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
                            indicatorGroups: [],
                        }),
                        indicators: (type: any, params: any) => {
                            if (type === 'json-patch') {
                                updateMock(params)
                                return { statusCode: 204 }
                            }
                            if (type === 'read') {
                                if (params?.id) {
                                    return indicator
                                }
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
                    <Edit />
                </TestComponentWithRouter>
            )
            return {
                screen,
                attributes,
                indicatorTypes,
                legendSets,
                indicator,
            }
        }
    )

    it('contain all needed field prefilled', async () => {
        const { screen, indicator, indicatorTypes, legendSets, attributes } =
            await renderForm({
                customTestData: {
                    'indicators/expression/description': () => ({
                        status: 'OK',
                        description: 'A description',
                    }),
                },
            })

        uiAssertions.expectNameFieldExist(indicator.name, screen)
        uiAssertions.expectInputFieldToExist(
            'shortName',
            indicator.shortName,
            screen
        )
        uiAssertions.expectCodeFieldExist(indicator.code, screen)
        uiAssertions.expectTextAreaFieldToExist(
            'description',
            indicator.description,
            screen
        )
        uiAssertions.expectInputFieldToExist('url', indicator.url, screen)
        uiAssertions.expectColorAndIconFieldToExist(screen)

        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('formfields-indicatortype'),
            {
                selected: indicator.indicatorType.displayName,
                options: indicatorTypes,
            },
            screen
        )

        const expectedDecimalsOptions = [
            { displayName: '<No value>' },
            { displayName: '0' },
            { displayName: '1' },
            { displayName: '2' },
            { displayName: '3' },
            { displayName: '4' },
            { displayName: '5' },
        ]
        await uiAssertions.expectSelectToExistWithOptions(
            screen.getByTestId('decimals-field'),
            {
                selected: indicator.decimals?.toString(),
                options: expectedDecimalsOptions,
            },
            screen
        )

        uiAssertions.expectCheckboxFieldToExist(
            'annualized',
            indicator.annualized,
            screen
        )

        expect(
            screen.getByTestId('numerator-expression-description')
        ).toHaveTextContent('A description')

        uiAssertions.expectTextAreaFieldToExist(
            'numerator',
            indicator.numerator,
            screen
        )

        expect(
            screen.getByTestId('denominator-expression-description')
        ).toHaveTextContent('A description')

        uiAssertions.expectTextAreaFieldToExist(
            'denominator',
            indicator.denominator,
            screen
        )
        uiAssertions.expectTextAreaFieldToExist(
            'numeratorDescription',
            indicator.numeratorDescription,
            screen
        )
        uiAssertions.expectTextAreaFieldToExist(
            'denominatorDescription',
            indicator.denominatorDescription,
            screen
        )

        uiAssertions.expectInputFieldToExist(
            'aggregateExportCategoryOptionCombo',
            indicator.aggregateExportCategoryOptionCombo,
            screen
        )
        uiAssertions.expectInputFieldToExist(
            'aggregateExportAttributeOptionCombo',
            indicator.aggregateExportAttributeOptionCombo,
            screen
        )

        await uiAssertions.expectTransferFieldToExistWithOptions(
            'legendSets-field',
            { lhs: [legendSets[1]], rhs: [legendSets[0]] },
            screen
        )

        attributes.forEach((attribute: { id: string }) => {
            const attributeInput = screen.getByTestId(
                `attribute-${attribute.id}`
            )
            expect(attributeInput).toBeVisible()
            expect(
                within(
                    within(attributeInput).getByTestId('dhis2-uicore-input')
                ).getByRole('textbox')
            ).toHaveValue(indicator.attributeValues[0].value)
        })
    })

    it('should submit the data successfully when a field is changed', async () => {
        const { screen, indicator } = await renderForm()
        const newName = faker.internet.userName()

        await uiActions.enterName(newName, screen, { paste: true })

        await uiActions.submitForm(screen)

        expect(updateMock).toHaveBeenCalledWith({
            data: [
                {
                    op: 'replace',
                    path: '/name',
                    value: newName,
                },
            ],
            id: indicator.id,
            params: undefined,
            resource: 'indicators',
        })
    })

    it('should do nothing when no field is changed', async () => {
        const { screen } = await renderForm()
        await uiActions.submitForm(screen)
        expect(updateMock).not.toHaveBeenCalled()
    })

    it('should have a cancel button with a link back to the list view', async () => {
        const { screen } = await renderForm()
        const cancelButton = screen.getByTestId('form-cancel-link')
        expect(cancelButton).toBeVisible()
        expect(cancelButton).toHaveAttribute('href', `/${section.namePlural}`)
    })

    it('update decimals to 0', async () => {
        const { screen, indicator } = await renderForm({
            indicatorOverwrites: { decimals: 1 },
        })
        await uiActions.pickOptionFromSelect(
            screen.getByTestId('decimals-field'),
            1,
            screen
        )
        await uiActions.submitForm(screen)
        expect(updateMock).toHaveBeenCalledWith({
            data: [{ op: 'replace', path: '/decimals', value: 0 }],
            id: indicator.id,
            params: undefined,
            resource: 'indicators',
        })
    })

    it('displays 0 decimals correctly', async () => {
        const { screen } = await renderForm({
            indicatorOverwrites: { decimals: 0 },
        })
        const decimals = within(
            screen.getByTestId('decimals-field')
        ).getByTestId('dhis2-uicore-select-input')
        expect(decimals).toBeVisible()
        expect(decimals).toHaveTextContent('0')
    })
})
