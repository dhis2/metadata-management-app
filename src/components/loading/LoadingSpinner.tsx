import { CircularLoader } from '@dhis2/ui'
import React from 'react'
import styles from './Loader.module.css'

export const LoadingSpinner = ({
    centered = true,
    ...rest
}: {
    centered?: boolean
}) => {
    const loader = (
        <CircularLoader {...rest} className={styles.loadingSpinner} />
    )

    return centered ? (
        <div className={styles.centeredContainer}>{loader}</div>
    ) : (
        loader
    )
}
