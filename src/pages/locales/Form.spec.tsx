import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.locale
jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Locales form tests', () => {
    const createMock = jest.fn()

    beforeEach(() => {
        resetAllMocks()
        const portalRoot = document.createElement('div')
        portalRoot.setAttribute('id', FOOTER_ID)
        document.body.appendChild(portalRoot)
    })

    afterEach(() => {
        const portalRoot = document.getElementById(FOOTER_ID)
        if (portalRoot) {
            portalRoot.remove()
        }
    })

    describe('New', () => {
        const renderForm = generateRenderer({ section }, (routeOptions) => {
            const languages = {
                ab: 'Abkhazian',
                aa: 'Afar',
                af: 'Afrikaans',
            }
            const countries = {
                AF: 'Afghanistan',
                AL: 'Albania',
                DZ: 'Algeria',
            }
            const screen = render(
                <TestComponentWithRouter
                    path={`/${section.namePlural}`}
                    customData={{
                        'locales/languages': (type: any) => {
                            if (type === 'read') {
                                return languages
                            }
                        },
                        'locales/countries': (type: any) => {
                            if (type === 'read') {
                                return countries
                            }
                        },
                        'locales/dbLocales': (type: any, params: any) => {
                            if (type === 'create') {
                                createMock(params)
                                return { statusCode: 204 }
                            }
                        },
                    }}
                    routeOptions={routeOptions}
                >
                    <New />
                </TestComponentWithRouter>
            )
            return { screen, languages, countries }
        })
        it('should not submit when required values are missing', async () => {
            const { screen } = await renderForm()
            await uiActions.submitAndCloseForm(screen)
            await waitFor(() =>
                uiAssertions.expectFieldToHaveError(
                    'formfields-language',
                    'Required',
                    screen
                )
            )
            expect(createMock).not.toHaveBeenCalled()
            uiAssertions.expectFieldToHaveError(
                'formfields-country',
                'Required',
                screen
            )
        })
        it('contain all needed field', async () => {
            const { screen, languages, countries } = await renderForm()
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-language'),
                {
                    options: Object.entries(
                        languages as Record<string, string>
                    ).map(([_1, name]: [string, string]) => ({
                        displayName: name,
                    })),
                },
                screen
            )
            await uiAssertions.expectSelectToExistWithOptions(
                screen.getByTestId('formfields-country'),
                {
                    options: Object.entries(
                        countries as Record<string, string>
                    ).map(([_1, name]: [string, string]) => ({
                        displayName: name,
                    })),
                },
                screen
            )
        })
        it('should have a cancel button with a link back to the list view', async () => {
            const { screen } = await renderForm()
            const cancelButton = screen.getByTestId('form-cancel-link')
            expect(cancelButton).toBeVisible()
            expect(cancelButton).toHaveAttribute('href', `/locales`)
        })
        it('should submit the data', async () => {
            const { screen, languages, countries } = await renderForm()

            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-language'),
                1,
                screen
            )
            await uiActions.pickOptionFromSelect(
                screen.getByTestId('formfields-country'),
                0,
                screen
            )
            await uiActions.submitAndCloseForm(screen)
            await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1))
            expect(createMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    id: undefined,
                    params: {
                        country: Object.entries(
                            countries as Record<string, string>
                        )[0][0],
                        language: Object.entries(
                            languages as Record<string, string>
                        )[1][0],
                    },
                })
            )
        })
    })
})
