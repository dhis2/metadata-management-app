import { useCallback, useEffect, useMemo } from 'react'
import {
    useQueryParam,
    createEnumParam,
    withDefault,
    UrlUpdateType,
} from 'use-query-params'
import { useSectionedFormContext } from './SectionedFormContext'

type UseSelectedSectionSetHandlerOptions = {
    scroll?: boolean
    urlUpdateType?: UrlUpdateType
    scrollOptions?: ScrollIntoViewOptions
}

type UseSelectedSectionSetHandler = (
    newValue: string,
    options?: UseSelectedSectionSetHandlerOptions
) => void

const defaultSetHandlerOptions: UseSelectedSectionSetHandlerOptions = {
    scroll: false,
    urlUpdateType: 'replaceIn',
    scrollOptions: { behavior: 'smooth' },
}

export const FORM_SECTION_PARAM_KEY = 'section'

export const scrollToSection = (
    section: string,
    scrollOptions?: ScrollOptions,
    root: HTMLElement | Document | null = document
) => {
    // wait for the event loop to be cleared to ensure that the element is in the DOM
    // before scrolling to it, eg if navigating from a link
    setTimeout(() => {
        const target =
            root instanceof Document || root === null
                ? document.getElementById(section)
                : root.querySelector<HTMLElement>(`#${CSS.escape(section)}`)
        target?.scrollIntoView(scrollOptions)
    }, 0)
}

export const useSelectedSectionFromQueryParams = () => {
    const { sections } = useSectionedFormContext()

    const paramConfig = useMemo(
        () =>
            withDefault(
                createEnumParam(sections.map((s) => s.name)),
                undefined
            ),
        [sections]
    )
    const [selected, originalHandler] = useQueryParam(
        FORM_SECTION_PARAM_KEY,
        paramConfig,
        {
            removeDefaultsFromUrl: true,
        }
    )
    // wrap handler to provide ability to scroll to section
    const setHandler: UseSelectedSectionSetHandler = useCallback(
        (newValue, options) => {
            const { scroll, scrollOptions, urlUpdateType } = {
                ...defaultSetHandlerOptions,
                ...options,
            }
            originalHandler(newValue, urlUpdateType)
            if (scroll) {
                scrollToSection(newValue, scrollOptions)
            }
        },
        [originalHandler]
    )
    return [selected, setHandler] as const
}

/**
 * Update the selected section (in searchParams) based on the section that is in view
 * This keeps the selected section in sync with the section that is in view.
 */
export const useSyncSelectedSectionWithScroll = (
    setSelectedSection?: (name: string) => void,
    root?: HTMLElement | null
) => {
    const { sections } = useSectionedFormContext()
    const [selectedSection, setSection] = useSelectedSectionFromQueryParams()

    useEffect(() => {
        if (setSelectedSection) {
            return
        }

        const elem = selectedSection && document.getElementById(selectedSection)
        if (elem) {
            scrollToSection(selectedSection, { behavior: 'instant' })
        }
        // we only do this on first render, for links - scrollToSection should be called imperatively
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const sectionElements = sections
            .map((section) => document.getElementById(section.name))
            .filter((s) => !!s)
        const currentInView = new Map<string, IntersectionObserverEntry>()
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        currentInView.set(entry.target.id, entry)
                    } else {
                        currentInView.delete(entry.target.id)
                    }
                })
                // Find the section with the highest intersection ratio
                let maxRatio = 0
                let bestSection: string | undefined
                currentInView.forEach((entry, id) => {
                    if (entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio
                        bestSection = id
                    }
                })
                if (bestSection) {
                    if (setSelectedSection) {
                        setSelectedSection(bestSection)
                    } else {
                        setSection(bestSection)
                    }
                }
            },
            { threshold: 0.1, root } // Lower threshold to detect more sections
        )
        sectionElements.forEach((section) => {
            observer.observe(section)
        })

        return () => {
            observer.disconnect()
        }
    }, [sections, setSection, setSelectedSection, root])
}
