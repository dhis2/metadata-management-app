import { FetchError } from '@dhis2/app-runtime'
import { faker } from '@faker-js/faker'
import {
    render,
    waitForElementToBeRemoved,
    within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import organisationUnitLevelsSchema from '../../__mocks__/schema/organisationUnitLevels.json'
import { ModelSchemas, SchemaName, SECTIONS_MAP } from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import { useCurrentUserStore } from '../../lib/user/currentUserStore'
import {
    testAccess,
    testOrgUnit,
    testOrgUnitLevel,
} from '../../testUtils/builders'
import {
    defaultUserDataStoreData,
    error404,
} from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import type { OrganisationUnit } from '../../types/generated'
import { Component } from './List'

describe('Organisation unit list tests', () => {
    const originalWarn = console.warn
    jest.spyOn(console, 'warn').mockImplementation((value) => {
        if (!value.match(/No server timezone/)) {
            originalWarn(value)
        }
    })
    const updateOrgUnitLevelsMock = jest.fn()

    const renderList = async ({ customData = {} } = {}) => {
        const routeOptions = {
            handle: { section: SECTIONS_MAP.organisationUnitLevel },
        }
        useSchemaStore.getState().setSchemas({
            [SchemaName.organisationUnitLevel]: organisationUnitLevelsSchema,
        } as unknown as ModelSchemas)

        useCurrentUserStore.getState().setCurrentUser({
            organisationUnits: [testOrgUnit()] as OrganisationUnit[],
            authorities: new Set(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            settings: {},
        })

        const elements = [
            testOrgUnitLevel({ level: 1, access: testAccess({ write: true }) }),
            testOrgUnitLevel({ level: 2 }),
            testOrgUnitLevel({ level: 3 }),
            testOrgUnitLevel({ level: 4, offlineLevels: 3 }),
        ]

        const screen = render(
            <TestComponentWithRouter
                path={`/organisationUnitLevels`}
                customData={{
                    filledOrganisationUnitLevels: (type: any, params: any) => {
                        if (type === 'read') {
                            return elements
                        }
                        if (type === 'create') {
                            updateOrgUnitLevelsMock(params)
                            return { statusCode: 204 }
                        }
                    },
                    userDataStore: defaultUserDataStoreData,
                    ...customData,
                }}
                routeOptions={routeOptions}
            >
                <Component />
            </TestComponentWithRouter>
        )

        await waitForElementToBeRemoved(() =>
            screen.queryByTestId('dhis2-uicore-circularloader')
        )
        return { screen, elements }
    }

    it('should show all organisation unit levels', async () => {
        const { screen, elements } = await renderList()
        const tableRows = screen.getAllByTestId('section-list-row')

        expect(tableRows.length).toBe(elements.length)
        elements.forEach((element, index) => {
            expect(tableRows[index]).toHaveTextContent(element.displayName)
            if (element.offlineLevels) {
                expect(tableRows[index]).toHaveTextContent(
                    element.offlineLevels.toString()
                )
            }
        })
    })
    it('should edit an organisation unit level', async () => {
        const { screen, elements } = await renderList()
        const newName = 'brenda'
        const tableRows = screen.getAllByTestId('section-list-row')
        const rowActions = within(
            within(tableRows[0]).getByTestId('row-actions')
        ).getAllByRole('button')
        expect(rowActions).toHaveLength(2)
        await userEvent.click(rowActions[0])

        const cells = within(tableRows[0]).getAllByTestId(
            'dhis2-uicore-datatablecell'
        )
        const nameCell = cells[1]
        const orgUnitLevel = cells[2]
        const nameInput = within(
            within(nameCell).getByTestId('dhis2-uicore-input')
        ).getByRole('textbox')
        await userEvent.clear(nameInput)
        await userEvent.type(nameInput, newName)
        const availableOfflineLevels = await uiActions.openSingleSelect(
            within(orgUnitLevel).getByTestId('dhis2-uicore-singleselect'),
            screen
        )
        expect(availableOfflineLevels).toHaveLength(16)
        await userEvent.click(availableOfflineLevels[3])

        const rowActionsUpdated = within(
            within(tableRows[0]).getByTestId('row-actions')
        ).getAllByRole('button')
        expect(rowActionsUpdated).toHaveLength(2)
        expect(rowActionsUpdated[0]).toHaveTextContent('Save')
        await userEvent.click(rowActionsUpdated[0])
        const expectedUpdatedElement = {
            ...elements[0],
            name: newName,
            offlineLevels: 3,
        }
        expect(updateOrgUnitLevelsMock).toHaveBeenCalledTimes(1)
        expect(updateOrgUnitLevelsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    organisationUnitLevels: [
                        expectedUpdatedElement,
                        elements[1],
                        elements[2],
                        elements[3],
                    ],
                },
            })
        )
    })
    it('should show an error when org units levels can not be retrieved', async () => {
        const customData = {
            filledOrganisationUnitLevels: (type: any) => {
                if (type === 'read') {
                    return Promise.reject(new FetchError(error404))
                }
            },
        }

        const { screen } = await renderList({ customData })
        const tableRows = within(
            screen.getByTestId('dhis2-uicore-tablebody')
        ).getAllByTestId('dhis2-uicore-datatablerow')
        expect(tableRows).toHaveLength(1)
        const noticeBox = within(tableRows[0]).getByTestId(
            'dhis2-uicore-noticebox'
        )
        expect(noticeBox).toBeVisible()
        expect(noticeBox).toHaveTextContent(
            'An error occurred while loading the items.'
        )
    })
})
