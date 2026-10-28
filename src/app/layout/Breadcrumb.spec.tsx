import '@testing-library/jest-dom'
import { configure, render } from '@testing-library/react'
import React from 'react'
import { useMatches, HashRouter } from 'react-router-dom'
import {
    getOverviewPath,
    getSectionPath,
    OVERVIEW_SECTIONS,
    SECTIONS_MAP,
} from '../../lib'
import { MatchRouteHandle, RouteHandle } from '../routes/types'
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumb'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useMatches: jest.fn(),
}))

const mockedUseMatches = jest.mocked(useMatches)

let mockId = 0

const mockHandle = (handle: RouteHandle) => {
    return { id: `${mockId++}`, handle } as MatchRouteHandle
}

beforeEach(() => {
    configure({ testIdAttribute: 'data-test' })
    jest.resetAllMocks()
    mockedUseMatches.mockReturnValue([
        mockHandle({
            crumb: () => <div>Crumb 1</div>,
        }),

        mockHandle({
            crumb: () => <div>Crumb 2</div>,
        }),
    ])
})

describe('BreadcrumbItem', () => {
    it('should render a link based on the given label', () => {
        const { getByRole } = render(
            <BreadcrumbItem
                label={'Data element'}
                to={`/${getSectionPath(SECTIONS_MAP.dataElement)}`}
            />,
            { wrapper: HashRouter }
        )

        const DataElementLink = getByRole('link')
        expect(DataElementLink).toBeDefined()
        expect(DataElementLink).toHaveTextContent('Data element')
        expect(DataElementLink).toHaveAttribute('href', '#/dataElements')
    })

    it('should render a correct link to overview-section using plural title if overview-section', () => {
        const { getByRole } = render(
            <BreadcrumbItem
                to={`/${getOverviewPath(OVERVIEW_SECTIONS.dataElement)}`}
                label={'Data elements'}
            />,
            { wrapper: HashRouter }
        )

        const DataElementOverviewLink = getByRole('link')
        expect(DataElementOverviewLink).toBeDefined()
        expect(DataElementOverviewLink).toHaveTextContent('Data elements')
        expect(DataElementOverviewLink).toHaveAttribute(
            'href',
            '#/overview/dataElements'
        )
    })

    it('should render a learn-more link next to the label when it is the current page and a learnMoreUrl is given', () => {
        const { getByRole, getByText } = render(
            <BreadcrumbItem
                label={'Data elements'}
                to={'/'}
                learnMoreUrl={'https://docs.dhis2.org/data-elements'}
            />,
            { wrapper: HashRouter }
        )

        expect(getByText('Data elements')).toBeDefined()
        const learnMoreLink = getByRole('link')
        expect(learnMoreLink).toHaveAttribute(
            'href',
            'https://docs.dhis2.org/data-elements'
        )
        expect(learnMoreLink).toHaveAttribute('target', '_blank')
    })

    it('should not render a learn-more link when no learnMoreUrl is given', () => {
        const { queryByRole } = render(
            <BreadcrumbItem label={'Data elements'} to={'/'} />,
            { wrapper: HashRouter }
        )

        expect(queryByRole('link')).not.toBeInTheDocument()
    })
})
describe('Breadcrumbs', () => {
    it('should render crumb components in handle', () => {
        const { getByText } = render(<Breadcrumbs />, { wrapper: HashRouter })

        expect(getByText('Crumb 1')).toBeDefined()
        expect(getByText('Crumb 2')).toBeDefined()
    })
    it('should not crash when no crumb components are in handle ', () => {
        mockedUseMatches.mockReturnValue([mockHandle({ hideSidebar: true })])

        const { queryByText } = render(<Breadcrumbs />)

        expect(queryByText('Crumb 1')).not.toBeInTheDocument()
        expect(queryByText('Crumb 2')).not.toBeInTheDocument()
    })

    describe('with BreadcrumbItem', () => {
        beforeEach(() => {
            mockedUseMatches.mockReturnValue([
                mockHandle({
                    crumb: () => (
                        <BreadcrumbItem
                            to={`/${getOverviewPath(
                                OVERVIEW_SECTIONS.dataElement
                            )}`}
                            label={OVERVIEW_SECTIONS.dataElement.titlePlural}
                        />
                    ),
                }),
                mockHandle({
                    crumb: () => (
                        <BreadcrumbItem
                            to={`/${getSectionPath(SECTIONS_MAP.dataElement)}`}
                            label={SECTIONS_MAP.dataElement.titlePlural}
                        />
                    ),
                }),
            ])
        })
        it('should render links in order', () => {
            const { getAllByRole } = render(<Breadcrumbs />, {
                wrapper: HashRouter,
            })

            const links = getAllByRole('link')

            expect(links).toHaveLength(2)
            const [DataElementOverViewLink, DataElementListLink] = links

            expect(DataElementOverViewLink).toHaveTextContent('Data elements')
            expect(DataElementOverViewLink).toHaveAttribute(
                'href',
                '#/overview/dataElements'
            )

            expect(DataElementListLink).toHaveTextContent('Data element')
            expect(DataElementListLink).toHaveAttribute(
                'href',
                '#/dataElements'
            )

            // see https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
            expect(
                DataElementOverViewLink.compareDocumentPosition(
                    DataElementListLink
                )
            ).toBe(4)
        })
    })
})
