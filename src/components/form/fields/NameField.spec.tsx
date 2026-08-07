import { faker } from '@faker-js/faker'
import React from 'react'
import indicatorsSchemaMock from '../../../__mocks__/schema/indicators.json'
import { SECTIONS_MAP } from '../../../lib'
import { testIndicator } from '../../../testUtils/builders'
import { renderFormField } from '../../../testUtils/renderFormField'
import { uiActions } from '../../../testUtils/uiActions'
import { uiAssertions } from '../../../testUtils/uiAssertions'
import { NameField } from './NameField'

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

// indicator schema has `name.unique: false`, exercising the soft warning path
const schemaSection = SECTIONS_MAP.indicator

describe('NameField', () => {
    it('shows a warning when the value has leading or trailing spaces', async () => {
        const screen = renderFormField({
            schemaSection,
            mockSchema: indicatorsSchemaMock,
            customData: {
                indicators: () => ({ pager: { total: 0 }, indicators: [] }),
            },
            children: <NameField schemaSection={schemaSection} />,
        })

        await uiActions.enterName(`  ${faker.company.name()}  `, screen)

        uiAssertions.expectInputFieldToHaveWarning(
            'formfields-name',
            'Leading and trailing spaces will be removed when saving',
            screen
        )
    })

    it('shows both the duplicate warning and the trailing space warning when both apply', async () => {
        const existingName = faker.company.name()
        const screen = renderFormField({
            schemaSection,
            mockSchema: indicatorsSchemaMock,
            customData: {
                indicators: (type: any, params: any) => {
                    if (
                        params?.params?.filter?.includes(
                            `name:ieq:${existingName}`
                        )
                    ) {
                        return {
                            pager: { total: 1 },
                            indicators: [testIndicator()],
                        }
                    }
                    return { pager: { total: 0 }, indicators: [] }
                },
            },
            children: <NameField schemaSection={schemaSection} />,
        })

        await uiActions.enterName(`  ${existingName}  `, screen)

        uiAssertions.expectInputFieldToHaveWarning(
            'formfields-name',
            'This name is already in use. Consider updating the name to avoid a duplication. Leading and trailing spaces will be removed when saving',
            screen
        )
    })

    it('shows only the duplicate warning when there are no extra spaces', async () => {
        const existingName = faker.company.name()
        const screen = renderFormField({
            schemaSection,
            mockSchema: indicatorsSchemaMock,
            customData: {
                indicators: (type: any, params: any) => {
                    if (
                        params?.params?.filter?.includes(
                            `name:ieq:${existingName}`
                        )
                    ) {
                        return {
                            pager: { total: 1 },
                            indicators: [testIndicator()],
                        }
                    }
                    return { pager: { total: 0 }, indicators: [] }
                },
            },
            children: <NameField schemaSection={schemaSection} />,
        })

        await uiActions.enterName(existingName, screen)

        uiAssertions.expectInputFieldToHaveWarning(
            'formfields-name',
            'This name is already in use. Consider updating the name to avoid a duplication.',
            screen
        )
    })

    it('does not warn when the value has no leading/trailing spaces and is not a duplicate', async () => {
        const screen = renderFormField({
            schemaSection,
            mockSchema: indicatorsSchemaMock,
            customData: {
                indicators: () => ({ pager: { total: 0 }, indicators: [] }),
            },
            children: <NameField schemaSection={schemaSection} />,
        })

        await uiActions.enterName(faker.company.name(), screen)

        expect(
            screen.queryByTestId('formfields-name-validation')
        ).not.toBeInTheDocument()
    })
})
