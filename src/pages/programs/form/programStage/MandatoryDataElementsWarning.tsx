import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import React from 'react'
import styles from './MandatoryDataElementsWarning.module.css'

type MissingDataElement = {
    dataElement: { id: string; displayName: string }
}

type Props = {
    missingDataElements: MissingDataElement[]
    className?: string
}

export const MandatoryDataElementsWarning = ({
    missingDataElements,
    className,
}: Props) => {
    if (missingDataElements.length === 0) {
        return null
    }
    return (
        <NoticeBox
            warning
            className={className ?? styles.noticeBox}
            title={i18n.t(
                'Mandatory data elements are not included in this form.'
            )}
        >
            <div className={styles.description}>
                {i18n.t(
                    'The following data elements are marked as required but not assigned to any section:',
                    { nsSeparator: '~:~' }
                )}
            </div>
            <ul className={styles.list}>
                {missingDataElements.map(({ dataElement }) => (
                    <li key={dataElement.id}>{dataElement.displayName}</li>
                ))}
            </ul>
        </NoticeBox>
    )
}
