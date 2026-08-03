import { render, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { SECTIONS_MAP } from '../../lib'
import { testCategoryCombo } from '../../testUtils/builders'
import TestComponentWithRouter, {
    CustomData,
} from '../../testUtils/TestComponentWithRouter'
import {
    generateDefaultMergeTests,
    getMergeButton,
    pickFirstSource,
    pickTarget,
} from '../defaultMergeTests'
import { Component as Merge } from './Merge'

const renderMerge = async (
    customData: CustomData = {},
    selectedModels?: Set<string>
) => {
    const routeOptions = {
        handle: { section: SECTIONS_MAP.categoryCombo },
    }
    const initialEntry = selectedModels
        ? { pathname: '/categoryCombos/merge', state: { selectedModels } }
        : '/categoryCombos/merge'

    return render(
        <TestComponentWithRouter
            path="/categoryCombos/merge"
            customData={{
                categoryCombos: {
                    categoryCombos: [
                        testCategoryCombo(),
                        testCategoryCombo(),
                        testCategoryCombo(),
                    ],
                    pager: { page: 1, pageCount: 1, total: 3, pageSize: 10 },
                },
                ...customData,
            }}
            routeOptions={routeOptions}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            initialEntries={[initialEntry] as any}
        >
            <Merge />
        </TestComponentWithRouter>
    )
}
generateDefaultMergeTests({
    componentName: 'Category combination',
    mergeResource: 'categoryCombos/merge',
    renderMerge,
})

describe('category combination merge additional tests', () => {
    it('disables merge button and hides ConfirmationField when source and target categories do not match', async () => {
        const cc1 = testCategoryCombo({ categories: [{ id: 'cat-1' }] })
        const cc2 = testCategoryCombo({ categories: [{ id: 'cat-2' }] })

        const screen = await renderMerge(
            {
                categoryCombos: {
                    categoryCombos: [cc1, cc2],
                    pager: { page: 1, pageCount: 1, total: 2, pageSize: 10 },
                },
            },
            new Set([cc1.id, cc2.id])
        )

        await pickFirstSource(screen)
        await pickTarget(screen)

        await waitFor(() => expect(getMergeButton(screen)).toBeDisabled())
        await userEvent.hover(getMergeButton(screen))
        expect(
            await screen.findByText(
                'Categories of source and target category combinations do not match'
            )
        ).toBeInTheDocument()
        await waitFor(() =>
            expect(
                screen.queryByText(/merging cannot be undone/i)
            ).not.toBeInTheDocument()
        )
    })

    it('prompts for confirmation when source and target categories match', async () => {
        const cc1 = testCategoryCombo({ categories: [{ id: 'cat-1' }] })
        const cc2 = testCategoryCombo({ categories: [{ id: 'cat-1' }] })

        const screen = await renderMerge(
            {
                categoryCombos: {
                    categoryCombos: [cc1, cc2],
                    pager: { page: 1, pageCount: 1, total: 2, pageSize: 10 },
                },
            },
            new Set([cc1.id, cc2.id])
        )

        await pickFirstSource(screen)
        await pickTarget(screen)

        await waitFor(() =>
            expect(
                screen.queryByText(/merging cannot be undone/i)
            ).toBeInTheDocument()
        )
    })
})
