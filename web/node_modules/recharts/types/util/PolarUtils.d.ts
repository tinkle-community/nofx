import { ReactElement, SVGProps } from 'react';
import { Coordinate, ChartOffset, GeometrySector } from './types';
export declare const RADIAN: number;
export declare const degreeToRadian: (angle: number) => number;
export declare const radianToDegree: (angleInRadian: number) => number;
export declare const polarToCartesian: (cx: number, cy: number, radius: number, angle: number) => Coordinate;
export declare const getMaxRadius: (width: number, height: number, offset?: ChartOffset) => number;
/**
 * Calculate the scale function, position, width, height of axes
 * @param  {Object} props     Latest props
 * @param  {Object} axisMap   The configuration of axes
 * @param  {Object} offset    The offset of main part in the svg element
 * @param  {Object} axisType  The type of axes, radius-axis or angle-axis
 * @param  {String} chartName The name of chart
 * @return {Object} Configuration
 */
export declare const formatAxisMap: (props: any, axisMap: any, offset: ChartOffset, axisType: 'angleAxis' | 'radiusAxis', chartName: string) => {};
export declare const distanceBetweenPoints: (point: Coordinate, anotherPoint: Coordinate) => number;
export declare const getAngleOfPoint: ({ x, y }: Coordinate, { cx, cy }: GeometrySector) => {
    radius: number;
    angle?: undefined;
    angleInRadian?: undefined;
} | {
    radius: number;
    angle: number;
    angleInRadian: number;
};
export declare const formatAngleOfSector: ({ startAngle, endAngle }: GeometrySector) => {
    startAngle: number;
    endAngle: number;
};
export declare const inRangeOfSector: ({ x, y }: Coordinate, sector: GeometrySector) => boolean | {
    radius: number;
    angle: number;
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    cornerRadius?: number;
    forceCornerRadius?: boolean;
    cornerIsExternal?: boolean;
};
export declare const getTickClassName: (tick?: boolean | SVGProps<SVGTextElement> | ReactElement<SVGElement, string | import("react").JSXElementConstructor<any>> | ((props: any) => ReactElement<SVGElement>)) => string;
