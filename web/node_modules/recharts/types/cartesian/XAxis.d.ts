/**
 * @fileOverview X Axis
 */
import * as React from 'react';
import { BaseAxisProps, AxisInterval, PresentationAttributesAdaptChildEvent } from '../util/types';
/** Define of XAxis props */
interface XAxisProps extends BaseAxisProps {
    /** The unique id of x-axis */
    xAxisId?: string | number;
    /** The width of axis which is usually calculated internally */
    width?: number;
    /** The height of axis, which need to be set by the user */
    height?: number;
    mirror?: boolean;
    orientation?: 'top' | 'bottom';
    /**
     * Ticks can be any type when the axis is the type of category
     * Ticks must be numbers when the axis is the type of number
     */
    ticks?: (string | number)[];
    padding?: {
        left?: number;
        right?: number;
    } | 'gap' | 'no-gap';
    minTickGap?: number;
    interval?: AxisInterval;
    reversed?: boolean;
    /** the rotate angle of tick */
    angle?: number;
    tickMargin?: number;
}
export type Props = Omit<PresentationAttributesAdaptChildEvent<any, SVGElement>, 'scale' | 'ref'> & XAxisProps;
export declare class XAxis extends React.Component<Props> {
    static displayName: string;
    static defaultProps: {
        allowDecimals: boolean;
        hide: boolean;
        orientation: string;
        width: number;
        height: number;
        mirror: boolean;
        xAxisId: number;
        tickCount: number;
        type: string;
        padding: {
            left: number;
            right: number;
        };
        allowDataOverflow: boolean;
        scale: string;
        reversed: boolean;
        allowDuplicatedCategory: boolean;
    };
    render(): React.JSX.Element;
}
export {};
