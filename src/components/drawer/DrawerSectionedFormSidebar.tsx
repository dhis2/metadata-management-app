import cx from 'classnames'
import React, { useMemo } from 'react'
import { createSearchParams, Link, useSearchParams } from 'react-router-dom'
import {
    FORM_SECTION_PARAM_KEY,
    scrollToSection,
    useSectionedFormContext,
} from '../../lib'
import css from '../sectionedForm/SectionFormSidebar.module.css'

export const DrawerSectionedFormSidebar = ({
    selectedSection,
}: {
    selectedSection?: string
}) => {
    const { sections } = useSectionedFormContext()

    const items = sections.map((section) => (
        <DrawerSectionedFormSidebarItem
            key={section.name}
            active={selectedSection === section.name}
            sectionName={section.name}
        >
            {section.label}
        </DrawerSectionedFormSidebarItem>
    ))
    return <nav className={cx(css.sidebar, css.sidebarSecondary)}>{items}</nav>
}

export type SectionedFormSidebarItemProps = {
    children: React.ReactNode
    active: boolean
    sectionName: string
}

export const DrawerSectionedFormSidebarItem = ({
    children,
    active,
    sectionName,
}: SectionedFormSidebarItemProps) => {
    const [searchParams] = useSearchParams()

    // we want to use a link in the list (due to semantic html and accessbility reasons)
    // thus we need to create new SearchParams with the section parameter
    // in case we want to preserve other search-params
    const toWithSectionParam = useMemo(() => {
        const paramsObject = Object.fromEntries(searchParams.entries())
        delete paramsObject[FORM_SECTION_PARAM_KEY]
        return createSearchParams({
            ...paramsObject,
        }).toString()
    }, [searchParams])

    return (
        <Link
            className={cx(css.listItem, {
                [css.selected]: active,
            })}
            to={{ search: toWithSectionParam }}
            onClick={(event) => {
                scrollToSection(
                    sectionName,
                    undefined,
                    event.currentTarget.closest(
                        '[data-sectioned-form-root]'
                    ) as HTMLElement | null
                )
            }}
        >
            {children}
        </Link>
    )
}
