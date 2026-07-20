import { render } from '@testing-library/react'
import React from 'react'
import { SECTIONS_MAP } from '../../lib'
import { testOrgUnit } from '../../testUtils/builders'
import TestComponentWithRouter, {
    CustomData,
} from '../../testUtils/TestComponentWithRouter'
import { generateDefaultMergeTests } from '../defaultMergeTests'
import { Component as Merge } from './Merge'

const renderMerge = async (customData: CustomData = {}) => {
    const routeOptions = {
        handle: { section: SECTIONS_MAP.organisationUnit },
    }

    return render(
        <TestComponentWithRouter
            path="/organisationUnits/merge"
            customData={{
                organisationUnits: {
                    organisationUnits: [testOrgUnit(), testOrgUnit()],
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
    componentName: 'OrganisationUnit',
    mergeResource: 'organisationUnits/merge',
    renderMerge,
})

describe('organisation unit merge additional tests', () => {
    it('shows both data value merge strategy radios and defaults to moving data values to the target', async () => {
        const screen = await renderMerge()
        const moveDataValuesRadio = screen.getByRole('radio', {
            name: /move data values to the target organisation unit/i,
        })
        const deleteSourceValuesRadio = screen.getByRole('radio', {
            name: /delete the source data values/i,
        })

        expect(moveDataValuesRadio).toBeInTheDocument()
        expect(deleteSourceValuesRadio).toBeInTheDocument()
        expect(moveDataValuesRadio).toBeChecked()
        expect(deleteSourceValuesRadio).not.toBeChecked()
    })

    it('shows both data approval merge strategy radios and defaults to moving data approvals to the target', async () => {
        const screen = await renderMerge()
        const moveDataApprovalsRadio = screen.getByRole('radio', {
            name: /move data approvals to the target organisation unit/i,
        })
        const deleteSourceApprovalsRadio = screen.getByRole('radio', {
            name: /delete the source data approvals/i,
        })

        expect(moveDataApprovalsRadio).toBeInTheDocument()
        expect(deleteSourceApprovalsRadio).toBeInTheDocument()
        expect(moveDataApprovalsRadio).toBeChecked()
        expect(deleteSourceApprovalsRadio).not.toBeChecked()
    })
})
