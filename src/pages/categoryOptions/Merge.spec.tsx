import { render } from '@testing-library/react'
import React from 'react'
import { SECTIONS_MAP } from '../../lib'
import { testCategoryOption } from '../../testUtils/builders'
import TestComponentWithRouter, {
    CustomData,
} from '../../testUtils/TestComponentWithRouter'
import { generateDefaultMergeTests } from '../defaultMergeTests'
import { Component as Merge } from './Merge'

const renderMerge = async (customData: CustomData = {}) => {
    const routeOptions = {
        handle: { section: SECTIONS_MAP.categoryOption },
    }

    return render(
        <TestComponentWithRouter
            path="/categoryOptions/merge"
            customData={{
                categoryOptions: {
                    categoryOptions: [
                        testCategoryOption(),
                        testCategoryOption(),
                        testCategoryOption(),
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
    componentName: 'Category option',
    mergeResource: 'categoryOptions/merge',
    renderMerge,
})
