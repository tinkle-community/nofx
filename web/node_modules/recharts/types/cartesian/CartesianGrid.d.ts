/**
 * @fileOverview Cartesian Grid
 */
import React, { ReactElement, SVGProps } from 'react';
import { ChartOffset, D3Scale } from '../util/types';
import { Props as XAxisProps } from './XAxis';
import { Props as YAxisProps } from './YAxis';
type XAxisWithD3Scale = Omit<XAxisProps, 'scale'> & {
    scale: D3Scale<string | number>;
};
type YAxisWithD3Scale = Omit<YAxisProps, 'scale'> & {
    scale: D3Scale<string | number>;
};
/**
 * The <CartesianGrid horizontal
 */
export type GridLineTypeFunctionProps = Omit<LineItemProps, 'key'> & {
    key: LineItemProps['key'] | undefined;
    offset: ChartOffset;
    /**
     * The first available xAxis. This is rather arbitrary - if there's one XAxis then it's the first one,
     * if there are multiple then it's a random one.
     *
     * If there are no XAxis present then this will be null.
     */
    xAxis: null | XAxisWithD3Scale;
    /**
     * The first available yAxis. The axes with finite domain will be preferred.
     *
     * If there are no YAxis present then this will be null.
     */
    yAxis: null | YAxisWithD3Scale;
};
type GridLineType = SVGProps<SVGLineElement> | ReactElement<SVGElement> | ((props: GridLineTypeFunctionProps) => ReactElement<SVGElement>) | boolean;
export type HorizontalCoordinatesGenerator = (props: {
    yAxis: any;
    width: number;
    height: number;
    offset: ChartOffset;
}, syncWithTicks: boolean) => number[];
export type VerticalCoordinatesGenerator = (props: {
    xAxis: any;
    width: number;
    height: number;
    offset: ChartOffset;
}, syncWithTicks: boolean) => number[];
interface InternalCartesianGridProps {
    width?: number;
    height?: number;
    horizontalCoordinatesGenerator?: HorizontalCoordinatesGenerator;
    verticalCoordinatesGenerator?: VerticalCoordinatesGenerator;
}
interface CartesianGridProps extends InternalCartesianGridProps {
    /**
     * The x-coordinate of grid.
     * If left undefined, it will be computed from the chart's offset and margins.
     */
    x?: number;
    /**
     * The y-coordinate of grid.
     * If left undefined, it will be computed from the chart's offset and margins.
     */
    y?: number;
    horizontal?: GridLineType;
    vertical?: GridLineType;
    /**
     * Array of coordinates in pixels where to draw horizontal grid lines.
     * Has priority over syncWithTicks and horizontalValues.
     */
    horizontalPoints?: number[];
    /**
     * Array of coordinates in pixels where to draw vertical grid lines.
     * Has priority over syncWithTicks and horizontalValues.
     */
    verticalPoints?: number[];
    /**
     * Defines background color of stripes.
     *
     * The values from this array will be passed in as the `fill` property in a `rect` SVG element.
     * For possible values see: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill#rect
     *
     * In case there are more stripes than colors, the colors will start from beginning
     * So for example: verticalFill['yellow', 'black'] produces a pattern of yellow|black|yellow|black
     *
     * If this is undefined, or an empty array, then there is no background fill.
     */
    verticalFill?: string[];
    /**
     * Defines background color of stripes.
     *
     * The values from this array will be passed in as the `fill` property in a `rect` SVG element.
     * For possible values see: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill#rect
     *
     * In case there are more stripes than colors, the colors will start from beginning
     * So for example: horizontalFill['yellow', 'black'] produces a pattern of yellow|black|yellow|black
     *
     * If this is undefined, or an empty array, then there is no background fill.
     */
    horizontalFill?: string[];
    /**
     * If true, only the lines that correspond to the axes ticks values will be drawn.
     * If false, extra lines could be added for each axis (at min and max coordinates), if there will not such ticks.
     * horizontalPoints, verticalPoints, horizontalValues, verticalValues have priority over syncWithTicks.
     */
    syncWithTicks?: boolean;
    /**
     * Array of values, where horizontal lines will be drawn. Numbers or strings, in dependence on axis type.
     * Has priority over syncWithTicks but not over horizontalValues.
     */
    horizontalValues?: number[] | string[];
    /**
     * Array of values, where vertical lines will be drawn. Numbers or strings, in dependence on axis type.
     * Has priority over syncWithTicks but not over verticalValues.
     */
    verticalValues?: number[] | string[];
}
type AcceptedSvgProps = Omit<SVGProps<SVGRectElement>, 'offset'>;
export type Props = AcceptedSvgProps & CartesianGridProps;
type LineItemProps = Props & {
    offset: ChartOffset;
    xAxis: null | XAxisWithD3Scale;
    yAxis: null | YAxisWithD3Scale;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    key: string;
    index: number;
};
export declare function CartesianGrid(props: Props): React.JSX.Element;
export declare namespace CartesianGrid {
    var displayName: string;
}
export {};
