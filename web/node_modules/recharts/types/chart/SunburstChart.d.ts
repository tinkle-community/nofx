import React from 'react';
export interface SunburstData {
    [key: string]: any;
    name: string;
    value?: number;
    fill?: string;
    children?: SunburstData[];
}
interface TextOptions {
    fontFamily?: string;
    fontWeight?: string;
    paintOrder?: string;
    stroke?: string;
    fill?: string;
    fontSize?: string;
    pointerEvents?: string;
}
export interface SunburstChartProps {
    className?: string;
    data?: SunburstData;
    width?: number;
    height?: number;
    padding?: number;
    dataKey?: string;
    ringPadding?: number;
    innerRadius?: number;
    outerRadius?: number;
    /** The abscissa of pole in polar coordinate  */
    cx?: number;
    /** The ordinate of pole in polar coordinate  */
    cy?: number;
    /** Angle in degrees from which the chart should start.  */
    startAngle?: number;
    /** Angle, in degrees, at which the chart should end. Can be used to generate partial sunbursts.  */
    endAngle?: number;
    children?: React.ReactNode;
    fill?: string;
    stroke?: string;
    textOptions?: TextOptions;
    onMouseEnter?: (node: SunburstData, e: React.MouseEvent) => void;
    onMouseLeave?: (node: SunburstData, e: React.MouseEvent) => void;
    onClick?: (node: SunburstData) => void;
}
export declare const SunburstChart: ({ className, data, children, width, height, padding, dataKey, ringPadding, innerRadius, fill, stroke, textOptions, outerRadius, cx, cy, startAngle, endAngle, onClick, onMouseEnter, onMouseLeave, }: SunburstChartProps) => React.JSX.Element;
export {};
