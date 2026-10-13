import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import '@testing-library/jest-dom'
import iconsMock from '../../__mocks__/iconsMock.json'
import { ComponentWithProvider, CustomData } from '../../testUtils'
import { ResourceQuery } from '../../types'
import { IconPicker } from './IconPicker'

const resolvers = {
    icons: (type: string, options: ResourceQuery) => {
        if (options.id) {
            return Promise.resolve(
                iconsMock.icons.find((icon) => icon.key === options.id)
            )
        }
        return Promise.resolve(iconsMock)
    },
} satisfies CustomData
const WithProvider = ({ children }: React.PropsWithChildren) => (
    <ComponentWithProvider dataForCustomProvider={resolvers}>
        {children}
    </ComponentWithProvider>
)

describe('IconPicker', () => {
    const mockOnIconPick = jest.fn()

    beforeEach(() => {
        mockOnIconPick.mockClear()
    })

    it('renders the IconPicker with no selected icon', () => {
        render(<IconPicker icon="test" onIconPick={mockOnIconPick} />, {
            wrapper: WithProvider,
        })

        const iconButton = screen.getByTestId('iconpicker-trigger')
        expect(iconButton).toBeInTheDocument()
        expect(within(iconButton).queryByRole('img')).toBeNull()
        expect(screen.queryByAltText('test')).not.toBeInTheDocument()
    })

    it('renders the selected icon when provided', async () => {
        const testIcon = iconsMock.icons[0]
        render(<IconPicker onIconPick={mockOnIconPick} icon={testIcon.key} />, {
            wrapper: WithProvider,
        })

        await waitFor(() => {
            const image = screen.getByAltText(testIcon.key)
            expect(image).toBeInTheDocument()
            expect(image.tagName).toBe('IMG')
            expect(image).toHaveAttribute('src', testIcon.href)
        })
    })

    it('opens the IconPickerModal when the button is clicked', async () => {
        render(<IconPicker onIconPick={mockOnIconPick} />, {
            wrapper: WithProvider,
        })

        const triggerButton = screen.getByTestId('iconpicker-trigger')
        await userEvent.click(triggerButton)

        expect(screen.getByTestId('dhis2-uicore-modal')).toBeInTheDocument()
        const icon = await screen.findByAltText(iconsMock.icons[0].key)
        expect(icon).toBeInTheDocument()
    })

    it('closes the IconPickerModal when the cancel button is clicked', async () => {
        const alreadySelectedIcon = iconsMock.icons[0].key
        render(
            <IconPicker
                onIconPick={mockOnIconPick}
                icon={alreadySelectedIcon}
            />,
            {
                wrapper: WithProvider,
            }
        )

        const triggerButton = screen.getByTestId('iconpicker-trigger')
        await userEvent.click(triggerButton)

        const cancelButton = await screen.findByText('Cancel')
        await userEvent.click(cancelButton)
        expect(mockOnIconPick).not.toHaveBeenCalled()
        expect(
            screen.queryByTestId('dhis2-uicore-modal')
        ).not.toBeInTheDocument()
    })

    it('calls onIconPick with icon-key and closes the modal when an icon is selected', async () => {
        render(
            <IconPicker
                onIconPick={mockOnIconPick}
                icon={iconsMock.icons[0].key}
            />,
            {
                wrapper: WithProvider,
            }
        )

        const newIconKey = iconsMock.icons[3]
        const triggerButton = screen.getByTestId('iconpicker-trigger')
        await userEvent.click(triggerButton)

        const newIcon = await screen.findByTitle(newIconKey.key)
        await userEvent.click(newIcon)

        const selectButton = await screen.findByText('Choose icon')
        await userEvent.click(selectButton)

        expect(mockOnIconPick).toHaveBeenCalledWith({ icon: newIconKey.key })
        expect(
            screen.queryByTestId('dhis2-uicore-modal')
        ).not.toBeInTheDocument()
    })
})
