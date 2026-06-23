import cx from 'classnames'
import React from 'react'
import css from './SectionedFormLayout.module.css'

export type SectionedFormLayoutProps = {
    children: React.ReactNode
    sidebar?: React.ReactNode
    footer?: React.ReactNode
    dataTest?: string
}
export const SectionedFormLayout = ({
    children,
    sidebar,
    footer,
    dataTest,
}: SectionedFormLayoutProps) => {
    const grid = (
        <div
            className={cx(css.layoutGrid, {
                [css.layoutGridInWrapper]: !!footer,
            })}
            data-test={!footer ? dataTest : undefined}
        >
            <SectionedFormLayoutSidebar>{sidebar}</SectionedFormLayoutSidebar>
            <SectionedFormLayoutMain>{children}</SectionedFormLayoutMain>
        </div>
    )

    if (!footer) {
        return grid
    }

    return (
        <div className={css.layoutWrapper} data-test={dataTest}>
            {grid}
            <div className={css.stickyFooter}>{footer}</div>
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
