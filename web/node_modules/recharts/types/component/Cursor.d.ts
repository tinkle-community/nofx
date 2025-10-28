import React, { ReactElement } from 'react';
import { ChartCoordinate, ChartOffset, LayoutType, TooltipEventType } from '../util/types';
export type CursorProps = {
    activeCoordinate: ChartCoordinate;
    activePayload: any[];
    activeTooltipIndex: number;
    chartName: string;
    element: ReactElement;
    isActive: boolean;
    layout: LayoutType;
    offset: ChartOffset;
    tooltipAxisBandSize: number;
    tooltipEventType: TooltipEventType;
};
export declare function Cursor(props: CursorProps): React.ReactElement<unknown, string | React.JSXElementConstructor<any>>;
