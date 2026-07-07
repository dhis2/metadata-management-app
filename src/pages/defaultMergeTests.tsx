import { RenderResult } from '@testing-library/react'

export const generateDefaultMergeTests = ({
    componentName,
    renderMerge,
}: {
    componentName: string
    renderMerge: () => Promise<RenderResult>
}) => {
    describe(`${componentName} default merge tests`, () => {
        xit('shows a component to pick the source objects, a component to pick the target object and a radio button to delete sources', () => {})
        xit('does not allow to pick as a target an object that already has been picked as a source', () => {})
        xit('does not allow to pick as a source an object that already has been picked as the target', () => {})
        it('should default to deleting sources', async () => {
            const screen = await renderMerge()
            const deleteSourcesRadio = screen.getByRole('radio', {
                name: /^delete \d/i,
            })
            expect(deleteSourcesRadio).toBeChecked()
        })
        xit('shows a confirmation component when sources and target have been selected', () => {})
        xit('goes back to the list when the cancel button is pressed', () => {})
        xit('it errors if no source has been selected', () => {})
        xit('it errors if no target has been selected', () => {})
        xit('it errors if teh validation code was not entered', () => {})
        xit('it errors if the code in the confirmation component does not match the code given', () => {})
        xit('performs a merge when the form is correctly filled in and the merge button is pressed', () => {})
        xit('when the merge operation is in progress the a box with a loader appears', () => {})
        xit('when the merge operation is successful then a success message appears', () => {})
        xit('when the merge operation errors then i see an error message', () => {})
    })
}
