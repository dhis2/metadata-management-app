import { render, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import { randomDhis2Id } from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { Component as Clone } from './Clone'

const mockOnFormTypeChange = jest.fn()

// Contents of the form are mocked here to focus on testing core clone functionality,
// particularly, the saving of the new data set, sections, and custom form.
// The real TabbedFormTypePicker is rendered (fed by the same `clonedId` search
// param the real form contents use) so clone-mode tab disabling can be tested.
jest.mock('./form/DataSetFormContents', () => {
    const ReactActual = jest.requireActual('react')
    const { useSearchParams } = jest.requireActual('react-router-dom')
    const { FormType, TabbedFormTypePicker } = jest.requireActual(
        '../../components/formCreators/TabbedFormTypePicker'
    )

    return {
        DataSetFormContents: () => {
            const [searchParams] = useSearchParams()
            const isClone = !!searchParams.get('clonedId')
            return ReactActual.createElement(
                TabbedFormTypePicker,
                {
                    selectedFormType: FormType.SECTION,
                    onFormTypeChange: mockOnFormTypeChange,
                    sectionsLength: 1,
                    hasDataEntryForm: false,
                    hasDataToDisplay: false,
                    modelId: 'existing-id',
                    isClone,
                },
                ReactActual.createElement('div')
            )
        },
    }
})

const section = SECTIONS_MAP.dataSet

describe('Data set clone tests', () => {
    const createDataSetMock = jest.fn()
    const createSectionMock = jest.fn()
    const createCustomFormMock = jest.fn()

    const clonedId = randomDhis2Id()
    const newDataSetId = randomDhis2Id()
    const sectionAId = randomDhis2Id()
    const sectionBId = randomDhis2Id()
    const originalFormId = randomDhis2Id()
    const sectionACode = 'SECTION_A_CODE'

    const clonedDataSet = () => ({
        id: clonedId,
        name: 'Source data set',
        displayName: 'Source data set',
        created: '2020-01-01T00:00:00.000',
        attributeValues: [],
        sections: [
            {
                id: sectionAId,
                displayName: 'Section A',
                description: 'a',
                code: sectionACode,
            },
            { id: sectionBId, displayName: 'Section B', description: 'b' },
        ],
        dataEntryForm: {
            id: originalFormId,
            displayName: 'Custom form',
            htmlCode: '<div>form</div>',
        },
    })

    beforeEach(() => {
        jest.resetAllMocks()
        const portalRoot = document.createElement('div')
        portalRoot.setAttribute('id', FOOTER_ID)
        document.body.appendChild(portalRoot)
    })

    afterEach(() => {
        document.getElementById(FOOTER_ID)?.remove()
    })

    const renderClonePage = generateRenderer(
        { section },
        (routeOptions, { dataSet = clonedDataSet() } = {}) => {
            const screen = render(
                <TestComponentWithRouter
                    path="/dataSets/clone"
                    initialEntries={[`/dataSets/clone?clonedId=${clonedId}`]}
                    customData={{
                        dataSets: (type: string, params: any) => {
                            if (type === 'read' && params?.id === clonedId) {
                                return dataSet
                            }
                            if (type === 'create') {
                                createDataSetMock(params)
                                return { response: { uid: newDataSetId } }
                            }
                        },
                        sections: (type: string, params: any) => {
                            if (type === 'create') {
                                createSectionMock(params)
                                return { response: { uid: randomDhis2Id() } }
                            }
                        },
                        [`dataSets/${newDataSetId}/form`]: (
                            type: string,
                            params: any
                        ) => {
                            if (type === 'create') {
                                createCustomFormMock(params)
                                return { response: { uid: randomDhis2Id() } }
                            }
                        },
                    }}
                    routeOptions={routeOptions}
                >
                    <Clone />
                </TestComponentWithRouter>
            )
            return { screen, dataSet }
        }
    )

    // waits for the cloned data set to have loaded and the form (including
    // its footer, portalled to `#FOOTER_ID`) to have rendered
    const waitForFormToLoad = (screen: ReturnType<typeof render>) =>
        screen.findByTestId('form-save-button')

    it('shows a clone notice referencing the source data set', async () => {
        const { screen, dataSet } = await renderClonePage()
        await waitForFormToLoad(screen)

        expect(screen.getByText(`Cloning ${dataSet.displayName}`)).toBeVisible()
    })

    it('creates the new data set without the cloned id, sections or custom form', async () => {
        const { screen } = await renderClonePage()
        await waitForFormToLoad(screen)

        await uiActions.submitForm(screen)

        await waitFor(() => expect(createDataSetMock).toHaveBeenCalledTimes(1))
        const payload = createDataSetMock.mock.calls[0][0].data
        expect(payload.id).toBeUndefined()
        expect(payload.name).toEqual('Source data set')
        expect(payload.sections).toBeUndefined()
        expect(payload.dataEntryForm).toBeUndefined()
        expect(payload.created).toBeUndefined()
    })

    it('re-creates each section against the new data set id', async () => {
        const { screen } = await renderClonePage()
        await waitForFormToLoad(screen)

        await uiActions.submitForm(screen)

        await waitFor(() => expect(createSectionMock).toHaveBeenCalledTimes(2))
        const payloads = createSectionMock.mock.calls.map(
            (call) => call[0].data
        )
        expect(payloads).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    displayName: 'Section A',
                    dataSet: { id: newDataSetId },
                    code: `${newDataSetId}_${sectionACode}`,
                    sortOrder: 0,
                }),
                expect.objectContaining({
                    displayName: 'Section B',
                    dataSet: { id: newDataSetId },
                    code: null,
                    sortOrder: 1,
                }),
            ])
        )
        payloads.forEach((payload) => expect(payload.id).toBeUndefined())

        const sectionBPayload = payloads.find(
            (payload) => payload.displayName === 'Section B'
        )
        expect(sectionBPayload.code).toBeNull()
    })

    it('re-creates the custom form against the new data set with a fresh id', async () => {
        const { screen } = await renderClonePage()
        await waitForFormToLoad(screen)

        await uiActions.submitForm(screen)

        await waitFor(() =>
            expect(createCustomFormMock).toHaveBeenCalledTimes(1)
        )
        const payload = createCustomFormMock.mock.calls[0][0].data
        expect(payload.htmlCode).toEqual('<div>form</div>')
        expect(payload.name).toEqual('Source data set')
        expect(payload.id).toBeDefined()
        expect(payload.id).not.toEqual(originalFormId)
    })

    it('skips section and custom form creation when the cloned data set has neither', async () => {
        const dataSetWithoutExtras = {
            ...clonedDataSet(),
            sections: [],
            dataEntryForm: undefined,
        }
        const { screen } = await renderClonePage({
            dataSet: dataSetWithoutExtras,
        })
        await waitForFormToLoad(screen)

        await uiActions.submitForm(screen)

        await waitFor(() => expect(createDataSetMock).toHaveBeenCalledTimes(1))
        expect(createSectionMock).not.toHaveBeenCalled()
        expect(createCustomFormMock).not.toHaveBeenCalled()
    })

    it('has a cancel link back to the data sets list', async () => {
        const { screen } = await renderClonePage()
        await waitForFormToLoad(screen)

        const cancelButton = screen.getByTestId('form-cancel-link')
        expect(cancelButton).toHaveAttribute('href', '/dataSets')
    })

    it('does not allow toggling between form types in clone mode', async () => {
        const { screen } = await renderClonePage()
        await waitForFormToLoad(screen)

        const tabs: HTMLElement[] = screen.getAllByRole('tab')
        expect(tabs).toHaveLength(3)
        tabs.forEach((tab) =>
            expect(tab).toHaveAttribute('aria-disabled', 'true')
        )

        for (const tab of tabs) {
            await userEvent.click(tab)
        }

        expect(mockOnFormTypeChange).not.toHaveBeenCalled()
    })
})
