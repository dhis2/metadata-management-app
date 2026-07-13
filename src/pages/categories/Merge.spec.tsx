import { render, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { SECTIONS_MAP } from '../../lib'
import { testCategory } from '../../testUtils/builders'
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
        handle: { section: SECTIONS_MAP.category },
    }
    const initialEntry = selectedModels
        ? { pathname: '/categories/merge', state: { selectedModels } }
        : '/categories/merge'

    return render(
        <TestComponentWithRouter
            path="/categories/merge"
            customData={{
                categories: {
                    categories: [testCategory(), testCategory()],
                    pager: { page: 1, pageCount: 1, total: 2, pageSize: 10 },
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
    componentName: 'Category',
    mergeResource: 'categories/merge',
    renderMerge,
})

describe('data element merge additional tests', () => {
    it('disables merge button and hides ConfirmationField when source and target have different category options', async () => {
        const cat1 = testCategory({
            categoryOptions: [{ id: 'co-1' }],
            categoryCombos: [{ id: 'combo-1' }],
        })
        const cat2 = testCategory({
            categoryOptions: [{ id: 'co-2' }],
            categoryCombos: [{ id: 'combo-2' }],
        })

        const screen = await renderMerge(
            {
                categories: {
                    categories: [cat1, cat2],
                    pager: { page: 1, pageCount: 1, total: 2, pageSize: 10 },
                },
            },
            new Set([cat1.id, cat2.id])
        )

        await pickFirstSource(screen)
        await pickTarget(screen)

        await waitFor(() => expect(getMergeButton(screen)).toBeDisabled())
        await userEvent.hover(getMergeButton(screen))
        expect(
            await screen.findByText(
                'Category options of source and target categories do not match'
            )
        ).toBeInTheDocument()
        await waitFor(() =>
            expect(
                screen.queryByText(/merging cannot be undone/i)
            ).not.toBeInTheDocument()
        )
    })
    it('disables merge button and hides ConfirmationField when source and target have overlapping category combos', async () => {
        const cat1 = testCategory({
            categoryOptions: [{ id: 'co-1' }],
            categoryCombos: [{ id: 'combo-1' }],
        })
        const cat2 = testCategory({
            categoryOptions: [{ id: 'co-1' }],
            categoryCombos: [{ id: 'combo-1' }],
        })

        const screen = await renderMerge(
            {
                categories: {
                    categories: [cat1, cat2],
                    pager: { page: 1, pageCount: 1, total: 2, pageSize: 10 },
                },
            },
            new Set([cat1.id, cat2.id])
        )

        await pickFirstSource(screen)
        await pickTarget(screen)

        await waitFor(() => expect(getMergeButton(screen)).toBeDisabled())
        await userEvent.hover(getMergeButton(screen))
        expect(
            await screen.findByText(
                'Categories must have unique, non-overlapping category combos'
            )
        ).toBeInTheDocument()
        await waitFor(() =>
            expect(
                screen.queryByText(/merging cannot be undone/i)
            ).not.toBeInTheDocument()
        )
    })
    it('prompts for confirmation when source and target have matching category options and category combos', async () => {
        const cat1 = testCategory({
            categoryOptions: [{ id: 'co-1' }],
            categoryCombos: [{ id: 'combo-1' }],
        })
        const cat2 = testCategory({
            categoryOptions: [{ id: 'co-1' }],
            categoryCombos: [{ id: 'combo-2' }],
        })

        const screen = await renderMerge(
            {
                categories: {
                    categories: [cat1, cat2],
                    pager: { page: 1, pageCount: 1, total: 2, pageSize: 10 },
                },
            },
            new Set([cat1.id, cat2.id])
        )

        await pickFirstSource(screen)
        await pickTarget(screen)

        await waitFor(() => expect(getMergeButton(screen)).toBeDisabled())

        await waitFor(() =>
            expect(
                screen.queryByText(/merging cannot be undone/i)
            ).toBeInTheDocument()
        )
    })
    it('prompts for confirmation when source and target have matching category options and some categories are missing category combos', async () => {
        const cat1 = testCategory({
            categoryOptions: [{ id: 'co-1' }],
            categoryCombos: [],
        })
        const cat2 = testCategory({
            categoryOptions: [{ id: 'co-1' }],
            categoryCombos: [{ id: 'combo-2' }],
        })

        const screen = await renderMerge(
            {
                categories: {
                    categories: [cat1, cat2],
                    pager: { page: 1, pageCount: 1, total: 2, pageSize: 10 },
                },
            },
            new Set([cat1.id, cat2.id])
        )

        await pickFirstSource(screen)
        await pickTarget(screen)

        await waitFor(() => expect(getMergeButton(screen)).toBeDisabled())

        await waitFor(() =>
            expect(
                screen.queryByText(/merging cannot be undone/i)
            ).toBeInTheDocument()
        )
    })
})
