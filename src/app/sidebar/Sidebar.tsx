import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { IconChevronLeft24, IconLaunch16, InputEventPayload } from '@dhis2/ui'
import cx from 'classnames'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { matchPath, NavLink, useLocation } from 'react-router-dom'
import { HidePreventUnmount } from '../../components'
import { useCurrentUserAuthorities, useSystemSettingsStore } from '../../lib'
import styles from './Sidebar.module.css'
import { LinkItem, ParentLink, useSidebarLinks } from './SidebarLinks'
import {
    Sidenav,
    SidenavFilter,
    SidenavItems,
    SidenavLink,
    SidenavParent,
} from './sidenav'

interface SidebarNavLinkProps {
    label: string
    to: string
    disabled?: boolean
    end?: boolean
}

const SidebarNavLink = ({ to, label, disabled, end }: SidebarNavLinkProps) => {
    return (
        <SidenavLink
            to={to}
            disabled={disabled}
            LinkComponent={NavLink}
            label={label}
            end={end}
        />
    )
}

interface SidebarParentProps {
    isFiltered: boolean
    label: string
    links: LinkItem[]
}

const SidebarParent = ({ label, links, isFiltered }: SidebarParentProps) => {
    const { pathname } = useLocation()
    // Check if any of the children match the current path
    // If they do, parent should be open by default
    const routePathMatch = links.some((link) => {
        return matchPath(`${link.to}/*`, pathname)
    })
    const [isOpen, setIsOpen] = useState(routePathMatch)
    // use separate state for "open" while filtered
    // so parent can be closed while filtered and fall back to previous open
    // state when filter is cleared
    const [openFiltered, setOpenFiltered] = useState(false)

    useEffect(() => {
        if (isFiltered) {
            setOpenFiltered(isFiltered)
        }
    }, [isFiltered])

    const handleOpen = () => {
        if (isFiltered) {
            setOpenFiltered(!openFiltered)
        } else {
            setIsOpen(!isOpen)
        }
    }

    const open = isFiltered ? openFiltered : isOpen
    return (
        <SidenavParent label={label} open={open} onClick={handleOpen}>
            {links.map(({ to, label }) => (
                <SidebarNavLink key={label} to={to} label={label} />
            ))}
        </SidenavParent>
    )
}

const matchLabel = (label: string, filterValue: string) =>
    label.toLowerCase().includes(filterValue.toLowerCase())

const integrityLabel = i18n.t('Metadata Integrity Checks')
const metadataImportLabel = i18n.t('Import Metadata')
const metadataExportLabel = i18n.t('Export Metadata')
const externalLinkLabels = [
    integrityLabel,
    metadataImportLabel,
    metadataExportLabel,
]

const ExternalAppLinks = React.memo(
    ({ filterValue }: { filterValue: string }) => {
        const userAuthorities = useCurrentUserAuthorities()
        const config = useConfig()
        const globalShellEnabled =
            useSystemSettingsStore(
                (state) => state.systemSettings?.globalShellEnabled
            ) ?? false
        const url = config?.systemInfo?.contextPath || ''

        const canOpenDataAdministration =
            userAuthorities.has('ALL') ||
            userAuthorities.has('M_dhis-web-data-administration')
        const canOpenImportExport =
            userAuthorities.has('ALL') ||
            userAuthorities.has('M_dhis-web-import-export')
        const filteredViewImport = filterValue
            ? matchLabel(metadataImportLabel, filterValue)
            : true
        const filteredViewExport = filterValue
            ? matchLabel(metadataExportLabel, filterValue)
            : true
        return (
            <>
                {canOpenDataAdministration &&
                    (filterValue
                        ? matchLabel(integrityLabel, filterValue)
                        : true) && (
                        <SidenavLink
                            to={`${url}/${
                                globalShellEnabled
                                    ? 'apps/data-administration'
                                    : 'dhis-web-data-administration/index.html'
                            }#/data-integrity`}
                            label={integrityLabel}
                            icon={<IconLaunch16 />}
                            external={true}
                        />
                    )}
                {canOpenImportExport && (
                    <>
                        {filteredViewImport ? (
                            <SidenavLink
                                to={`${url}/${
                                    globalShellEnabled
                                        ? 'apps/import-export'
                                        : 'dhis-web-import-export/index.html'
                                }#/import/metadata`}
                                label={metadataImportLabel}
                                icon={<IconLaunch16 />}
                                external={true}
                            />
                        ) : null}
                        {filteredViewExport ? (
                            <SidenavLink
                                to={`${url}/${
                                    globalShellEnabled
                                        ? 'apps/import-export'
                                        : 'dhis-web-import-export/index.html'
                                }#/export/metadata`}
                                label={metadataExportLabel}
                                icon={<IconLaunch16 />}
                                external={true}
                            />
                        ) : null}
                    </>
                )}
            </>
        )
    }
)
ExternalAppLinks.displayName = 'ExternalAppLinks'

export const Sidebar = ({
    className,
    hideSidebar,
}: {
    className?: string
    hideSidebar?: boolean
}) => {
    const sidebarLinks = useSidebarLinks()
    const [collapsed, setCollapsed] = useState(false)
    const [filterValue, setFilterValue] = useState('')

    const handleFilterChange = (input: InputEventPayload) => {
        setFilterValue(input.value ?? '')
    }

    const isFiltered = filterValue !== ''
    const filteredSidebarLinks: ParentLink[] = sidebarLinks.map(
        ({ label, links }) => ({
            label,
            links: matchLabel(label, filterValue)
                ? links // show all if parent label matches
                : links.filter(({ label }) => matchLabel(label, filterValue)),
        })
    )

    const numberOfFilteredLinks = filteredSidebarLinks.reduce(
        (acc, curr) => acc + curr.links.length,
        0
    )
    const externalLinksLabelCount =
        externalLinkLabels.filter((label) => matchLabel(label, filterValue))
            ?.length ?? 0

    const noMatch =
        isFiltered &&
        numberOfFilteredLinks === 0 &&
        externalLinksLabelCount === 0

    useEffect(() => {
        if (hideSidebar !== undefined) {
            setCollapsed(hideSidebar)
        }
    }, [hideSidebar])

    return (
        <aside
            className={cx(styles.asideWrapper, className, {
                [styles.collapsed]: collapsed,
            })}
        >
            <Sidenav>
                <SidenavFilter onChange={handleFilterChange} />
                <SidenavItems>
                    <div>
                        <li>
                            <SidebarNavLink
                                to="/overview"
                                label={i18n.t('Metadata Overview')}
                                end={true}
                            />
                            <ul className={styles.sidenavSubmenu}>
                                <SidebarNavLink
                                    to="/overview/all"
                                    label={i18n.t('All metadata')}
                                    end={true}
                                />
                            </ul>
                        </li>
                    </div>
                    {noMatch && <NoMatchMessage filter={filterValue} />}
                    {filteredSidebarLinks.map(({ label, links }) => (
                        <HidePreventUnmount key={label} hide={links.length < 1}>
                            <SidebarParent
                                label={label}
                                isFiltered={isFiltered}
                                links={links}
                            />
                        </HidePreventUnmount>
                    ))}
                    <ExternalAppLinks filterValue={filterValue} />
                </SidenavItems>
            </Sidenav>
            <button
                className={styles.collapseButton}
                type="button"
                onClick={() => setCollapsed(!collapsed)}
            >
                <div
                    className={cx(styles.iconWrapper, {
                        [styles.collapsed]: collapsed,
                    })}
                >
                    <IconChevronLeft24 />
                </div>
            </button>
        </aside>
    )
}

type NoMatchMessageProps = {
    filter: string
}

const NoMatchMessage = ({ filter }: PropsWithChildren<NoMatchMessageProps>) => (
    <div className={styles.noMatchMessage}>
        {i18n.t('No menu items found for')} <br />‘{filter}’
    </div>
)

export default Sidebar
