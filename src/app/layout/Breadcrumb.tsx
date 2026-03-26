import React from 'react'
import { Link, To, useLocation, useMatches, matchPath } from 'react-router-dom'
import { useToWithSearchState } from '../../lib'
import type { MatchRouteHandle } from '../routes/types'
import css from './Breadcrumb.module.css'

const BreadcrumbSeparator = () => <span className={css.separator}>/</span>

type BreadcrumbItemProps = {
    label: string
    to: To
}

export const BreadcrumbItem = ({ label, to }: BreadcrumbItemProps) => {
    const resolvedTo = useToWithSearchState(to)
    const currentLoc = useLocation()

    if (resolvedTo.pathname) {
        const match = matchPath(resolvedTo.pathname, currentLoc.pathname)
        if (match?.pattern.end) {
            return <BreadCrumbEndItem label={label} />
        }
    }

    return (
        <Link
            className={css.breadcrumbItemLink}
            to={resolvedTo}
            state={{ search: resolvedTo.search }}
        >
            {label}
        </Link>
    )
}

/** Component that is used for "End links", where the current route is the end of the path
 * and thus should not be a link */
export const BreadCrumbEndItem = ({ label }: { label: string }) => (
    <span className={css.breadcrumbItem}>{label}</span>
)

export const Breadcrumbs = () => {
    const matches = useMatches() as MatchRouteHandle[]

    const filtered = matches.filter((match) => match.handle?.crumb)

    if (filtered.length === 0) {
        return null
    }

    const crumbs = filtered.map((match, index) => (
        <span key={match.id}>
            {match.handle?.crumb?.({
                params: match.params,
                pathname: match.pathname,
            })}
            {index < filtered.length - 1 && <BreadcrumbSeparator />}
        </span>
    ))

    return <div className={css.breadcrumbWrapper}>{crumbs}</div>
}
