import {
    render,
    waitFor,
    waitForElementToBeRemoved,
    within,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { SECTIONS_MAP } from '../../lib'
import { testCategoryMapping, testProgram } from '../../testUtils/builders'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import type { Program } from '../../types/generated'
import { Component as ProgramIndicators } from './List'

const deleteOrgUnitMock = jest.fn()
const renderList = async ({
    programs = [] as Partial<Program>[],
    programsWithMappings = [] as Partial<Program>[],
}) => {
    const routeOptions = {
        handle: { section: SECTIONS_MAP.programDisaggregation },
    }

    const result = render(
        <TestComponentWithRouter
            path="/programDisaggregations"
            customData={{
                programs: (type: any, params: any) => {
                    if (type === 'read') {
                        return { programs }
                    }
                    if (type === 'json-patch') {
                        deleteOrgUnitMock(params)
                        return { statusCode: 204 }
                    }
                },
                'programs/gist': () => ({ programs: programsWithMappings }),
            }}
            routeOptions={routeOptions}
        >
            <ProgramIndicators />
        </TestComponentWithRouter>
    )

    await waitForElementToBeRemoved(() =>
        result.queryByTestId('dhis2-uicore-circularloader')
    )

    return result
}

describe('Program Indicators list', () => {
    beforeEach(() => {
        deleteOrgUnitMock.mockClear()
    })
    it('should show every program indicator', async () => {
        const programsWithMapping1 = testProgram({
            categoryMappings: [testCategoryMapping()],
        })
        const programsWithMapping2 = testProgram({
            categoryMappings: [testCategoryMapping()],
        })
        const screen = await renderList({
            programsWithMappings: [programsWithMapping1, programsWithMapping2],
        })
        const listPrograms = screen.getAllByTestId('program-with-mapping')
        expect(listPrograms).toHaveLength(2)
        expect(listPrograms[0]).toHaveTextContent(
            programsWithMapping1.displayName
        )
        expect(listPrograms[1]).toHaveTextContent(
            programsWithMapping2.displayName
        )
    })

    it('should show a message if there is no programs with mappings', async () => {
        const screen = await renderList({
            programsWithMappings: [],
        })
        const noProgramsMessage = screen.getByTestId(
            'no-programs-with-mappings'
        )
        expect(noProgramsMessage).toBeVisible()
    })

    it('should show an edit button which links to the edit page', async () => {
        const programsWithMapping = testProgram({
            categoryMappings: [testCategoryMapping()],
        })
        const screen = await renderList({
            programsWithMappings: [programsWithMapping],
        })
        const listProgram = screen.getByTestId('program-with-mapping')
        const editButton = within(listProgram).getByTestId('link-button')
        expect(editButton).toHaveTextContent('Edit')
        expect(editButton).toHaveAttribute(
            'href',
            `/programDisaggregations/${programsWithMapping.id}`
        )
    })

    it('should show a delete button which deletes the mapping', async () => {
        const programsWithMapping = testProgram({
            categoryMappings: [testCategoryMapping()],
        })
        const screen = await renderList({
            programsWithMappings: [programsWithMapping],
        })
        const listProgram = screen.getByTestId('program-with-mapping')
        const deleteButton = within(listProgram).getByTestId(
            'dhis2-uicore-button'
        )
        expect(deleteButton).toHaveTextContent('Delete')
        await userEvent.click(deleteButton)

        const deleteConfirmationModal = await screen.findByTestId(
            'delete-confirmation-modal'
        )
        expect(deleteConfirmationModal).toBeVisible()
        expect(deleteConfirmationModal).toHaveTextContent(
            `All mappings (${programsWithMapping.categoryMappings.length}) will be removed.`
        )

        await userEvent.click(
            within(deleteConfirmationModal).getByRole('button', {
                name: 'Delete',
            })
        )
        await waitFor(() => {
            expect(deleteOrgUnitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: programsWithMapping.id,
                    data: [
                        { op: 'replace', path: '/categoryMappings', value: [] },
                    ],
                })
            )
        })
    })

    it('should cancel the delete if button is pressed', async () => {
        const programsWithMapping = testProgram({
            categoryMappings: [testCategoryMapping()],
        })
        const screen = await renderList({
            programsWithMappings: [programsWithMapping],
        })
        const listProgram = screen.getByTestId('program-with-mapping')
        const deleteButton = within(listProgram).getByTestId(
            'dhis2-uicore-button'
        )
        expect(deleteButton).toHaveTextContent('Delete')
        await userEvent.click(deleteButton)

        const deleteConfirmationModal = await screen.findByTestId(
            'delete-confirmation-modal'
        )
        expect(deleteConfirmationModal).toBeVisible()

        await userEvent.click(
            within(deleteConfirmationModal).getByRole('button', {
                name: 'Cancel',
            })
        )
        await waitFor(() => {
            expect(
                screen.queryByTestId('delete-confirmation-modal')
            ).not.toBeInTheDocument()
        })
    })

    it('should show a single select dropdown to add a program mapping', async () => {
        const programWithoutMapping1 = testProgram()
        const programWithMapping = testProgram({
            categoryMappings: [testCategoryMapping()],
        })
        const programWithoutMapping2 = testProgram()
        const screen = await renderList({
            programs: [
                programWithoutMapping1,
                programWithMapping,
                programWithoutMapping2,
            ],
        })
        const selectAProgramDropdown = screen.getByTestId(
            'dhis2-uicore-select-input'
        )
        await userEvent.click(selectAProgramDropdown)
        const programs = await screen.findAllByTestId(
            'dhis2-uicore-singleselectoption'
        )
        expect(programs).toHaveLength(3)
        expect(programs[0]).toHaveTextContent(
            programWithoutMapping1.displayName
        )
        expect(programs[0]).not.toHaveClass('disabled')
        expect(programs[1]).toHaveTextContent(programWithMapping.displayName)
        expect(programs[1]).toHaveClass('disabled')
        expect(programs[2]).toHaveTextContent(
            programWithoutMapping2.displayName
        )
        expect(programs[2]).not.toHaveClass('disabled')
    })
})
