import React, { useEffect } from 'react'
import { useForm } from 'react-final-form'
import { getSectionPath } from '../../lib'
import { ModelSection } from '../../types'
import { StandardFormSection } from '../standardForm'
import classes from './DefaultFormContents.module.css'
import { DefaultFormErrorNotice } from './DefaultFormErrorNotice'
import { DefaultFormFooter } from './DefaultFormFooter'
import { TranslatedFieldsNoticeBox } from './TranslatedFieldsNoticeBox'

type DefaultFormContentsProps = {
    readonly children: React.ReactNode
    readonly section: ModelSection
}

function DefaultFormContents({
    children,
    section,
    showTranslatedFieldsNotice = false,
    description = undefined,
}: DefaultFormContentsProps & {
    readonly showTranslatedFieldsNotice?: boolean
    description?: string
}) {
    const listPath = `/${getSectionPath(section)}`

    return (
        <>
            <div className={classes.form}>
                {showTranslatedFieldsNotice && <TranslatedFieldsNoticeBox />}
                {description && <h2>{description}</h2>}
                {children}
                <StandardFormSection>
                    <DefaultFormErrorNotice />
                </StandardFormSection>
            </div>
            <DefaultFormFooter cancelTo={listPath} />
        </>
    )
}

export function DefaultEditFormContents(
    props: Readonly<DefaultFormContentsProps>
) {
    return <DefaultFormContents {...props} showTranslatedFieldsNotice={true} />
}

export function DefaultNewFormContents(
    props: Readonly<DefaultFormContentsProps>
) {
    return <DefaultFormContents {...props} showTranslatedFieldsNotice={false} />
}

export function DefaultCloneFormContents(
    props: Readonly<DefaultFormContentsProps> & {
        modelId: string
        name?: string
    }
) {
    const form = useForm()
    useEffect(() => {
        form.getRegisteredFields().forEach((field) => {
            form.focus(field)
            form.blur(field)
        })
    }, [form])

    return (
        <div>
            <DefaultFormContents
                {...props}
                showTranslatedFieldsNotice={false}
                description={`Cloning ${props.name} (id: ${props.modelId})`}
            />
        </div>
    )
}
