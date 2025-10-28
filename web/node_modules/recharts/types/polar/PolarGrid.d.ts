/**
 * @fileOverview Polar Grid
 */
import React, { SVGProps } from 'react';
interface PolarGridProps {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    polarAngles?: number[];
    polarRadius?: number[];
    gridType?: 'polygon' | 'circle';
    radialLines?: boolean;
}
export type Props = SVGProps<SVGPathElement> & PolarGridProps;
export declare const PolarGrid: {
    ({ cx, cy, innerRadius, outerRadius, gridType, radialLines, ...props }: Props): React.JSX.Element;
    displayName: string;
};
export {};
