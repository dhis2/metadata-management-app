import { FetchError } from '@dhis2/app-runtime'
import { render, waitFor, within, RenderResult } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { SECTIONS_MAP } from '../../../lib'
import TestComponentWithRouter from '../../../testUtils/TestComponentWithRouter'
import { DeleteAction } from './DeleteAction'

const section = SECTIONS_MAP.categoryCombo

const renderDeleteAction = (deleteResolver: () => Promise<unknown>) => {
    const onDeleteSuccess = jest.fn()
    const onCancel = jest.fn()
    const result = render(
        <TestComponentWithRouter
            path="/categoryCombos"
            customData={{
                categoryCombos: (type: string) =>
                    type === 'delete' ? deleteResolver() : Promise.resolve({}),
            }}
        >
            <DeleteAction
                disabled={false}
                modelId="abcdefghij1"
                modelDisplayName="Test combo"
                onCancel={onCancel}
                onDeleteSuccess={onDeleteSuccess}
                section={section}
            />
        </TestComponentWithRouter>
    )
    return { result, onDeleteSuccess, onCancel }
}

const confirmDeletion = async (result: RenderResult) => {
    await userEvent.click(result.getByText('Delete'))
    const modal = result.getByTestId('delete-confirmation-modal')
    await userEvent.click(
        within(modal).getByRole('button', { name: 'Confirm deletion' })
    )
    return modal
}

describe('<DeleteAction />', () => {
    it('shows a "still processing" warning when the request times out', async () => {
        // A dropped connection / gateway timeout surfaces as a network error.
        const { result, onDeleteSuccess } = renderDeleteAction(() =>
            Promise.reject(
                new FetchError({
                    type: 'network',
                    message: 'An unknown network error occurred',
                    details: {},
                })
            )
        )

        const modal = await confirmDeletion(result)

        await waitFor(() =>
            expect(
                within(modal).getByText(
                    'The request timed out. The operation may still be processing in the background, refresh to confirm.'
                )
            ).toBeVisible()
        )
        expect(onDeleteSuccess).not.toHaveBeenCalled()
    })

    it('shows a hard failure with the backend messages for a non-timeout error', async () => {
        const { result, onDeleteSuccess } = renderDeleteAction(() =>
            Promise.reject(
                new FetchError({
                    type: 'unknown',
                    message: 'Conflict',
                    details: {
                        httpStatusCode: 409,
                        message: 'Could not delete object',
                        response: {
                            errorReports: [
                                { message: 'Object is still referenced' },
                            ],
                        },
                    } as FetchError['details'],
                })
            )
        )

        const modal = await confirmDeletion(result)

        await waitFor(() =>
            expect(within(modal).getByText(/Failed to delete/)).toBeVisible()
        )
        expect(
            within(modal).getByText('Object is still referenced')
        ).toBeVisible()
        expect(onDeleteSuccess).not.toHaveBeenCalled()
    })
})
