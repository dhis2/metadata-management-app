import { render } from '@testing-library/react'
import React from 'react'
import { SECTIONS_MAP } from '../../lib'
import { testCategoryOptionCombo } from '../../testUtils/builders'
import TestComponentWithRouter, {
    CustomData,
} from '../../testUtils/TestComponentWithRouter'
import { generateDefaultMergeTests } from '../defaultMergeTests'
import { Component as Merge } from './Merge'

const renderMerge = async (customData: CustomData = {}) => {
    const routeOptions = {
        handle: { section: SECTIONS_MAP.categoryOptionCombo },
    }

    return render(
        <TestComponentWithRouter
            path="/categoryOptionCombos/merge"
            customData={{
                categoryOptionCombos: {
                    categoryOptionCombos: [
                        testCategoryOptionCombo(),
                        testCategoryOptionCombo(),
                        testCategoryOptionCombo(),
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
    componentName: 'Category option combination',
    mergeResource: 'categoryOptionCombos/merge',
    renderMerge,
    hasDeleteSources: false,
})

describe('category option combination merge additional tests', () => {
    it('shows both data merge strategy radios and defaults to moving data values to the target', async () => {
        const screen = await renderMerge()
        const moveDataValuesRadio = screen.getByRole('radio', {
            name: /move data values to the target category option combination/i,
        })
        const deleteSourceValuesRadio = screen.getByRole('radio', {
            name: /delete the source data values/i,
        })

        expect(moveDataValuesRadio).toBeInTheDocument()
        expect(deleteSourceValuesRadio).toBeInTheDocument()
        expect(moveDataValuesRadio).toBeChecked()
        expect(deleteSourceValuesRadio).not.toBeChecked()
    })
})
