import { render } from '@testing-library/react'
import React from 'react'
import { SECTIONS_MAP } from '../../lib'
import { testIndicatorType } from '../../testUtils/builders'
import TestComponentWithRouter, {
    CustomData,
} from '../../testUtils/TestComponentWithRouter'
import { generateDefaultMergeTests } from '../defaultMergeTests'
import { Component as Merge } from './Merge'

const renderMerge = async (customData: CustomData = {}) => {
    const routeOptions = {
        handle: { section: SECTIONS_MAP.indicatorType },
    }

    return render(
        <TestComponentWithRouter
            path="/indicators/merge"
            customData={{
                indicatorTypes: {
                    indicatorTypes: [testIndicatorType(), testIndicatorType()],
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
    componentName: 'Indicator type',
    mergeResource: 'indicatorTypes/merge',
    renderMerge,
})

describe('Indicator type additional tests', () => {
    it('should show a warning if target and source have different factors', () => {})
})
