import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Field,
    Help,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    TransferOption,
} from '@dhis2/ui'
import React, { useState } from 'react'
import { useField, useForm } from 'react-final-form'
import { ModelTransferFrom } from '../../../components'
import { SECTIONS_MAP } from '../../../lib'
import { DisplayableModel } from '../../../types/models'
import { CategoryComboSelect } from './CategoryComboField'
import css from './DataSetElementModelTransfer.module.css'

type DataElementWithCategoryCombo = {
    id: string
    displayName: string
    categoryCombo: { id: string; displayName: string }
}

type DataSetElement = {
    categoryCombo?: { id: string; name: string; displayName: string }
    dataElement: DataElementWithCategoryCombo
}

export function DataSetElementsModelTransferField() {
    const name = 'dataSetElements'
    const [modalOpen, setModalOpen] = useState(false)

    const { input, meta } = useField<
        DataSetElement[],
        HTMLElement,
        (DisplayableModel & DataSetElement)[]
    >(name, {
        format: (value) =>
            value
                .map((dse) => ({
                    ...dse,
                    id: dse.dataElement.id,
                    displayName: dse.dataElement.displayName,
                }))
                .sort((a, b) => a.displayName.localeCompare(b.displayName)) ||
            [],
        multiple: true,
        validateFields: [],
    })

    return (
        <Field
            dataTest="formfields-modeltransfer"
            error={meta.invalid}
            validationText={(meta.touched && meta.error?.toString()) || ''}
            name={name}
            className={css.moduleTransferField}
        >
            <ModelTransferFrom<
                DataSetElement & DisplayableModel,
                DataElementWithCategoryCombo
            >
                transferSection={SECTIONS_MAP.dataElement}
                selected={input.value}
                onChange={({ selected }) => {
                    input.onChange(selected)
                    input.onBlur()
                }}
                enableOrderChange={false}
                maxSelections={Infinity}
                transform={(dataElements) => {
                    return dataElements.map((de) => ({
                        dataElement: {
                            ...de,
                        },
                        id: de.id,
                        displayName: de.displayName,
                        categoryCombo: undefined,
                    }))
                }}
                filterUnassignedTo={'dataSetElements'}
                query={{
                    resource: 'dataElements',
                    params: {
                        filter: 'domainType:eq:AGGREGATE',
                        fields: [
                            'id',
                            'displayName',
                            'categoryCombo[id,displayName]',
                        ],
                    },
                }}
                renderOption={({ value, ...rest }) => {
                    const resolveCatComboName = (name: string | undefined) =>
                        name === 'default' ? i18n.t('None') : name
                    const dataElementName = value.displayName
                    const overiddenCatComboName = resolveCatComboName(
                        value.categoryCombo?.displayName
                    )
                    const originalCatComboName = resolveCatComboName(
                        value.dataElement.categoryCombo.displayName
                    )
                    return (
                        <TransferOption
                            {...rest}
                            label={
                                <div>
                                    <div>{dataElementName}</div>
                                    <Help
                                        className={
                                            css.transferOptionCatComboText
                                        }
                                    >
                                        {overiddenCatComboName
                                            ? `${overiddenCatComboName} *`
                                            : originalCatComboName}
                                    </Help>
                                </div>
                            }
                            value={value.id}
                        />
                    )
                }}
                rightFooter={
                    <div className={css.modelTransferFooter}>
                        <Button
                            small
                            secondary
                            disabled={input.value.length === 0}
                            onClick={() => setModalOpen(true)}
                        >
                            {i18n.t('Custom disaggregation')}
                        </Button>
                    </div>
                }
            />
            {modalOpen && (
                <CustomDisaggregationModal
                    onClose={() => setModalOpen(false)}
                    selected={input.value}
                />
            )}
        </Field>
    )
}

type CustomDisaggregationModalProps = {
    onClose: () => void
    selected: DataSetElement[]
}
const CustomDisaggregationModal = ({
    onClose,
    selected,
}: CustomDisaggregationModalProps) => {
    const form = useForm()

    const handleChange = (dse: DataSetElement) => {
        const withNewDse = selected.map((s) =>
            s.dataElement.id === dse.dataElement.id ? dse : s
        )
        form.change('dataSetElements', withNewDse)
    }

    return (
        <Modal onClose={onClose} large>
            <ModalTitle>
                {i18n.t('Override data element category combination')}
            </ModalTitle>
            <ModalContent>
                <div className={css.modalContentWrapper}>
                    {selected.length === 0 && (
                        <div>{i18n.t('No data elements selected')}</div>
                    )}
                    {selected.map((dse) => (
                        <div
                            key={dse.dataElement.id}
                            className={css.fieldWrapper}
                        >
                            <div className={css.dataElementWrapper}>
                                <div>{dse.dataElement.displayName}</div>
                                {dse.dataElement.categoryCombo.displayName &&
                                    dse.dataElement.categoryCombo
                                        .displayName !== 'default' && (
                                        <Help>
                                            {
                                                dse.dataElement.categoryCombo
                                                    .displayName
                                            }
                                        </Help>
                                    )}
                            </div>
                            <div className={css.categoryComboSelect}>
                                <CategoryComboSelect
                                    query={{
                                        params: {
                                            filter: [
                                                'dataDimensionType:eq:DISAGGREGATION',
                                            ],
                                        },
                                    }}
                                    selected={dse.categoryCombo}
                                    onChange={(catCombo) => {
                                        handleChange({
                                            ...dse,
                                            categoryCombo: catCombo,
                                        })
                                    }}
                                    placeholder={i18n.t(
                                        'Override data element category combination'
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </ModalContent>
            <ModalActions>
                <Button primary onClick={onClose}>
                    {i18n.t('Close')}
                </Button>
            </ModalActions>
        </Modal>
    )
}
