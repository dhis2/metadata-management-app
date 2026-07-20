import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Form } from 'react-final-form'
import { VariableSelectionBox } from './VariableSelectionBox'

const renderVariableSelectionBox = ({
    programType,
}: {
    programType?: string
}) => {
    const elementRef = { current: null }

    return render(
        <Form
            onSubmit={jest.fn()}
            render={() => (
                <VariableSelectionBox
                    elementRef={elementRef}
                    clearValidationState={jest.fn()}
                    programType={programType}
                    type="programRule"
                />
            )}
        />
    )
}

describe('VariableSelectionBox', () => {
    it('hides variables for event programs', async () => {
        renderVariableSelectionBox({ programType: 'WITHOUT_REGISTRATION' })

        await userEvent.click(screen.getByText('Variables'))

        expect(screen.queryByText('V{enrollment_date}')).not.toBeInTheDocument()
        expect(
            screen.queryByText('V{enrollment_status}')
        ).not.toBeInTheDocument()
        expect(screen.queryByText('V{incident_date}')).not.toBeInTheDocument()
        expect(screen.getByText('V{current_date}')).toBeInTheDocument()
    })

    it('shows enrollment variables for tracker programs', async () => {
        renderVariableSelectionBox({ programType: 'WITH_REGISTRATION' })

        await userEvent.click(screen.getByText('Variables'))

        expect(screen.getByText('V{enrollment_date}')).toBeInTheDocument()
        expect(screen.getByText('V{enrollment_status}')).toBeInTheDocument()
        expect(screen.getByText('V{incident_date}')).toBeInTheDocument()
    })

    it('defaults to hiding enrollment variables when programType is not provided', async () => {
        renderVariableSelectionBox({ programType: undefined })

        await userEvent.click(screen.getByText('Variables'))

        expect(screen.queryByText('V{enrollment_date}')).not.toBeInTheDocument()
    })
})
