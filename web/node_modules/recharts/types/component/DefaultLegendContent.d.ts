/**
 * @fileOverview Default Legend Content
 */
import React, { PureComponent, ReactNode, MouseEvent, ReactElement } from 'react';
import { DataKey, LegendType, LayoutType, PresentationAttributesAdaptChildEvent } from '../util/types';
export type ContentType = ReactElement | ((props: Props) => ReactNode);
export type IconType = Exclude<LegendType, 'none'>;
export type HorizontalAlignmentType = 'center' | 'left' | 'right';
export type VerticalAlignmentType = 'top' | 'bottom' | 'middle';
export type Formatter = (value: any, entry: {
    value: any;
    id?: string;
    type?: LegendType;
    color?: string;
    payload?: {
        strokeDasharray: string | number;
        value?: any;
    };
    dataKey?: DataKey<any>;
}, index: number) => ReactNode;
export interface Payload {
    value: any;
    id?: string;
    type?: LegendType;
    color?: string;
    payload?: {
        strokeDasharray: string | number;
        value?: any;
    };
    formatter?: Formatter;
    inactive?: boolean;
    legendIcon?: ReactElement<SVGElement>;
    dataKey?: DataKey<any>;
}
interface InternalProps {
    content?: ContentType;
    iconSize?: number;
    iconType?: IconType;
    layout?: LayoutType;
    align?: HorizontalAlignmentType;
    verticalAlign?: VerticalAlignmentType;
    payload?: Array<Payload>;
    inactiveColor?: string;
    formatter?: Formatter;
    onMouseEnter?: (data: Payload, index: number, event: MouseEvent) => void;
    onMouseLeave?: (data: Payload, index: number, event: MouseEvent) => void;
    onClick?: (data: Payload, index: number, event: MouseEvent) => void;
}
export type Props = InternalProps & Omit<PresentationAttributesAdaptChildEvent<any, ReactElement>, keyof InternalProps>;
export declare class DefaultLegendContent extends PureComponent<Props> {
    static displayName: string;
    static defaultProps: {
        iconSize: number;
        layout: string;
        align: string;
        verticalAlign: string;
        inactiveColor: string;
    };
    /**
     * Render the path of icon
     * @param {Object} data Data of each legend item
     * @return {String} Path element
     */
    renderIcon(data: Payload): React.JSX.Element;
    /**
     * Draw items of legend
     * @return {ReactElement} Items
     */
    renderItems(): React.JSX.Element[];
    render(): React.JSX.Element;
}
export {};
