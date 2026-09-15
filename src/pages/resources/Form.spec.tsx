import { faker } from '@faker-js/faker'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import schemaMock from '../../__mocks__/schema/document.json'
import { FOOTER_ID } from '../../app/layout/Layout'
import { SECTIONS_MAP } from '../../lib'
import {
    randomDhis2Id,
    testCustomAttribute,
    testResources,
} from '../../testUtils/builders'
import { generateRenderer } from '../../testUtils/generateRenderer'
import TestComponentWithRouter from '../../testUtils/TestComponentWithRouter'
import { uiActions } from '../../testUtils/uiActions'
import { uiAssertions } from '../../testUtils/uiAssertions'
import { Component as Edit } from './Edit'
import { Component as New } from './New'
import resetAllMocks = jest.resetAllMocks

const section = SECTIONS_MAP.document
const mockSchema = schemaMock

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: any) => fn,
}))

describe('Resources form tests', () => {
    const createFileResourceMock = jest.fn()
    const createDocumentMock = jest.fn()
    const updateDocumentMock = jest.fn()
    const uploadedFileResourceId = randomDhis2Id()

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
        const renderForm = generateRenderer(
            { section, mockSchema },
            (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}`}
                        customData={{
                            attributes: () => ({ attributes }),
                            fileResources: (type: any, params: any) => {
                                if (type === 'create') {
                                    createFileResourceMock(params)
                                    return {
                                        response: {
                                            fileResource: {
                                                id: uploadedFileResourceId,
                                            },
                                        },
                                    }
                                }
                            },
                            documents: (type: any, params: any) => {
                                if (type === 'create') {
                                    createDocumentMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    return {
                                        pager: { total: 0 },
                                        documents: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <New />
                    </TestComponentWithRouter>
                )
                return { screen, attributes }
            }
        )

        it('should default to the file resource type with the file fields visible', async () => {
            const { screen } = await renderForm()

            uiAssertions.expectNameFieldExist('', screen)
            uiAssertions.expectCodeFieldExist('', screen)

            const typeField = screen.getByTestId('formfields-resourceType')
            const selectInput = within(typeField).getByTestId(
                'dhis2-uicore-select-input'
            )
            expect(selectInput).toHaveTextContent('File')

            uiAssertions.expectCheckboxFieldToExist('attachment', false, screen)
            expect(screen.getByTestId('formfields-file')).toBeVisible()
            expect(
                screen.queryByTestId('formfields-url')
            ).not.toBeInTheDocument()
        })

        it('should switch to the URL fields when the resource type is changed', async () => {
            const { screen } = await renderForm()

            const typeField = screen.getByTestId('formfields-resourceType')
            await uiActions.pickOptionFromSelect(typeField, 1, screen)

            expect(screen.getByTestId('formfields-url')).toBeVisible()
            expect(
                screen.queryByTestId('formfields-file')
            ).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('formfields-attachment')
            ).not.toBeInTheDocument()
        })

        it('should not submit a URL resource without a url', async () => {
            const { screen } = await renderForm()
            await uiActions.enterName(faker.company.name(), screen)

            const typeField = screen.getByTestId('formfields-resourceType')
            await uiActions.pickOptionFromSelect(typeField, 1, screen)

            await uiActions.submitForm(screen)

            expect(createDocumentMock).not.toHaveBeenCalled()
            uiAssertions.expectFieldToHaveError(
                'formfields-url',
                'A URL is required',
                screen
            )
        })

        it('should upload the file then create the document for a file resource', async () => {
            const { screen } = await renderForm()
            const aName = faker.company.name()

            await uiActions.enterName(aName, screen)
            await uiActions.clickOnCheckboxField('attachment', screen)

            const file = new File(['hello world'], 'hello.txt', {
                type: 'text/plain',
            })
            const fileInput = screen
                .getByTestId('formfields-file')
                .querySelector('input[type="file"]') as HTMLInputElement
            await userEvent.upload(fileInput, file)

            await uiActions.submitForm(screen)

            expect(createFileResourceMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        file,
                        domain: 'DOCUMENT',
                    }),
                })
            )
            expect(createDocumentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        type: 'UPLOAD_FILE',
                        external: false,
                        attachment: true,
                        url: uploadedFileResourceId,
                    }),
                })
            )
        })

        it('should create the document directly for a URL resource', async () => {
            const { screen } = await renderForm()
            const aName = faker.company.name()

            await uiActions.enterName(aName, screen)

            const typeField = screen.getByTestId('formfields-resourceType')
            await uiActions.pickOptionFromSelect(typeField, 1, screen)
            await uiActions.enterInputFieldValue(
                'url',
                'https://www.dhis2.org',
                screen
            )

            await uiActions.submitForm(screen)

            expect(createFileResourceMock).not.toHaveBeenCalled()
            expect(createDocumentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: aName,
                        type: 'EXTERNAL_URL',
                        external: true,
                        attachment: false,
                        url: 'https://www.dhis2.org',
                    }),
                })
            )
        })
    })

    describe('Edit', () => {
        const renderForm = (resource: Record<string, unknown>) =>
            generateRenderer({ section, mockSchema }, (routeOptions) => {
                const attributes = [testCustomAttribute({ mandatory: false })]
                const screen = render(
                    <TestComponentWithRouter
                        path={`/${section.namePlural}/:id`}
                        initialEntries={[
                            `/${section.namePlural}/${resource.id}`,
                        ]}
                        customData={{
                            attributes: () => ({ attributes }),
                            fileResources: (type: any, params: any) => {
                                if (type === 'create') {
                                    createFileResourceMock(params)
                                    return {
                                        response: {
                                            fileResource: {
                                                id: uploadedFileResourceId,
                                            },
                                        },
                                    }
                                }
                            },
                            documents: (type: any, params: any) => {
                                if (type === 'replace') {
                                    updateDocumentMock(params)
                                    return { statusCode: 204 }
                                }
                                if (type === 'read') {
                                    if (params?.id) {
                                        return resource
                                    }
                                    return {
                                        pager: { total: 0 },
                                        documents: [],
                                    }
                                }
                            },
                        }}
                        routeOptions={routeOptions}
                    >
                        <Edit />
                    </TestComponentWithRouter>
                )
                return { screen, attributes, resource }
            })()

        it('should block editing a file resource', async () => {
            const resource = testResources({ external: false })
            const { screen } = await renderForm(resource)

            expect(screen.getByText('File resources')).toBeVisible()
            expect(
                screen.queryByTestId('formfields-name')
            ).not.toBeInTheDocument()
        })

        it('should allow editing a URL resource', async () => {
            const resource = testResources({
                external: true,
                url: 'https://www.dhis2.org',
                code: 'RES_CODE',
                attachment: false,
            })
            const { screen } = await renderForm(resource)

            uiAssertions.expectNameFieldExist(resource.name as string, screen)
            uiAssertions.expectInputFieldToExist(
                'url',
                resource.url as string,
                screen
            )

            const newName = faker.company.name()
            await uiActions.enterName(newName, screen)
            await uiActions.submitForm(screen)

            expect(updateDocumentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: newName,
                        type: 'EXTERNAL_URL',
                        external: true,
                        url: resource.url,
                    }),
                })
            )
        })

        it('should default the resource type select to URL', async () => {
            const resource = testResources({
                external: true,
                url: 'https://www.dhis2.org',
                attachment: false,
            })
            const { screen } = await renderForm(resource)

            const typeField = screen.getByTestId('formfields-resourceType')
            const selectInput = within(typeField).getByTestId(
                'dhis2-uicore-select-input'
            )
            expect(selectInput).toHaveTextContent('URL')
        })

        it('should allow switching a URL resource to a file upload', async () => {
            const resource = testResources({
                external: true,
                url: 'https://www.dhis2.org',
                attachment: false,
            })
            const { screen } = await renderForm(resource)

            const typeField = screen.getByTestId('formfields-resourceType')
            await uiActions.pickOptionFromSelect(typeField, 0, screen)

            expect(screen.getByTestId('formfields-file')).toBeVisible()
            expect(
                screen.queryByTestId('formfields-url')
            ).not.toBeInTheDocument()

            const file = new File(['hello world'], 'hello.txt', {
                type: 'text/plain',
            })
            const fileInput = screen
                .getByTestId('formfields-file')
                .querySelector('input[type="file"]') as HTMLInputElement
            await userEvent.upload(fileInput, file)

            await uiActions.submitForm(screen)

            expect(createFileResourceMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        file,
                        domain: 'DOCUMENT',
                    }),
                })
            )
            expect(updateDocumentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        type: 'UPLOAD_FILE',
                        external: false,
                        url: uploadedFileResourceId,
                    }),
                })
            )
        })
    })
})
