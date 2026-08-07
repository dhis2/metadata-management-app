import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { BaseModelTransfer } from './BaseModelTransfer'

// Real, dedicated coverage of BaseModelTransfer against the actual
// @dhis2/ui Transfer component - this is the component
// integration-style Form.spec.tsx tests mock out (see
// __mocks__/BaseModelTransfer.tsx) to avoid repeating the same real-DOM
// interaction across every page that embeds a transfer field.
const models = [
    { id: 'a1', displayName: 'Alpha' },
    { id: 'a2', displayName: 'Beta' },
    { id: 'a3', displayName: 'Gamma' },
]

describe('BaseModelTransfer', () => {
    it('renders available options on the left and selected options on the right', () => {
        render(
            <BaseModelTransfer
                dataTest="my-transfer"
                available={models}
                selected={[models[1]]}
                onChange={jest.fn()}
            />
        )

        const lhs = screen.getByTestId('my-transfer-leftside')
        const rhs = screen.getByTestId('my-transfer-rightside')

        expect(within(lhs).getByText('Alpha')).toBeVisible()
        expect(within(lhs).getByText('Gamma')).toBeVisible()
        expect(within(lhs).queryByText('Beta')).not.toBeInTheDocument()
        expect(within(rhs).getByText('Beta')).toBeVisible()
    })

    it('calls onChange with the full model when an available option is moved to selected', async () => {
        const onChange = jest.fn()
        render(
            <BaseModelTransfer
                dataTest="my-transfer"
                available={models}
                selected={[]}
                onChange={onChange}
            />
        )

        await userEvent.dblClick(screen.getByText('Beta'))

        expect(onChange).toHaveBeenCalledWith({ selected: [models[1]] })
    })

    it('calls onChange with the remaining full models when a selected option is moved back to available', async () => {
        const onChange = jest.fn()
        render(
            <BaseModelTransfer
                dataTest="my-transfer"
                available={models}
                selected={[models[0], models[1]]}
                onChange={onChange}
            />
        )

        await userEvent.dblClick(screen.getByText('Alpha'))

        expect(onChange).toHaveBeenCalledWith({ selected: [models[1]] })
    })
})
