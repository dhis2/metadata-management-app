import i18n from '@dhis2/d2-i18n'
import { IconInfo16, NoticeBox, Tab, TabBar } from '@dhis2/ui'
import React from 'react'
import { TooltipWrapper } from '../tooltip'
import classes from './TabbedFormTypePicker.module.css'

const disabledFormTypeText = i18n.t(
    'You need to save before this form type can be configured.'
)

export enum FormType {
    DEFAULT = 'DEFAULT',
    CUSTOM = 'CUSTOM',
    SECTION = 'SECTION',
}

export const TabbedFormTypePicker = React.memo(function FormFormContents({
    selectedFormType,
    onFormTypeChange,
    sectionsLength,
    hasDataEntryForm,
    hasDataToDisplay,
    modelId,
    isClone = false,
    children,
}: {
    selectedFormType: FormType
    onFormTypeChange: (formType: FormType) => void
    sectionsLength: number
    hasDataEntryForm: boolean
    hasDataToDisplay: boolean
    modelId?: string
    isClone?: boolean
    children: React.ReactNode
}) {
    const isCreatingNew = !modelId
    const androidFormType =
        sectionsLength > 0 ? i18n.t('Section form') : i18n.t('Basic form')

    const basicFormHelpText = i18n.t('Show data items in a simple list.')

    const webFormType = hasDataEntryForm
        ? i18n.t('Custom form')
        : androidFormType

    return (
        <>
            {!isCreatingNew && hasDataToDisplay && (
                <NoticeBox
                    title={i18n.t('Form type based on current setup')}
                    className={classes.formTypeInfo}
                >
                    <div>
                        {i18n.t('Web: {{webFormType}}', {
                            webFormType,
                            nsSeparator: '~:~',
                        })}
                    </div>
                    <div>
                        {i18n.t('Android: {{androidFormType}}', {
                            androidFormType,
                            nsSeparator: '~:~',
                        })}
                    </div>
                </NoticeBox>
            )}
            <div
                className={classes.formTypeTabsContainer}
                onClick={(e) => {
                    e.preventDefault()
                }}
            >
                <TabBar fixed>
                    <Tab
                        onClick={(_, event) => {
                            event.preventDefault()
                            onFormTypeChange(FormType.DEFAULT)
                        }}
                        selected={selectedFormType === FormType.DEFAULT}
                        disabled={isClone}
                    >
                        <div className={classes.formTypeTab}>
                            {i18n.t('Basic form')}
                            <TooltipWrapper
                                condition
                                className={classes.infoTooltipWrapper}
                                content={i18n.t(
                                    `${basicFormHelpText} \n` +
                                        'Used if no Section or Custom form is available.'
                                )}
                            >
                                <IconInfo16 />
                            </TooltipWrapper>
                        </div>
                    </Tab>
                    <Tab
                        onClick={(_, event) => {
                            event.preventDefault()
                            onFormTypeChange(FormType.SECTION)
                        }}
                        disabled={isCreatingNew || isClone}
                        selected={selectedFormType === FormType.SECTION}
                    >
                        <TooltipWrapper
                            condition={isCreatingNew}
                            content={disabledFormTypeText}
                        >
                            <div className={classes.formTypeTab}>
                                {i18n.t('Section form')}
                                <TooltipWrapper
                                    condition={!isCreatingNew}
                                    className={classes.infoTooltipWrapper}
                                    content={i18n.t(
                                        'Organise data items into sections for easier entry. Section forms are used when no custom form is available.'
                                    )}
                                >
                                    <IconInfo16 />
                                </TooltipWrapper>
                            </div>
                        </TooltipWrapper>
                    </Tab>

                    <Tab
                        onClick={(_, event) => {
                            event.preventDefault()
                            onFormTypeChange(FormType.CUSTOM)
                        }}
                        disabled={isCreatingNew || isClone}
                        selected={selectedFormType === FormType.CUSTOM}
                    >
                        <TooltipWrapper
                            condition={isCreatingNew}
                            content={disabledFormTypeText}
                        >
                            <div
                                className={classes.formTypeTab}
                                onClick={(e) => {
                                    e.preventDefault()
                                }}
                            >
                                {i18n.t('Custom form')}
                                <TooltipWrapper
                                    condition={!isCreatingNew}
                                    className={classes.infoTooltipWrapper}
                                    content={i18n.t(
                                        'Design a custom layout for data entry. On web, custom forms are used when available. On Android, section forms are used instead, or the basic form if no section form exists.'
                                    )}
                                >
                                    <IconInfo16 />
                                </TooltipWrapper>
                            </div>
                        </TooltipWrapper>
                    </Tab>
                </TabBar>
            </div>
            <div className={classes.formTypeTabsContent}>{children}</div>
        </>
    )
})
