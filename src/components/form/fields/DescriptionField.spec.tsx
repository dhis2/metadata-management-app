import { faker } from '@faker-js/faker'
import React from 'react'
import indicatorsSchemaMock from '../../../__mocks__/schema/indicators.json'
import { SECTIONS_MAP } from '../../../lib'
import { renderFormField } from '../../../testUtils/renderFormField'
import { uiActions } from '../../../testUtils/uiActions'
import { uiAssertions } from '../../../testUtils/uiAssertions'
import { DescriptionField } from './DescriptionField'

const schemaSection = SECTIONS_MAP.indicator

describe('DescriptionField', () => {
    it('shows a warning when the value has leading or trailing spaces', async () => {
        const screen = renderFormField({
            schemaSection,
            mockSchema: indicatorsSchemaMock,
            children: <DescriptionField />,
        })

        await uiActions.enterInputFieldValue(
            'description',
            `  ${faker.lorem.words()}  `,
            screen
        )

        uiAssertions.expectInputFieldToHaveWarning(
            'formfields-description',
            'Leading and trailing spaces will be removed when saving',
            screen
        )
    })

    it('does not warn when the value has no leading/trailing spaces', async () => {
        const screen = renderFormField({
            schemaSection,
            mockSchema: indicatorsSchemaMock,
            children: <DescriptionField />,
        })

        await uiActions.enterInputFieldValue(
            'description',
            faker.lorem.words(),
            screen
        )

        expect(
            screen.queryByTestId('formfields-description-validation')
        ).not.toBeInTheDocument()
    })
})
