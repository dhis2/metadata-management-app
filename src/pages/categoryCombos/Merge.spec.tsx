import { render } from '@testing-library/react'
import React from 'react'
import { SECTIONS_MAP } from '../../lib'
import { testCategoryCombo } from '../../testUtils/builders'
import TestComponentWithRouter, {
    CustomData,
} from '../../testUtils/TestComponentWithRouter'
import { generateDefaultMergeTests } from '../defaultMergeTests'
import { Component as Merge } from './Merge'

const renderMerge = async (customData: CustomData = {}) => {
    const routeOptions = {
        handle: { section: SECTIONS_MAP.categoryCombo },
    }

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
