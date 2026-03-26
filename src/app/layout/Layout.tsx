import cx from 'classnames'
import React from 'react'
import { createPortal } from 'react-dom'
import { Outlet, useMatches } from 'react-router-dom'
import { MatchRouteHandle } from '../routes/types'
import { Sidebar } from '../sidebar'
import { Breadcrumbs } from './Breadcrumb'
import css from './Layout.module.css'

interface BaseLayoutProps {
    children: React.ReactNode
    sidebar?: React.ReactNode
}

export const FOOTER_ID = 'main-layout-footer'
export const BaseLayout = ({ children, sidebar }: BaseLayoutProps) => {
    return (
        <div className={css.wrapper}>
            {sidebar}
            <div className={css.main}>
                <Breadcrumbs />
                <div className={css.mainContent}>{children}</div>
            </div>
            <div id={FOOTER_ID} className={css.footer}></div>
        </div>
    )
}

export const SidebarLayout = ({
    children,
    hideSidebar,
}: {
    children: React.ReactNode
    hideSidebar?: boolean
}) => {
    return (
        <BaseLayout
            sidebar={
                <Sidebar
                    hideSidebar={hideSidebar}
                    className={cx(css.sidebar, { [css.hide]: hideSidebar })}
                />
            }
        >
            {children}
        </BaseLayout>
    )
}

export const Layout = () => {
    const matches = useMatches() as MatchRouteHandle[]
    // routes can specify a handle to hide the sidebar
    // hide the sidebar if any matched route specifies it
    const hideSidebar = matches.some((match) => match.handle?.hideSidebar)
    return (
        <SidebarLayout hideSidebar={hideSidebar}>
            <Outlet />
        </SidebarLayout>
    )
}

/* The footer is often used as part of a form - for formActions like Save and Cancel
    Layout wise it's easier to have the footer as part of the main layout
       - scroll position of "main" content is correct by default (rather than scroll behind the footer)
    thus we use react portal to render the footer contents within the footer div.
*/
export const createPortalToFooter = (children: React.ReactNode) => {
    const footerElement = document.getElementById(FOOTER_ID)

    if (!footerElement) {
        return null
    }

    return createPortal(children, footerElement)
}

export default Layout
