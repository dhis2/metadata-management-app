import { Transfer, TransferOptionProps, TransferProps } from '@dhis2/ui'
import React, { useCallback, useMemo } from 'react'
import { DisplayableModel } from '../../../types/models'

const toDisplayOption = (model: DisplayableModel) => ({
    value: model.id,
    label: model.displayName,
    disabled: model.disabled,
})

type RenderOptionWithFullValue<TModel> = (
    props: Omit<TransferOptionProps, 'value'> & { value: TModel }
) => JSX.Element

type OwnProps<TModel> = {
    selected: TModel[]
    available: TModel[]
    onChange: ({ selected }: { selected: TModel[] }) => void
    renderOption?: RenderOptionWithFullValue<TModel>
}

export type BaseModelTransferProps<TModel> = Omit<
    TransferProps,
    keyof OwnProps<TModel> | 'options'
> &
    OwnProps<TModel>

/* Simple wrapper component handle generic models with Transfer-component. */
export const BaseModelTransfer = <TModel extends DisplayableModel>({
    available,
    selected,
    onChange,
    renderOption,
    maxSelections,
    ...transferProps
}: BaseModelTransferProps<TModel>) => {
    const { allModelsMap, allTransferOptions } = useMemo(() => {
        const allModels = available.concat(selected)
        const allModelsMap = new Map(allModels.map((o) => [o.id, o]))
        const allTransferOptions = Array.from(allModelsMap).map(([_i, v]) =>
            toDisplayOption(v)
        )
        return {
            allModelsMap,
            allTransferOptions,
        }
    }, [available, selected])

    const selectedTransferValues = useMemo(
        () => selected?.map((s) => s.id),
        [selected]
    )

    const handleOnChange = useCallback(
        ({ selected }: { selected: string[] }) => {
            // map the selected ids to the full model
            // loop through selected to keep order
            const selectedModels = selected
                .map((id) => allModelsMap.get(id))
                .filter((model) => !!model)

            onChange({
                selected: selectedModels,
            })
        },
        [onChange, allModelsMap]
    )

    const renderOptionWithFullValue = useMemo(() => {
        if (!renderOption) {
            return undefined
        }
        return (props: TransferOptionProps) => {
            const value = allModelsMap.get(props.value) as TModel
            return renderOption({ ...props, value })
        }
    }, [renderOption, allModelsMap])

    return (
        <Transfer
            {...transferProps}
            maxSelections={maxSelections || 5000}
            renderOption={renderOptionWithFullValue}
            selected={selectedTransferValues}
            options={allTransferOptions}
            onChange={handleOnChange}
        />
    )
}
