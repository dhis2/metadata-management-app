import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
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
    useBoundResourceQueryFn,
} from '../../lib'
import { OverviewSection } from '../../types'
import { Layout, BreadcrumbItem } from '../layout'
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
    componentFileName: 'New' | 'Edit' | 'List' | 'Merge' | 'Duplicate' | 'Move'
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
                    element: section.duplicable ? (
                        <LegacyAppRedirect
                            section={section}
                            isNew={componentFileName === 'New'}
                        />
                    ) : (
                        <NoticeBox
                            title={i18n.t('Duplication not available yet.')}
                        >
                            <p>
                                {i18n.t(
                                    '{{-sectionName}} cannot be duplicated.',
                                    { sectionName: section.titlePlural }
                                )}
                            </p>
                        </NoticeBox>
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

const EditBreadcrumbItem = ({
    section,
    pathname,
    id,
}: {
    section: Section
    pathname: string
    id: string
}) => {
    const queryFn = useBoundResourceQueryFn()

    const { data } = useQuery({
        queryKey: [
            {
                resource: section.namePlural,
                id,
                params: { fields: ['displayName'] },
            },
        ],
        queryFn: queryFn<{ displayName: string }>,
    })

    const label = data?.displayName
        ? i18n.t('Edit: {{objectName}}', {
              objectName: data.displayName,
              interpolation: { escapeValue: false },
          })
        : i18n.t('Edit')

    return <BreadcrumbItem label={label} to={pathname} />
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
                crumb: () => {
                    const overview: OverviewSection =
                        OVERVIEW_SECTIONS[section.parentSectionKey]
                    return (
                        <BreadcrumbItem
                            label={
                                overview.breadcrumbLabel ?? overview.titlePlural
                            }
                            to={`/${getOverviewPath(overview)}`}
                        />
                    )
                },
            } satisfies RouteHandle
        }
        element={<Outlet />}
    >
        <Route
            index
            lazy={createSectionLazyRouteFunction(section, 'List')}
            handle={
                {
                    crumb: (matchInfo) => (
                        <BreadcrumbItem
                            label={section.titlePlural}
                            to={matchInfo.pathname}
                        />
                    ),
                } satisfies RouteHandle
            }
        />
        <Route
            handle={
                {
                    hideSidebar: true,
                    crumb: (matchInfo) => (
                        <BreadcrumbItem
                            label={section.titlePlural}
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
            {section === SECTIONS_MAP.organisationUnit && (
                <Route
                    path={routePaths.move}
                    lazy={() => import('../../pages/organisationUnits/Move')}
                    handle={
                        {
                            crumb: (matchInfo) => (
                                <BreadcrumbItem
                                    label={i18n.t('Move organisation units')}
                                    to={matchInfo.pathname}
                                />
                            ),
                        } satisfies RouteHandle
                    }
                />
            )}
            {
                <Route
                    path={`${routePaths.duplicate}`}
                    lazy={createSectionLazyRouteFunction(section, 'Duplicate')}
                    handle={
                        {
                            crumb: (matchInfo) => (
                                <BreadcrumbItem
                                    label={i18n.t('Duplicate {{modelName}}', {
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
                            crumb: (matchInfo) => {
                                const id = matchInfo.params.id
                                if (id === undefined) {
                                    return null
                                }
                                return (
                                    <EditBreadcrumbItem
                                        section={section}
                                        id={id}
                                        pathname={matchInfo.pathname}
                                    />
                                )
                            },
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
