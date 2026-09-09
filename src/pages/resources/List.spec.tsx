import { render, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import documentSchemaMock from '../../__mocks__/schema/document.json'
import { SECTIONS_MAP } from '../../lib'
import { testAccess, testResources } from '../../testUtils/builders'
import {
    defaultUserDataStoreData,
    generateRenderer,
} from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import {
    generateDefaultListItemsTests,
    generateDefaultListMultiActionsTests,
    generateDefaultListFiltersTests,
} from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.document
const mockSchema = documentSchemaMock

jest.mock('focus-trap-react', () => ({
    FocusTrap: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

/* Row-actions are fully customised for resources (no Edit/Translate, adds
"View resource"), so the shared row-actions suite does not apply - the
resource-specific tests below cover the menu instead. */
const defaultListTestConfig = {
    section,
    mockSchema,
    ComponentToTest: Component,
    generateRandomElement: testResources,
    customData: {},
}
generateDefaultListItemsTests(defaultListTestConfig)
generateDefaultListMultiActionsTests(defaultListTestConfig)
generateDefaultListFiltersTests(defaultListTestConfig)

describe('Resources (documents) specific list tests', () => {
    const renderList = generateRenderer(
        { section, mockSchema },
        (
            routeOptions,
            { elements = [testResources(), testResources()] } = {}
        ) => {
            const pager = {
                page: 1,
                total: elements.length,
                pageSize: 20,
                pageCount: Math.ceil(elements.length / 20),
            }

            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        [section.namePlural]: (type: any, params: any) => {
                            if (type === 'read' && params.id !== undefined) {
                                if (params.id.match(/translations/)) {
                                    return { translations: [] }
                                }
                                return elements.find(
                                    (el: Record<any, any>) =>
                                        el.id === params.id
                                )
                            }
                            if (type === 'read') {
                                return {
                                    [section.namePlural]: elements,
                                    pager,
                                }
                            }
                            if (type === 'delete') {
                                return { statusCode: 204 }
                            }
                        },
                        userDataStore: defaultUserDataStoreData,
                    }}
                    routeOptions={routeOptions}
                >
                    <Component />
                </TestComponentWithRouter>
            )
            return { screen, elements, pager }
        }
    )

    it('shows the resource-specific row actions', async () => {
        const { screen } = await renderList({
            elements: [testResources({ external: true })],
        })
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        expect(actionsMenu).toHaveTextContent('View resource')
        expect(actionsMenu).toHaveTextContent('Show details')
        expect(actionsMenu).toHaveTextContent('Sharing settings')
        expect(actionsMenu).toHaveTextContent('Delete')
    })

    it('offers "Edit" for URL (external) resources', async () => {
        const { screen } = await renderList({
            elements: [
                testResources({
                    external: true,
                    access: testAccess({ write: true }),
                }),
            ],
        })
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        expect(actionsMenu).toHaveTextContent('Edit')
    })

    it('does not offer "Edit" for uploaded-file resources', async () => {
        const { screen } = await renderList({
            elements: [
                testResources({
                    external: false,
                    access: testAccess({ write: true }),
                }),
            ],
        })
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        expect(actionsMenu).not.toHaveTextContent('Edit')
    })

    it('opens the resource data endpoint in a new tab from "View resource"', async () => {
        const openSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)
        const resource = testResources()
        const { screen } = await renderList({ elements: [resource] })
        const tableRows = screen.getAllByTestId('section-list-row')
        const actionsMenu = await uiActions.openListElementActionsMenu(
            tableRows[0],
            screen
        )
        await userEvent.click(within(actionsMenu).getByText('View resource'))
        expect(openSpy).toHaveBeenCalledWith(
            `http://dhis2-imaginary-test-server/api/documents/${resource.id}/data`,
            '_blank',
            'noopener,noreferrer'
        )
        openSpy.mockRestore()
    })
})
