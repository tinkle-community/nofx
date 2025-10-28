/**
 * @fileOverview Y Axis
 */
import * as React from 'react';
import { BaseAxisProps, AxisInterval, PresentationAttributesAdaptChildEvent } from '../util/types';
interface YAxisProps extends BaseAxisProps {
    /** The unique id of y-axis */
    yAxisId?: string | number;
    /**
     * Ticks can be any type when the axis is the type of category
     * Ticks must be numbers when the axis is the type of number
     */
    ticks?: (string | number)[];
    /** The width of axis, which need to be set by the user */
    width?: number;
    /** The height of axis which is usually calculated in Chart */
    height?: number;
    mirror?: boolean;
    /** The orientation of axis */
    orientation?: 'left' | 'right';
    padding?: {
        top?: number;
        bottom?: number;
    };
    minTickGap?: number;
    interval?: AxisInterval;
    reversed?: boolean;
    tickMargin?: number;
}
export type Props = Omit<PresentationAttributesAdaptChildEvent<any, SVGElement>, 'scale' | 'ref'> & YAxisProps;
export declare class YAxis extends React.Component<Props> {
    static displayName: string;
    static defaultProps: {
        allowDuplicatedCategory: boolean;
        allowDecimals: boolean;
        hide: boolean;
        orientation: string;
        width: number;
        height: number;
        mirror: boolean;
        yAxisId: number;
        tickCount: number;
        type: string;
        padding: {
            top: number;
            bottom: number;
        };
        allowDataOverflow: boolean;
        scale: string;
        reversed: boolean;
    };
    render(): React.JSX.Element;
}
export {};
