import { render } from '@testing-library/react'
import React from 'react'
import { SECTIONS_MAP } from '../../lib'
import { testIndicator } from '../../testUtils/builders'
import TestComponentWithRouter, {
    CustomData,
} from '../../testUtils/TestComponentWithRouter'
import { generateDefaultMergeTests } from '../defaultMergeTests'
import { Component as Merge } from './Merge'

const renderMerge = async (customData: CustomData = {}) => {
    const routeOptions = {
        handle: { section: SECTIONS_MAP.indicator },
    }

    return render(
        <TestComponentWithRouter
            path="/indicators/merge"
            customData={{
                indicators: {
                    indicators: [testIndicator(), testIndicator()],
                    pager: { page: 1, pageCount: 1, total: 2, pageSize: 10 },
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
    componentName: 'Indicator',
    mergeResource: 'indicators/merge',
    renderMerge,
})
