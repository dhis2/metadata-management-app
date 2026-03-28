import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    createHashRouter,
    RouterProvider,
    Outlet,
    Navigate,
    Route,
    createRoutesFromElements,
    useParams,
} from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'
import {
    SECTIONS_MAP,
    Section,
    SchemaSection,
    NonSchemaSection,
    OVERVIEW_SECTIONS,
    getSectionPath,
    isModuleNotFoundError,
    isValidUid,
    routePaths,
    getOverviewPath,
    isMergableSection,
} from '../../lib'
import { OverviewSection } from '../../types'
import { Layout, Breadcrumbs, BreadcrumbItem } from '../layout'
import {
    SectionAuthorizedGuard,
    SectionCanMergeGuard,
} from './AuthorizationGuards'
import { DefaultErrorRoute } from './DefaultErrorRoute'
import { LegacyAppRedirect } from './LegacyAppRedirect'
import { SyncUrlWithGlobalShell } from './SyncUrlWithGlobalShell'
import { RouteHandle } from './types'
// This loads all the overview routes in the same chunk since they resolve to the same promise
// see https://reactrouter.com/en/main/route/lazy#multiple-routes-in-a-single-file
// Overviews are small, and the AllOverview would load all the other overviews anyway,
// so it's propbably better to load them all at once

// function foo<T extends boolean>(returnString: T): T extends true ? string : number;
// function foo<T extends boolean>(returnString: T): string | number {
//   return returnString ? String(Math.random()) : Math.random();
// }

// function getStatsById(userId: string, timeWindow: TimeWindow, convertJSONOutput: true): Promise<IPlayerStats>;
// function getStatsById(userId: string, timeWindow: TimeWindow, convertJSONOutput: false): Promise<IStatsItem[]>;
// function getStatsById(
//     userId: string,
//     timeWindow: TimeWindow = TimeWindow.Alltime,
//     convertJSONOutput: boolean = true
//   ): Promise<IPlayerStats | IStatsItem[]>

function createOverviewLazyRouteFunction(
    componentName: string, //keyof typeof import('../../pages/overview/'),
    section?: OverviewSection
) {
    return async () => {
        const routeComponent = await import(`../../pages/overview/`)
        const name = componentName as keyof typeof routeComponent
        const Component = routeComponent[name]
        if (!Component && section) {
            return {
                element: <LegacyAppRedirect section={section} />,
            }
        }

        return {
            Component: routeComponent[name],
        }
    }
}

function createSectionLazyRouteFunction(
    section: Section,
    componentFileName: 'New' | 'Edit' | 'List' | 'Merge' | 'Clone'
) {
    return async () => {
        try {
            return await import(
                `../../pages/${
                    section.routeName || section.namePlural
                }/${componentFileName}`
            )
        } catch (e) {
            // means the component is not implemented yet
            // fallback to redirect to legacy
            if (isModuleNotFoundError(e)) {
                return {
                    element: (
                        <LegacyAppRedirect
                            section={section}
                            isNew={componentFileName === 'New'}
                        />
                    ),
                }
            }
            throw e
        }
    }
}

const VerifyModelId = () => {
    const { id } = useParams()

    if (!isValidUid(id)) {
        throw new Error('Invalid model id.')
    }
    return <Outlet />
}

const sectionsNoNewRoute = new Set<SchemaSection | NonSchemaSection>([
    SECTIONS_MAP.categoryOptionCombo,
    SECTIONS_MAP.organisationUnitLevel,
])

const schemaSectionRoutes = Object.values(SECTIONS_MAP).map((section) => (
    <Route
        key={section.namePlural}
        path={getSectionPath(section)}
        handle={
            {
                section,
                crumb: () => (
                    <BreadcrumbItem
                        label={
                            OVERVIEW_SECTIONS[section.parentSectionKey]
                                .titlePlural
                        }
                        to={`/${getOverviewPath(
                            OVERVIEW_SECTIONS[section.parentSectionKey]
                        )}`}
                    />
                ),
            } satisfies RouteHandle
        }
        element={
            <>
                <Breadcrumbs />
                <Outlet />
            </>
        }
    >
        <Route index lazy={createSectionLazyRouteFunction(section, 'List')} />
        <Route
            handle={
                {
                    hideSidebar: true,
                    crumb: (matchInfo) => (
                        <BreadcrumbItem
                            label={section.title}
                            to={matchInfo.pathname}
                        />
                    ),
                } satisfies RouteHandle
            }
        >
            {!sectionsNoNewRoute.has(section) && (
                <Route
                    path={routePaths.sectionNew}
                    lazy={createSectionLazyRouteFunction(section, 'New')}
                    handle={
                        {
                            crumb: (matchInfo) => (
                                <BreadcrumbItem
                                    label={i18n.t('New {{modelName}}', {
                                        modelName: section.title,
                                    })}
                                    to={matchInfo.pathname}
                                />
                            ),
                        } satisfies RouteHandle
                    }
                />
            )}
            {isMergableSection(section) && (
                <Route element={<SectionCanMergeGuard />}>
                    <Route
                        path={routePaths.merge}
                        lazy={createSectionLazyRouteFunction(section, 'Merge')}
                        handle={
                            {
                                crumb: (matchInfo) => (
                                    <BreadcrumbItem
                                        label={i18n.t('Merge {{modelName}}', {
                                            modelName: section.titlePlural,
                                        })}
                                        to={matchInfo.pathname}
                                    />
                                ),
                            } satisfies RouteHandle
                        }
                    />
                </Route>
            )}
            {
                <Route
                    path={`${routePaths.clone}`}
                    lazy={createSectionLazyRouteFunction(section, 'Clone')}
                    handle={
                        {
                            crumb: (matchInfo) => (
                                <BreadcrumbItem
                                    label={i18n.t('Clone {{modelName}}', {
                                        modelName: section.title,
                                    })}
                                    to={matchInfo.pathname}
                                />
                            ),
                        } satisfies RouteHandle
                    }
                />
            }
            <Route path=":id" element={<VerifyModelId />}>
                <Route
                    index
                    handle={
                        {
                            crumb: (matchInfo) => (
                                <BreadcrumbItem
                                    label={i18n.t('Edit {{modelName}}', {
                                        modelName: section.title,
                                    })}
                                    to={matchInfo.pathname}
                                />
                            ),
                        } satisfies RouteHandle
                    }
                    lazy={createSectionLazyRouteFunction(section, 'Edit')}
                />
            </Route>
        </Route>
    </Route>
))

const routes = createRoutesFromElements(
    <Route
        element={
            <QueryParamProvider adapter={ReactRouter6Adapter}>
                <SyncUrlWithGlobalShell />
                <Layout />
            </QueryParamProvider>
        }
        errorElement={<DefaultErrorRoute />}
    >
        <Route
            path="/"
            element={<Navigate to={routePaths.overviewRoot} replace />}
        />
        <Route element={<SectionAuthorizedGuard />}>
            <Route path={routePaths.overviewRoot}>
                <Route
                    index
                    lazy={createOverviewLazyRouteFunction('AllOverview')}
                />
                {Object.values(OVERVIEW_SECTIONS).map((section) => (
                    <Route
                        key={section.name}
                        path={getSectionPath(section)}
                        lazy={createOverviewLazyRouteFunction(
                            section.componentName,
                            section
                        )}
                        handle={{ section } satisfies RouteHandle}
                    />
                ))}
            </Route>
            {schemaSectionRoutes}
        </Route>
    </Route>
)

export const hashRouter = createHashRouter(routes)
export const ConfiguredRouter = () => {
    return <RouterProvider router={hashRouter} />
}
