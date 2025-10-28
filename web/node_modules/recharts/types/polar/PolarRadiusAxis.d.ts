/**
 * @fileOverview The axis of polar coordinate system
 */
import React, { PureComponent } from 'react';
import { BaseAxisProps, TickItem, PresentationAttributesAdaptChildEvent } from '../util/types';
export interface PolarRadiusAxisProps extends Omit<BaseAxisProps, 'unit'> {
    cx?: number;
    cy?: number;
    radiusAxisId?: string | number;
    angle?: number;
    orientation?: 'left' | 'right' | 'middle';
    ticks?: TickItem[];
    reversed?: boolean;
}
export type Props = PresentationAttributesAdaptChildEvent<any, SVGElement> & PolarRadiusAxisProps;
export declare class PolarRadiusAxis extends PureComponent<Props> {
    static displayName: string;
    static axisType: string;
    static defaultProps: {
        type: string;
        radiusAxisId: number;
        cx: number;
        cy: number;
        angle: number;
        orientation: string;
        stroke: string;
        axisLine: boolean;
        tick: boolean;
        tickCount: number;
        allowDataOverflow: boolean;
        scale: string;
        allowDuplicatedCategory: boolean;
    };
    /**
     * Calculate the coordinate of tick
     * @param  {Number} coordinate The radius of tick
     * @return {Object} (x, y)
     */
    getTickValueCoord({ coordinate }: TickItem): import("../util/types").Coordinate;
    getTickTextAnchor(): string;
    getViewBox(): {
        cx: number;
        cy: number;
        startAngle: number;
        endAngle: number;
        innerRadius: number;
        outerRadius: number;
    };
    renderAxisLine(): React.JSX.Element;
    static renderTickItem(option: Props['tick'], props: any, value: string | number): React.JSX.Element;
    renderTicks(): React.JSX.Element;
    render(): React.JSX.Element;
}
