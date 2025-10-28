import React from 'react';
import { ActiveShape } from './types';
import { BarProps } from '../cartesian/Bar';
type BarRectangleProps = {
    option: ActiveShape<BarProps, SVGPathElement>;
    isActive: boolean;
} & BarProps;
export declare function BarRectangle(props: BarRectangleProps): React.JSX.Element;
export type MinPointSize = number | ((value: number | undefined | null, index: number) => number);
/**
 * Safely gets minPointSize from from the minPointSize prop if it is a function
 * @param minPointSize minPointSize as passed to the Bar component
 * @param defaultValue default minPointSize
 * @returns minPointSize
 */
export declare const minPointSizeCallback: (minPointSize: MinPointSize, defaultValue?: number) => (value: unknown, index: number) => number;
export {};
