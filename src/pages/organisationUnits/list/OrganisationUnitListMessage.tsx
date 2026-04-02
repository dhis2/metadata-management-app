import i18n from '@dhis2/d2-i18n'
import { Center } from '@dhis2/ui'
import { UseQueryResult } from '@tanstack/react-query'
import React from 'react'
import { SectionListLoader } from '../../../components/sectionList/SectionListLoader'
import {
    SectionListEmpty,
    SectionListError,
    SectionListMessage,
} from '../../../components/sectionList/SectionListMessages'

type OrganisationUnitListMessageProps = {
    orgUnitCount: number
    isFiltering: boolean
    queries: UseQueryResult[]
}

export const OrganisationUnitListMessage = ({
    orgUnitCount,
    isFiltering,
    queries,
}: OrganisationUnitListMessageProps) => {
    const firstError = queries.find((query) => query.error)

    if (firstError) {
        console.error(firstError.error)
        return <SectionListError />
    }

    // Show loading indicator when there is nothing to display yet and we're fetching.
    // This prevents briefly showing "no matches" while a new filter/search is loading.
    const showLoading =
        orgUnitCount < 1 &&
        queries.some((query) => query.isLoading || query.isFetching)

    if (showLoading) {
        return <SectionListLoader />
    }

    if (isFiltering && orgUnitCount < 1) {
        return <SectionListEmpty />
    }
    // if for some reason we don't have any data, are not loading and are not filtering
    // it could mean that the user doesn't have access to any org units
    if (orgUnitCount < 1) {
        return (
            <SectionListMessage>
                <Center>{i18n.t('No organisation units available')}</Center>
            </SectionListMessage>
        )
    }

    return null
}
