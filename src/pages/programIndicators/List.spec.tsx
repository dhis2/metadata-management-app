import { faker } from '@faker-js/faker'
import {
    render,
    waitForElementToBeRemoved,
    within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/programIndicatorsSchema.json'
import { ModelSchemas, SECTIONS_MAP } from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import { useCurrentUserStore } from '../../lib/user/currentUserStore'
import {
    testOrgUnit,
    testProgram,
    testProgramIndicator,
} from '../../testUtils/builders'
import { defaultUserDataStoreData } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import type { OrganisationUnit } from '../../types/generated'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.programIndicator
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testProgramIndicator
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})

describe('Program indicators additional tests', () => {
    const getElementsMock = jest.fn()

    const renderList = async () => {
        const routeOptions = {
            handle: { section },
        }
        useSchemaStore.getState().setSchemas({
            [section.name]: mockSchema,
        } as unknown as ModelSchemas)
        useCurrentUserStore.getState().setCurrentUser({
            organisationUnits: [testOrgUnit()] as OrganisationUnit[],
            authorities: new Set(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            settings: {},
        })

        const elements = [generateRandomElement()]
        const pager = {
            page: 1,
            total: elements.length,
            pageSize: 20,
            pageCount: Math.ceil(elements.length / 20),
        }

        const programs = [testProgram(), testProgram()]
        const screen = render(
            <TestComponentWithRouter
                path={`/${section.namePlural}`}
                customData={{
                    [section.namePlural]: (type: any, params: any) => {
                        if (type === 'read') {
                            getElementsMock(params)
                            return {
                                [section.namePlural]: elements,
                                pager,
                            }
                        }
                    },
                    userDataStore: defaultUserDataStoreData,
                    programs: { programs, pager },
                }}
                routeOptions={routeOptions}
            >
                <ComponentToTest />
            </TestComponentWithRouter>
        )

        await waitForElementToBeRemoved(() =>
            screen.queryByTestId('dhis2-uicore-circularloader')
        )
        return { screen, elements, pager, programs }
    }

    beforeEach(() => {
        resetAllMocks()
    })

    it('should filter by programs', async () => {
        const { screen, programs } = await renderList()
        const filtersWrapper = screen.getByTestId('filters-wrapper')
        const programsFilter =
            within(filtersWrapper).getAllByTestId('dynamic-filter')[0]
        const programOptions = await uiActions.openSingleSelect(
            programsFilter,
            screen
        )
        expect(programOptions).toHaveLength(3)
        expect(programOptions[0]).toHaveTextContent('All')
        expect(programOptions[1]).toHaveTextContent(programs[0].displayName)
        expect(programOptions[2]).toHaveTextContent(programs[1].displayName)
        await userEvent.click(programOptions[1])
        expect(getElementsMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                params: expect.objectContaining({
                    filter: expect.arrayContaining([
                        `program.id:in:[${programs[0].id}]`,
                    ]),
                }),
            })
        )
    })
})
