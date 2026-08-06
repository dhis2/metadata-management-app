import { faker } from '@faker-js/faker'
import React from 'react'
import indicatorsSchemaMock from '../../../__mocks__/schema/indicators.json'
import { SECTIONS_MAP } from '../../../lib'
import { testIndicator } from '../../../testUtils/builders'
import { renderFormField } from '../../../testUtils/renderFormField'
import { uiActions } from '../../../testUtils/uiActions'
import { uiAssertions } from '../../../testUtils/uiAssertions'
import { ShortNameField } from './ShortNameField'

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

// indicator schema has `shortName.unique: false`, exercising the soft warning path
const schemaSection = SECTIONS_MAP.indicator

describe('ShortNameField', () => {
    it('shows a warning when the value has leading or trailing spaces', async () => {
        const screen = renderFormField({
            schemaSection,
            mockSchema: indicatorsSchemaMock,
            customData: {
                indicators: () => ({ pager: { total: 0 }, indicators: [] }),
            },
            children: <ShortNameField schemaSection={schemaSection} />,
        })

        await uiActions.enterInputFieldValue(
            'shortName',
            `  ${faker.company.name()}  `,
            screen
        )

        uiAssertions.expectInputFieldToHaveWarning(
            'formfields-shortName',
            'Leading and trailing spaces will be removed when saving.',
            screen
        )
    })

    it('combines the duplicate warning and the trailing space warning when both apply', async () => {
        const existingShortName = faker.company.name()
        const screen = renderFormField({
            schemaSection,
            mockSchema: indicatorsSchemaMock,
            customData: {
                indicators: (type: any, params: any) => {
                    if (
                        params?.params?.filter?.includes(
                            `shortName:ieq:${existingShortName}`
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
            children: <ShortNameField schemaSection={schemaSection} />,
        })

        await uiActions.enterInputFieldValue(
            'shortName',
            `  ${existingShortName}  `,
            screen
        )

        uiAssertions.expectInputFieldToHaveWarning(
            'formfields-shortName',
            'This short name is already in use. Consider updating the name to avoid a duplication. Leading and trailing spaces will be removed when saving.',
            screen
        )
    })

    it('shows only the duplicate warning when there are no extra spaces', async () => {
        const existingShortName = faker.company.name()
        const screen = renderFormField({
            schemaSection,
            mockSchema: indicatorsSchemaMock,
            customData: {
                indicators: (type: any, params: any) => {
                    if (
                        params?.params?.filter?.includes(
                            `shortName:ieq:${existingShortName}`
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
            children: <ShortNameField schemaSection={schemaSection} />,
        })

        await uiActions.enterInputFieldValue(
            'shortName',
            existingShortName,
            screen
        )

        uiAssertions.expectInputFieldToHaveWarning(
            'formfields-shortName',
            'This short name is already in use. Consider updating the name to avoid a duplication.',
            screen
        )
    })
})
