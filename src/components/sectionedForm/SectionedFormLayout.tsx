import React from 'react'
import css from './SectionedFormLayout.module.css'

export type SectionedFormLayoutProps = {
    children: React.ReactNode
    sidebar?: React.ReactNode
}
export const SectionedFormLayout = ({
    children,
    sidebar,
}: SectionedFormLayoutProps) => {
    return (
        <div className={css.layoutGrid} data-sectioned-form-root>
            <SectionedFormLayoutSidebar>{sidebar}</SectionedFormLayoutSidebar>
            <SectionedFormLayoutMain>{children}</SectionedFormLayoutMain>
        </div>
    )
}

const SectionedFormLayoutSidebar = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return <div className={css.sidebar}>{children}</div>
}
const SectionedFormLayoutMain = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return <div className={css.main}>{children}</div>
}

SectionedFormLayout.Sidebar = SectionedFormLayoutSidebar
SectionedFormLayout.Main = SectionedFormLayoutMain
