/**
 * @fileOverview Axis of radial direction
 */
import React, { PureComponent } from 'react';
import { BaseAxisProps, TickItem, PresentationAttributesAdaptChildEvent } from '../util/types';
export interface PolarAngleAxisProps extends BaseAxisProps {
    angleAxisId?: string | number;
    cx?: number;
    cy?: number;
    radius?: number;
    axisLineType?: 'polygon' | 'circle';
    ticks?: TickItem[];
    orientation?: 'inner' | 'outer';
}
export type Props = PresentationAttributesAdaptChildEvent<any, SVGTextElement> & PolarAngleAxisProps;
export declare class PolarAngleAxis extends PureComponent<Props> {
    static displayName: string;
    static axisType: string;
    static defaultProps: {
        type: string;
        angleAxisId: number;
        scale: string;
        cx: number;
        cy: number;
        orientation: string;
        axisLine: boolean;
        tickLine: boolean;
        tickSize: number;
        tick: boolean;
        hide: boolean;
        allowDuplicatedCategory: boolean;
    };
    /**
     * Calculate the coordinate of line endpoint
     * @param  {Object} data The Data if ticks
     * @return {Object} (x0, y0): The start point of text,
     *                  (x1, y1): The end point close to text,
     *                  (x2, y2): The end point close to axis
     */
    getTickLineCoord(data: TickItem): {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    /**
     * Get the text-anchor of each tick
     * @param  {Object} data Data of ticks
     * @return {String} text-anchor
     */
    getTickTextAnchor(data: TickItem): string;
    renderAxisLine(): React.JSX.Element;
    static renderTickItem(option: PolarAngleAxisProps['tick'], props: any, value: string | number): React.JSX.Element;
    renderTicks(): React.JSX.Element;
    render(): React.JSX.Element;
}
