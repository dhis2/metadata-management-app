import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { Form } from 'react-final-form'
import { ComponentWithProvider } from '../../../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../../../testUtils/uiActions'
import { RecipientSection } from './RecipientSection'

const programsResolver = () =>
    Promise.resolve({
        programs: [
            {
                id: 'program-id',
                displayName: 'Test program',
                programTrackedEntityAttributes: [],
            },
        ],
        pager: { page: 1, total: 1, pageSize: 50, pageCount: 1 },
    })

const renderRecipientSection = ({
    isTrackerProgram,
    isStageNotification = false,
    initialValues = {},
}: {
    isTrackerProgram: boolean
    isStageNotification?: boolean
    initialValues?: Record<string, unknown>
}) => {
    const screen = render(
        <ComponentWithProvider
            dataForCustomProvider={{ programs: programsResolver }}
        >
            <Form onSubmit={() => undefined} initialValues={initialValues}>
                {() => (
                    <RecipientSection
                        isStageNotification={isStageNotification}
                        isTrackerProgram={isTrackerProgram}
                    />
                )}
            </Form>
        </ComponentWithProvider>
    )

    const openRecipientOptions = async () =>
        (
            await uiActions.openSingleSelect(
                screen.getByTestId('formfields-notification-recipient'),
                screen
            )
        ).map((option) => option.textContent)

    return { ...screen, openRecipientOptions }
}

describe('<RecipientSection />', () => {
    describe('recipient option visibility', () => {
        it('hides "Tracked entity" and "Program attribute" for an event program', async () => {
            const { openRecipientOptions } = renderRecipientSection({
                isTrackerProgram: false,
            })

            const options = await openRecipientOptions()

            expect(options).not.toContain('Tracked entity')
            expect(options).not.toContain('Program attribute')
            expect(options).toContain('User group')
        })

        it('shows "Tracked entity" and "Program attribute" for a tracker program', async () => {
            const { openRecipientOptions } = renderRecipientSection({
                isTrackerProgram: true,
            })

            const options = await openRecipientOptions()

            expect(options).toContain('Tracked entity')
            expect(options).toContain('Program attribute')
        })
    })

    describe('clearing a stale stored recipient on load', () => {
        it('clears a stored TRACKED_ENTITY_INSTANCE recipient for an event program', async () => {
            const { queryByTestId } = renderRecipientSection({
                isTrackerProgram: false,
                initialValues: {
                    notificationRecipient: 'TRACKED_ENTITY_INSTANCE',
                },
            })

            // Delivery channels only render while a tracked-entity/org-unit
            // recipient is selected, so their removal proves the stale value
            // was cleared.
            await waitFor(() =>
                expect(
                    queryByTestId('formfields-sendSms')
                ).not.toBeInTheDocument()
            )
        })

        it('clears a stored PROGRAM_ATTRIBUTE recipient for an event program', async () => {
            const { queryByTestId } = renderRecipientSection({
                isTrackerProgram: false,
                initialValues: {
                    notificationRecipient: 'PROGRAM_ATTRIBUTE',
                    program: { id: 'program-id' },
                },
            })

            await waitFor(() =>
                expect(
                    queryByTestId('formfields-recipientProgramAttribute')
                ).not.toBeInTheDocument()
            )
        })

        it('keeps a stored TRACKED_ENTITY_INSTANCE recipient for a tracker program', async () => {
            const { findByTestId } = renderRecipientSection({
                isTrackerProgram: true,
                initialValues: {
                    notificationRecipient: 'TRACKED_ENTITY_INSTANCE',
                },
            })

            expect(await findByTestId('formfields-sendSms')).toBeInTheDocument()
        })
    })
})
