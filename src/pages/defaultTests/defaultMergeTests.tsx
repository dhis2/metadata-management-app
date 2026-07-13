import { RenderResult, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { CustomData } from '../../testUtils/TestComponentWithRouter'

const SOURCES_TEST_ID = 'formfields-modelmultiselect-sources'
const TARGET_TEST_ID = 'formfields-modelsingleselect-target'

const getSourcesField = (screen: RenderResult) =>
    screen.getByTestId(SOURCES_TEST_ID)
const getTargetField = (screen: RenderResult) =>
    screen.getByTestId(TARGET_TEST_ID)
const getMergeButton = (screen: RenderResult) =>
    screen.getByRole('button', { name: 'Merge' })

const openSelect = async (container: HTMLElement, screen: RenderResult) => {
    await userEvent.click(
        within(container).getByTestId('dhis2-uicore-select-input')
    )
    return screen.findByTestId('dhis2-uicore-select-menu-menuwrapper')
}

const closeSelect = async (container: HTMLElement) => {
    await userEvent.click(
        within(container).getByTestId('dhis2-uicore-select-input')
    )
}

// picks the first available source, returns its id and displayed label
const pickFirstSource = async (screen: RenderResult) => {
    const sourcesField = getSourcesField(screen)
    const menu = await openSelect(sourcesField, screen)
    const option = (
        await within(menu).findAllByTestId('dhis2-uicore-multiselectoption')
    )[0]
    const id = option.dataset.value
    const label = option.textContent
    await userEvent.click(within(option).getByRole('checkbox'))
    await closeSelect(sourcesField)
    return { id, label }
}

// picks the first available target, returns its id and displayed label
// (single-select closes itself on selection, unlike multi-select)
const pickTarget = async (screen: RenderResult) => {
    const targetField = getTargetField(screen)
    const menu = await openSelect(targetField, screen)
    const option = (
        await within(menu).findAllByTestId('dhis2-uicore-singleselectoption')
    )[0]
    const id = option.dataset.value
    const label = option.textContent
    await userEvent.click(option)
    return { id, label }
}

const getAvailableTargetLabels = async (screen: RenderResult) => {
    const targetField = getTargetField(screen)
    const menu = await openSelect(targetField, screen)
    const options = await within(menu).findAllByTestId(
        'dhis2-uicore-singleselectoption'
    )
    const labels = options.map((option) => option.textContent)
    await closeSelect(targetField)
    return labels
}

const getAvailableSourceLabels = async (screen: RenderResult) => {
    const sourcesField = getSourcesField(screen)
    const menu = await openSelect(sourcesField, screen)
    const options = await within(menu).findAllByTestId(
        'dhis2-uicore-multiselectoption'
    )
    const labels = options.map((option) => option.textContent)
    await closeSelect(sourcesField)
    return labels
}

const enterMatchingConfirmationCode = async (screen: RenderResult) => {
    const confirmationCodeElement = await screen.findByText(/^merge-/)
    await userEvent.type(
        screen.getByRole('textbox'),
        confirmationCodeElement.textContent ?? ''
    )
}

const fillInValidMergeForm = async (screen: RenderResult) => {
    const source = await pickFirstSource(screen)
    const target = await pickTarget(screen)
    await enterMatchingConfirmationCode(screen)
    return { source, target }
}

export const generateDefaultMergeTests = ({
    componentName,
    mergeResource,
    renderMerge,
}: {
    componentName: string
    // the resource-key used for the merge mutation, eg. "dataElements/merge"
    mergeResource: string
    renderMerge: (customData?: CustomData) => Promise<RenderResult>
}) => {
    describe(`${componentName} default merge tests`, () => {
        it('shows a component to pick the source objects, a component to pick the target object and a radio group to keep or delete the sources', async () => {
            const screen = await renderMerge()

            expect(getSourcesField(screen)).toBeVisible()
            expect(getTargetField(screen)).toBeVisible()
            expect(
                screen.getByRole('radio', { name: /^delete \d/i })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: /^keep \d/i })
            ).toBeInTheDocument()
        })

        it('does not allow to pick as a target an object that already has been picked as a source', async () => {
            const screen = await renderMerge()

            const pickedSource = await pickFirstSource(screen)
            const availableTargetLabels = await getAvailableTargetLabels(screen)

            expect(availableTargetLabels).not.toContain(pickedSource.label)
        })

        it('does not allow to pick as a source an object that already has been picked as the target', async () => {
            const screen = await renderMerge()

            const pickedTarget = await pickTarget(screen)
            const availableSourceLabels = await getAvailableSourceLabels(screen)

            expect(availableSourceLabels).not.toContain(pickedTarget.label)
        })

        it('should default to deleting sources', async () => {
            const screen = await renderMerge()
            const deleteSourcesRadio = screen.getByRole('radio', {
                name: /^delete \d/i,
            })
            expect(deleteSourcesRadio).toBeChecked()
        })

        it('shows a confirmation component once a source and a target have been selected', async () => {
            const screen = await renderMerge()

            expect(
                screen.queryByText(/merging cannot be undone/i)
            ).not.toBeInTheDocument()

            await pickFirstSource(screen)
            await pickTarget(screen)

            expect(
                await screen.findByText(/merging cannot be undone/i)
            ).toBeVisible()
            expect(
                screen.getByText(
                    /to confirm the merge, type the confirmation code/i
                )
            ).toBeVisible()
        })

        it('goes back to the list when the cancel button is pressed', async () => {
            const screen = await renderMerge()
            expect(getSourcesField(screen)).toBeInTheDocument()

            await userEvent.click(screen.getByRole('link', { name: 'Cancel' }))

            expect(
                screen.queryByTestId(SOURCES_TEST_ID)
            ).not.toBeInTheDocument()
        })

        it('keeps the merge button disabled until a source and a target have been selected', async () => {
            const screen = await renderMerge()
            const mergeButton = getMergeButton(screen)

            expect(mergeButton).toBeDisabled()

            await pickTarget(screen)
            await waitFor(() => expect(mergeButton).toBeDisabled())

            await pickFirstSource(screen)
            await waitFor(() => expect(mergeButton).toBeDisabled())
        })

        it('keeps the merge button disabled when no confirmation code has been entered', async () => {
            const screen = await renderMerge()
            await pickFirstSource(screen)
            await pickTarget(screen)

            await waitFor(() => expect(getMergeButton(screen)).toBeDisabled())
        })

        it('keeps the merge button disabled when the entered confirmation code does not match', async () => {
            const screen = await renderMerge()
            await pickFirstSource(screen)
            await pickTarget(screen)

            await userEvent.type(screen.getByRole('textbox'), 'wrong-code')

            await waitFor(() => expect(getMergeButton(screen)).toBeDisabled())
        })

        it('performs a merge when the form is correctly filled in and the merge button is pressed', async () => {
            const mergeMock = jest.fn(() =>
                Promise.resolve({ httpStatus: 'OK' })
            )
            const screen = await renderMerge({ [mergeResource]: mergeMock })
            const { source, target } = await fillInValidMergeForm(screen)

            const mergeButton = getMergeButton(screen)
            await waitFor(() => expect(mergeButton).toBeEnabled())
            await userEvent.click(mergeButton)

            expect(await screen.findByText(/merge complete/i)).toBeVisible()
            expect(mergeMock).toHaveBeenCalledTimes(1)
            expect(mergeMock).toHaveBeenCalledWith(
                'create',
                expect.objectContaining({
                    resource: mergeResource,
                    data: expect.objectContaining({
                        sources: [source.id],
                        target: target.id,
                        deleteSources: true,
                    }),
                }),
                { signal: undefined }
            )
        })

        it('when the merge operation is in progress a box with a loader appears', async () => {
            let resolveMerge: (value: unknown) => void = () => undefined
            const mergeMock = jest.fn(
                () =>
                    new Promise((resolve) => {
                        resolveMerge = resolve
                    })
            )
            const screen = await renderMerge({ [mergeResource]: mergeMock })
            await fillInValidMergeForm(screen)

            const mergeButton = getMergeButton(screen)
            await waitFor(() => expect(mergeButton).toBeEnabled())
            await userEvent.click(mergeButton)

            expect(await screen.findByText(/merging/i)).toBeVisible()

            resolveMerge({ httpStatus: 'OK' })

            expect(await screen.findByText(/merge complete/i)).toBeVisible()
        })

        it('when the merge operation errors then i see an error message', async () => {
            const mergeMock = jest.fn(() =>
                Promise.reject(new Error('Something went wrong on the server'))
            )
            const screen = await renderMerge({ [mergeResource]: mergeMock })
            await fillInValidMergeForm(screen)

            const mergeButton = getMergeButton(screen)
            await waitFor(() => expect(mergeButton).toBeEnabled())
            await userEvent.click(mergeButton)

            expect(
                await screen.findByText('Something went wrong on the server')
            ).toBeVisible()
        })
    })
}
