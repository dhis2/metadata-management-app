import { RenderResult, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { uiActions } from './uiActions'

const expectInputFieldToExist = (
    fieldName: string,
    value: string | null,
    screen: RenderResult,
    role?: string
) => {
    const field = screen.getByTestId(`formfields-${fieldName}`)
    expect(field).toBeVisible()
    const input = within(field).getByRole(role ?? 'textbox') as HTMLInputElement
    expect(input).toBeVisible()
    expect(input).toHaveAttribute('name', fieldName)
    expect(input).toHaveAttribute('value', value)
}

const expectTextAreaFieldToExist = (
    fieldName: string,
    value: string | null,
    screen: RenderResult
) => {
    const field = screen.getByTestId(`formfields-${fieldName}`)
    expect(field).toBeVisible()
    const textArea = within(field).getByRole('textbox') as HTMLInputElement
    expect(textArea).toBeVisible()
    expect(textArea).toHaveAttribute('name', fieldName)
    if (value) {
        expect(textArea).toHaveValue(value)
    } else {
        expect(textArea).toHaveValue('')
    }
}

const expectCheckboxFieldToExist = (
    fieldName: string,
    checked: boolean,
    screen: RenderResult
) => {
    const field = screen.getByTestId(`formfields-${fieldName}`)
    const input = within(field).getByRole('checkbox') as HTMLInputElement
    expect(input).toHaveAttribute('name', fieldName)
    const svg = field.querySelector('svg') as SVGSVGElement
    if (checked) {
        expect(svg).toHaveClass('checked')
    } else {
        expect(svg).not.toHaveClass('checked')
    }
}

const expectRadioFieldToExist = (
    fieldName: string,
    radios: { label: string; checked: boolean }[],
    screen: RenderResult
) => {
    const field = screen.getByTestId(`formfields-${fieldName}`)
    const radioButtons = within(field).getAllByRole('radio')
    expect(radios).toHaveLength(radios.length)
    radios.forEach((radio, index) => {
        expect(
            radioButtons[index].closest('[data-test="dhis2-uicore-radio"]')
        ).toHaveTextContent(radio.label)
        if (radio.checked) {
            expect(radioButtons[index]).toBeChecked()
        } else {
            expect(radioButtons[index]).not.toBeChecked()
        }
    })
}

const expectInputFieldToHaveError = (
    fieldTestId: string,
    errorText: string,
    screen: RenderResult,
    options?: { skipClassCheck?: boolean }
) => {
    const field = screen.getByTestId(fieldTestId)
    const error = within(field).getByTestId(`${fieldTestId}-validation`)
    expect(error).toBeVisible()
    if (!options?.skipClassCheck) {
        expect(error).toHaveClass('error')
    }

    expect(error).toHaveTextContent(errorText)
}

const expectInputFieldToHaveWarning = (
    fieldTestId: string,
    warningText: string,
    screen: RenderResult
) => {
    const field = screen.getByTestId(fieldTestId)
    const warning = within(field).getByTestId(`${fieldTestId}-validation`)
    expect(warning).toBeVisible()
    expect(warning).toHaveClass('warning')
    expect(warning).toHaveTextContent(warningText)
}

const expectTransferFieldToExistWithOptions = async (
    transferTestId: string,
    expected: {
        lhs: {
            displayName: string
        }[]
        rhs: {
            displayName: string
        }[]
    },
    screen: RenderResult
) => {
    const transfer = screen.getByTestId(transferTestId)
    expect(transfer).toBeVisible()
    const lhs = within(transfer).getByTestId(`${transferTestId}-leftside`)
    await waitFor(() => {
        const lhsOptions = within(lhs).queryAllByTestId(
            'dhis2-uicore-transferoption'
        )
        expect(lhsOptions).toHaveLength(expected.lhs.length)
        expected.lhs.forEach((option, index) => {
            expect(lhsOptions[index]).toHaveTextContent(option.displayName)
        })
    })
    const rhs = within(transfer).getByTestId(`${transferTestId}-rightside`)
    const rhsOptions = within(rhs).queryAllByTestId(
        'dhis2-uicore-transferoption'
    )
    expect(rhsOptions).toHaveLength(expected.rhs.length)
    expected.rhs.forEach((option, index) => {
        expect(rhsOptions[index]).toHaveTextContent(option.displayName)
    })
}

const expectSelectToExistWithOptions = async (
    triggeringDiv: HTMLElement,
    {
        selected = undefined,
        options = [],
        disabled = false,
    }: {
        selected?: string
        options: { displayName: string }[]
        disabled?: boolean
    },
    screen: RenderResult
) => {
    const selectInput = within(triggeringDiv).getByTestId(
        'dhis2-uicore-select-input'
    )
    expect(selectInput).toBeVisible()
    if (selected) {
        expect(selectInput).toHaveTextContent(selected)
    }
    if (disabled) {
        expect(selectInput.classList.contains('disabled')).toBe(true)
        return
    }
    await userEvent.click(selectInput)
    const optionsWrapper = await screen.findByTestId(
        'dhis2-uicore-select-menu-menuwrapper'
    )
    expect(optionsWrapper).toBeVisible()
    const foundOptions = within(optionsWrapper).getAllByTestId(
        'dhis2-uicore-singleselectoption'
    )
    expect(foundOptions).toHaveLength(options.length)
    options.forEach((option, index) => {
        expect(foundOptions[index]).toHaveTextContent(option.displayName)
    })
    await userEvent.click(selectInput)
}

const expectMultiSelectToExistWithOptions = async (
    triggeringDiv: HTMLElement,
    {
        selected = [],
        options = [],
    }: {
        selected: { displayName: string }[]
        options: { displayName: string }[]
    },
    screen: RenderResult
) => {
    const selectInput = within(triggeringDiv).getByTestId(
        'dhis2-uicore-select-input'
    )
    expect(selectInput).toBeVisible()
    selected.forEach((s) =>
        expect(selectInput).toHaveTextContent(s.displayName)
    )
    await userEvent.click(selectInput)
    const optionsWrapper = await screen.findByTestId(
        'dhis2-uicore-select-menu-menuwrapper'
    )
    expect(optionsWrapper).toBeVisible()
    const foundOptions = within(optionsWrapper).getAllByTestId(
        'dhis2-uicore-multiselectoption'
    )
    expect(foundOptions).toHaveLength(options.length)
    options.forEach((option, index) => {
        expect(foundOptions[index]).toHaveTextContent(option.displayName)
        if (selected.map((s) => s.displayName).includes(option.displayName)) {
            expect(
                within(foundOptions[index]).getByRole('checkbox')
            ).toBeChecked()
        } else {
            expect(
                within(foundOptions[index]).getByRole('checkbox')
            ).not.toBeChecked()
        }
    })
    await userEvent.click(selectInput)
}
const expectInputToErrorWhenExceedsLength = async (
    fieldName: string,
    maxLength: number,
    screen: RenderResult,
    options?: { skipClassCheck: boolean }
) => {
    await userEvent.click(screen.getByTestId(`formfields-${fieldName}-label`))
    expectInputFieldToHaveError(
        `formfields-${fieldName}`,
        `Please enter a maximum of ${maxLength} characters`,
        screen,
        options
    )
}

const expectInputToErrorWhenDuplicate = async (
    fieldName: string,
    duplicateText: string,
    screen: RenderResult
) => {
    await uiActions.enterInputFieldValue(fieldName, duplicateText, screen)
    await userEvent.click(screen.getByTestId(`formfields-${fieldName}-label`))
    expectInputFieldToHaveError(
        `formfields-${fieldName}`,
        `This field requires a unique value, please choose another one`,
        screen
    )
}

const expectColorAndIconFieldToExist = (screen: RenderResult) => {
    const field = screen.getByTestId('formfields-colorandicon')
    expect(field).toBeVisible()
}

const expectButtonGroupToExistWithOptions = (
    buttonGroupTestId: string,
    options: { value: string; label: string }[],
    screen: RenderResult
) => {
    const buttonGroup = screen.getByTestId(buttonGroupTestId)
    expect(buttonGroup).toBeVisible()
    options.forEach((option) => {
        const button = within(buttonGroup).getByTestId(
            `${buttonGroupTestId}-option-${option.value}`
        )
        expect(button).toBeVisible()
        expect(button).toHaveTextContent(option.label)
    })
}

export const uiAssertions = {
    expectNameFieldExist: (value: string, screen: RenderResult) =>
        expectInputFieldToExist('name', value, screen),
    expectCodeFieldExist: (value: string, screen: RenderResult) =>
        expectInputFieldToExist('code', value, screen),
    expectInputFieldToExist,
    expectTextAreaFieldToExist,
    expectColorAndIconFieldToExist,
    expectFieldToHaveError: expectInputFieldToHaveError,
    expectInputFieldToHaveWarning,
    expectTransferFieldToExistWithOptions,
    expectSelectToExistWithOptions,
    expectMultiSelectToExistWithOptions,
    expectCheckboxFieldToExist,
    expectRadioFieldToExist,
    expectButtonGroupToExistWithOptions,
    expectInputToErrorWhenExceedsLength,
    expectNameToErrorWhenExceedsLength: (
        screen: RenderResult,
        maxLength = 230
    ) => expectInputToErrorWhenExceedsLength('name', maxLength, screen),
    expectCodeToErrorWhenExceedsLength: (
        screen: RenderResult,
        maxLength = 50
    ) => expectInputToErrorWhenExceedsLength('code', maxLength, screen),
    expectNameToErrorWhenDuplicate: (
        duplicateName: string,
        screen: RenderResult
    ) => expectInputToErrorWhenDuplicate('name', duplicateName, screen),
    expectCodeToErrorWhenDuplicate: (
        duplicateCode: string,
        screen: RenderResult
    ) => expectInputToErrorWhenDuplicate('code', duplicateCode, screen),
    expectInputToErrorWhenDuplicate,
}
