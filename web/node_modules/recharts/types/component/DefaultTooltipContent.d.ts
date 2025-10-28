/**
 * @fileOverview Default Tooltip Content
 */
import React, { CSSProperties, ReactNode, SVGProps } from 'react';
export type TooltipType = 'none';
export type ValueType = number | string | Array<number | string>;
export type NameType = number | string;
export type Formatter<TValue extends ValueType, TName extends NameType> = (value: TValue, name: TName, item: Payload<TValue, TName>, index: number, payload: Array<Payload<TValue, TName>>) => [React.ReactNode, TName] | React.ReactNode;
export interface Payload<TValue extends ValueType, TName extends NameType> extends Omit<SVGProps<SVGElement>, 'name'> {
    type?: TooltipType;
    color?: string;
    formatter?: Formatter<TValue, TName>;
    name?: TName;
    value?: TValue;
    unit?: ReactNode;
    dataKey?: string | number;
    payload?: any;
    chartType?: string;
    stroke?: string;
    strokeDasharray?: string | number;
    strokeWidth?: number | string;
    className?: string;
    hide?: boolean;
}
export interface Props<TValue extends ValueType, TName extends NameType> {
    separator?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    formatter?: Formatter<TValue, TName>;
    contentStyle?: CSSProperties;
    itemStyle?: CSSProperties;
    labelStyle?: CSSProperties;
    labelFormatter?: (label: any, payload: Array<Payload<TValue, TName>>) => ReactNode;
    label?: any;
    payload?: Array<Payload<TValue, TName>>;
    itemSorter?: (item: Payload<TValue, TName>) => number | string;
    accessibilityLayer?: boolean;
}
export declare const DefaultTooltipContent: <TValue extends ValueType, TName extends NameType>(props: Props<TValue, TName>) => React.JSX.Element;
