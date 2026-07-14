import { render } from '@testing-library/react'
import React from 'react'
import { SECTIONS_MAP } from '../../lib'
import { testDataElement } from '../../testUtils/builders'
import TestComponentWithRouter, {
    CustomData,
} from '../../testUtils/TestComponentWithRouter'
import { generateDefaultMergeTests } from '../defaultMergeTests'
import { Component as Merge } from './Merge'

const renderMerge = async (customData: CustomData = {}) => {
    const routeOptions = {
        handle: { section: SECTIONS_MAP.dataElement },
    }

    return render(
        <TestComponentWithRouter
            path="/dataElements/merge"
            customData={{
                dataElements: {
                    dataElements: [testDataElement(), testDataElement()],
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
    componentName: 'DataElement',
    mergeResource: 'dataElements/merge',
    renderMerge,
})

describe('data element merge additional tests', () => {
    it('shows both data merge strategy radios and defaults to moving data values to the target', async () => {
        const screen = await renderMerge()
        const moveDataValuesRadio = screen.getByRole('radio', {
            name: /move data values to the target data element/i,
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
