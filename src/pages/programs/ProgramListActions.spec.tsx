import { render, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/programs.json'
import { SECTIONS_MAP, useSystemSettingsStore } from '../../lib'
import { useSchemaStore } from '../../lib/schemas/schemaStore'
import { useCurrentUserStore } from '../../lib/user/currentUserStore'
import { testAccess, testOrgUnit, testPrograms } from '../../testUtils/builders'
import { defaultUserDataStoreData } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { SystemSettings } from '../../types'
import { Component } from './List'

const mockAlertShow = jest.fn()
jest.mock('@dhis2/app-runtime', () => {
    const originalModule = jest.requireActual('@dhis2/app-runtime')
    return {
        ...originalModule,
        useAlert: () => ({ show: mockAlertShow }),
    }
})

const section = SECTIONS_MAP.program

const setUpUserAndSchema = (authorities: string[] = []) => {
    useSchemaStore.getState().setSchemas({ [section.name]: schemaMock } as any)
    useCurrentUserStore.getState().setCurrentUser({
        organisationUnits: [testOrgUnit()] as any,
        authorities: new Set(authorities),
        name: 'Test user',
        email: 'test.user@example.com',
        settings: {},
    })
    useSystemSettingsStore.getState().setSystemSettings({} as SystemSettings)
}

const renderProgramsList = async ({
    authorities = [],
    access = testAccess({ write: true }),
    copyResourceHandler,
}: {
    authorities?: string[]
    access?: ReturnType<typeof testAccess>
    copyResourceHandler?: (...args: unknown[]) => unknown
} = {}) => {
    setUpUserAndSchema(authorities)
    const program = testPrograms({ access })
    const pager = { page: 1, total: 1, pageSize: 20, pageCount: 1 }

    const screen = render(
        <TestComponentWithRouter
            path="/programs"
            customData={{
                programs: (type: string, params: any) => {
                    if (type === 'read' && params?.id !== undefined) {
                        return program
                    }
                    if (type === 'read') {
                        return { programs: [program], pager }
                    }
                },
                [`programs/${program.id}/copy`]:
                    copyResourceHandler ??
                    (() => ({
                        httpStatus: 'Created',
                        httpStatusCode: 201,
                        status: 'OK',
                        message: `Program created: '${program.id}Clone'`,
                    })),
                userDataStore: defaultUserDataStoreData,
            }}
            routeOptions={{ handle: { section } }}
        >
            <Component />
        </TestComponentWithRouter>
    )

    await waitFor(() =>
        expect(
            screen.queryAllByTestId('dhis2-uicore-circularloader')
        ).toHaveLength(0)
    )

    const row = screen.getByTestId('section-list-row')
    return { screen, program, row }
}

describe('ProgramListActions - Clone program', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('disables Clone with a tooltip when the user lacks clone authorities', async () => {
        const { screen, row } = await renderProgramsList({ authorities: [] })
        const actionsMenu = await uiActions.openListElementActionsMenu(
            row,
            screen
        )
        const cloneItem = within(actionsMenu).getByText('Clone').closest('li')
        expect(cloneItem).toHaveClass('disabled')
    })

    it('disables Clone when the user has the authorities but no write access', async () => {
        const { screen, row } = await renderProgramsList({
            authorities: [
                'F_PROGRAM_PUBLIC_ADD',
                'F_PROGRAM_INDICATOR_PUBLIC_ADD',
            ],
            access: testAccess({ write: false }),
        })
        const actionsMenu = await uiActions.openListElementActionsMenu(
            row,
            screen
        )
        const cloneItem = within(actionsMenu).getByText('Clone').closest('li')
        expect(cloneItem).toHaveClass('disabled')
    })

    it('enables Clone and opens a modal defaulting the prefix to "Copy of"', async () => {
        const { screen, row } = await renderProgramsList({
            authorities: [
                'F_PROGRAM_PUBLIC_ADD',
                'F_PROGRAM_INDICATOR_PUBLIC_ADD',
            ],
        })
        const actionsMenu = await uiActions.openListElementActionsMenu(
            row,
            screen
        )
        const cloneModal = await uiActions.openModal(
            within(actionsMenu).getByText('Clone'),
            'clone-program-modal',
            screen
        )
        expect(within(cloneModal).getByRole('textbox')).toHaveValue('Copy of')
    })

    it('closes the modal without cloning when Cancel is clicked', async () => {
        const copyResourceHandler = jest.fn()
        const { screen, row } = await renderProgramsList({
            authorities: [
                'F_PROGRAM_PUBLIC_ADD',
                'F_PROGRAM_INDICATOR_PUBLIC_ADD',
            ],
            copyResourceHandler,
        })
        const actionsMenu = await uiActions.openListElementActionsMenu(
            row,
            screen
        )
        const cloneModal = await uiActions.openModal(
            within(actionsMenu).getByText('Clone'),
            'clone-program-modal',
            screen
        )
        await userEvent.click(
            within(cloneModal).getByTestId('clone-program-cancel-button')
        )
        expect(copyResourceHandler).not.toHaveBeenCalled()
        expect(
            screen.queryByTestId('clone-program-modal')
        ).not.toBeInTheDocument()
    })

    it('calls the copy endpoint with the prefix, then closes the modal and shows a success alert', async () => {
        const copyResourceHandler = jest.fn().mockReturnValue({
            httpStatus: 'Created',
            httpStatusCode: 201,
            status: 'OK',
            message: "Program created: 'newProgram01'",
        })
        const { screen, row } = await renderProgramsList({
            authorities: [
                'F_PROGRAM_PUBLIC_ADD',
                'F_PROGRAM_INDICATOR_PUBLIC_ADD',
            ],
            copyResourceHandler,
        })
        const actionsMenu = await uiActions.openListElementActionsMenu(
            row,
            screen
        )
        const cloneModal = await uiActions.openModal(
            within(actionsMenu).getByText('Clone'),
            'clone-program-modal',
            screen
        )
        await userEvent.click(
            within(cloneModal).getByTestId('clone-program-confirm-button')
        )

        await waitFor(() =>
            expect(copyResourceHandler).toHaveBeenCalledWith(
                'create',
                expect.objectContaining({ params: { prefix: 'Copy of' } }),
                expect.anything()
            )
        )
        await waitFor(() =>
            expect(
                screen.queryByTestId('clone-program-modal')
            ).not.toBeInTheDocument()
        )
        expect(mockAlertShow).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Program created: 'newProgram01'",
            })
        )
    })

    it('closes the modal and shows an error alert when cloning fails', async () => {
        const copyResourceHandler = jest.fn().mockImplementation(() =>
            Promise.reject({
                httpStatus: 'Forbidden',
                httpStatusCode: 403,
                status: 'ERROR',
                message: "You don't have write permissions for Program abc",
                errorCode: 'E1006',
            })
        )
        const { screen, row } = await renderProgramsList({
            authorities: [
                'F_PROGRAM_PUBLIC_ADD',
                'F_PROGRAM_INDICATOR_PUBLIC_ADD',
            ],
            copyResourceHandler,
        })
        const actionsMenu = await uiActions.openListElementActionsMenu(
            row,
            screen
        )
        const cloneModal = await uiActions.openModal(
            within(actionsMenu).getByText('Clone'),
            'clone-program-modal',
            screen
        )
        await userEvent.click(
            within(cloneModal).getByTestId('clone-program-confirm-button')
        )

        await waitFor(() =>
            expect(
                screen.queryByTestId('clone-program-modal')
            ).not.toBeInTheDocument()
        )
        expect(mockAlertShow).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining(
                    "You don't have write permissions for Program abc"
                ),
            })
        )
    })
})
