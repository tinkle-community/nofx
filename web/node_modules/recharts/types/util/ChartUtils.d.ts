import { Series } from 'victory-vendor/d3-shape';
import { ReactElement, ReactNode } from 'react';
import { AxisType, BaseAxisProps, DataKey, LayoutType, LegendType, PolarLayoutType, NumberDomain, TickItem, CategoricalDomain, StackOffsetType, Margin, ChartOffset } from './types';
import { getLegendProps } from './getLegendProps';
export { getLegendProps };
export declare function getValueByDataKey<T>(obj: T, dataKey: DataKey<T>, defaultValue?: any): any;
/**
 * Get domain of data by key.
 * @param  {Array}   data      The data displayed in the chart
 * @param  {String}  key       The unique key of a group of data
 * @param  {String}  type      The type of axis
 * @param  {Boolean} filterNil Whether or not filter nil values
 * @return {Array} Domain of data
 */
export declare function getDomainOfDataByKey<T>(data: Array<T>, key: DataKey<T>, type: BaseAxisProps['type'], filterNil?: boolean): NumberDomain | CategoricalDomain;
export declare const calculateActiveTickIndex: (coordinate: number, ticks?: Array<TickItem>, unsortedTicks?: Array<TickItem>, axis?: BaseAxisProps) => number;
/**
 * Get the main color of each graphic item
 * @param  {ReactElement} item A graphic item
 * @return {String}            Color
 */
export declare const getMainColorOfGraphicItem: (item: ReactElement) => any;
export interface FormattedGraphicalItem {
    props: {
        sectors?: ReadonlyArray<any>;
        data?: ReadonlyArray<any>;
    };
    childIndex: number;
    item: ReactElement<{
        legendType?: LegendType;
        hide: boolean;
        name?: string;
        dataKey: DataKey<any>;
    }>;
}
export type BarSetup = {
    barSize: number | string;
    stackList: ReadonlyArray<ReactElement>;
    item: ReactElement;
};
/**
 * Calculate the size of all groups for stacked bar graph
 * @param  {Object} stackGroups The items grouped by axisId and stackId
 * @return {Object} The size of all groups
 */
export declare const getBarSizeList: ({ barSize: globalSize, totalSize, stackGroups, }: {
    barSize: number | string;
    stackGroups: AxisStackGroups;
    totalSize: number;
}) => Record<string, ReadonlyArray<BarSetup>>;
export type BarPosition = {
    item: ReactElement;
    position: {
        /**
         * Offset is returned always from zero position.
         * So in a way it's "absolute".
         *
         * NOT inbetween bars, but always from zero.
         */
        offset: number;
        /**
         * Size of the bar.
         * This will be usually a number.
         * But if the input data is not well formed, undefined or NaN will be on the output too.
         */
        size: number | undefined | typeof NaN;
    };
};
/**
 * Calculate the size of each bar and offset between start of band and the bar
 *
 * @param  {number} bandSize is the size of area where bars can render
 * @param  {number | string} barGap is the gap size, as a percentage of `bandSize`.
 *                                  Can be defined as number or percent string
 * @param  {number | string} barCategoryGap is the gap size, as a percentage of `bandSize`.
 *                                  Can be defined as number or percent string
 * @param  {Array<object>} sizeList Sizes of all groups
 * @param  {number} maxBarSize The maximum size of each bar
 * @return {Array<object>} The size and offset of each bar
 */
export declare const getBarPosition: ({ barGap, barCategoryGap, bandSize, sizeList, maxBarSize, }: {
    barGap: string | number;
    barCategoryGap: string | number;
    bandSize: number;
    sizeList: ReadonlyArray<BarSetup>;
    maxBarSize: number;
}) => ReadonlyArray<BarPosition>;
export declare const appendOffsetOfLegend: (offset: ChartOffset, _unused: unknown, props: {
    width?: number;
    margin: Margin;
    children?: ReactNode[];
}, legendBox: DOMRect | null) => ChartOffset;
export declare const getDomainOfErrorBars: (data: Array<object>, item: ReactElement, dataKey: DataKey<any>, layout?: LayoutType, axisType?: AxisType) => NumberDomain | null;
export declare const parseErrorBarsOfAxis: (data: any[], items: any[], dataKey: any, axisType: AxisType, layout?: LayoutType) => NumberDomain | null;
/**
 * Get domain of data by the configuration of item element
 * @param  {Array}   data      The data displayed in the chart
 * @param  {Array}   items     The instances of item
 * @param  {String}  type      The type of axis, number - Number Axis, category - Category Axis
 * @param  {LayoutType} layout The type of layout
 * @param  {Boolean} filterNil Whether or not filter nil values
 * @return {Array}        Domain
 */
export declare const getDomainOfItemsWithSameAxis: (data: any[], items: ReactElement[], type: BaseAxisProps['type'], layout?: LayoutType, filterNil?: boolean) => NumberDomain | CategoricalDomain;
export declare const isCategoricalAxis: (layout: LayoutType | PolarLayoutType, axisType: AxisType) => boolean;
/**
 * Calculate the Coordinates of grid
 * @param  {Array} ticks           The ticks in axis
 * @param {Number} minValue        The minimun value of axis
 * @param {Number} maxValue        The maximun value of axis
 * @param {boolean} syncWithTicks  Synchronize grid lines with ticks or not
 * @return {Array}                 Coordinates
 */
export declare const getCoordinatesOfGrid: (ticks: Array<TickItem>, minValue: number, maxValue: number, syncWithTicks: Boolean) => number[];
/**
 * Get the ticks of an axis
 * @param  {Object}  axis The configuration of an axis
 * @param {Boolean} isGrid Whether or not are the ticks in grid
 * @param {Boolean} isAll Return the ticks of all the points or not
 * @return {Array}  Ticks
 */
export declare const getTicksOfAxis: (axis: BaseAxisProps & {
    duplicateDomain?: any;
    realScaleType?: 'scaleBand' | 'band' | 'point' | 'linear';
    scale?: any;
    axisType?: AxisType;
    ticks?: any;
    niceTicks?: any;
    isCategorical?: boolean;
    categoricalDomain?: any;
}, isGrid?: boolean, isAll?: boolean) => TickItem[] | null;
export declare const combineEventHandlers: (defaultHandler: Function, childHandler: Function | undefined) => Function;
/**
 * Parse the scale function of axis
 * @param  {Object}   axis          The option of axis
 * @param  {String}   chartType     The displayName of chart
 * @param  {Boolean}  hasBar        if it has a bar
 * @return {object}               The scale function and resolved name
 */
export declare const parseScale: (axis: {
    scale: 'auto' | string | Function;
    type?: BaseAxisProps['type'];
    layout?: 'radial' | unknown;
    axisType?: 'radiusAxis' | 'angleAxis' | unknown;
}, chartType?: string, hasBar?: boolean) => {
    scale: any;
    realScaleType?: string;
};
export declare const checkDomainOfScale: (scale: any) => void;
export declare const findPositionOfBar: (barPosition: any[], child: ReactNode) => any;
/**
 * Both value and domain are tuples of two numbers
 * - but the type stays as array of numbers until we have better support in rest of the app
 * @param {Array} value input that will be truncated
 * @param {Array} domain boundaries
 * @returns {Array} tuple of two numbers
 */
export declare const truncateByDomain: (value: [number, number], domain: number[]) => number[];
/**
 * Stacks all positive numbers above zero and all negative numbers below zero.
 *
 * If all values in the series are positive then this behaves the same as 'none' stacker.
 *
 * @param {Array} series from d3-shape Stack
 * @return {Array} series with applied offset
 */
export declare const offsetSign: OffsetAccessor;
/**
 * Replaces all negative values with zero when stacking data.
 *
 * If all values in the series are positive then this behaves the same as 'none' stacker.
 *
 * @param {Array} series from d3-shape Stack
 * @return {Array} series with applied offset
 */
export declare const offsetPositive: OffsetAccessor;
/**
 * Function type to compute offset for stacked data.
 *
 * d3-shape has something fishy going on with its types.
 * In @definitelytyped/d3-shape, this function (the offset accessor) is typed as Series<> => void.
 * However! When I actually open the storybook I can see that the offset accessor actually receives Array<Series<>>.
 * The same I can see in the source code itself:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/66042
 * That one unfortunately has no types but we can tell it passes three-dimensional array.
 *
 * Which leads me to believe that definitelytyped is wrong on this one.
 * There's open discussion on this topic without much attention:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/66042
 */
type OffsetAccessor = (series: Array<Series<Record<string, unknown>, string>>, order: number[]) => void;
export declare const getStackedData: (data: ReadonlyArray<Record<string, unknown>>, stackItems: ReadonlyArray<{
    props: {
        dataKey?: DataKey<any>;
    };
}>, offsetType: StackOffsetType) => ReadonlyArray<Series<Record<string, unknown>, string>>;
type AxisId = string;
export type StackId = string | number | symbol;
export type ParentStackGroup = {
    hasStack: boolean;
    stackGroups: Record<StackId, ChildStackGroup>;
};
export type GenericChildStackGroup<T> = {
    numericAxisId: string;
    cateAxisId: string;
    items: Array<ReactElement>;
    stackedData?: ReadonlyArray<T>;
};
export type ChildStackGroup = GenericChildStackGroup<Series<Record<string, unknown>, string>>;
export type AxisStackGroups = Record<AxisId, ParentStackGroup>;
export declare const getStackGroupsByAxisId: (data: ReadonlyArray<Record<string, unknown>> | undefined, _items: Array<ReactElement>, numericAxisId: string, cateAxisId: string, offsetType: StackOffsetType, reverseStackOrder: boolean) => AxisStackGroups;
/**
 * Configure the scale function of axis
 * @param {Object} scale The scale function
 * @param {Object} opts  The configuration of axis
 * @return {Object}      null
 */
export declare const getTicksOfScale: (scale: any, opts: any) => {
    niceTicks: any;
};
export declare function getCateCoordinateOfLine<T extends Record<string, unknown>>({ axis, ticks, bandSize, entry, index, dataKey, }: {
    axis: {
        dataKey?: DataKey<T>;
        allowDuplicatedCategory?: boolean;
        type?: BaseAxisProps['type'];
        scale: (v: number) => number;
    };
    ticks: Array<TickItem>;
    bandSize: number;
    entry: T;
    index: number;
    dataKey?: DataKey<T>;
}): number | null;
export declare const getCateCoordinateOfBar: ({ axis, ticks, offset, bandSize, entry, index, }: {
    axis: any;
    ticks: Array<TickItem>;
    offset: any;
    bandSize: number;
    entry: any;
    index: number;
}) => any;
export declare const getBaseValueOfBar: ({ numericAxis, }: {
    numericAxis: any;
}) => any;
export declare const getStackedDataOfItem: <StackedData>(item: ReactElement, stackGroups: Record<StackId, GenericChildStackGroup<StackedData>>) => StackedData;
export declare const getDomainOfStackGroups: (stackGroups: Record<StackId, ChildStackGroup>, startIndex: number, endIndex: number) => number[];
export declare const MIN_VALUE_REG: RegExp;
export declare const MAX_VALUE_REG: RegExp;
export declare const parseSpecifiedDomain: (specifiedDomain: any, dataDomain: any, allowDataOverflow?: boolean) => any;
/**
 * Calculate the size between two category
 * @param  {Object} axis  The options of axis
 * @param  {Array}  ticks The ticks of axis
 * @param  {Boolean} isBar if items in axis are bars
 * @return {Number} Size
 */
export declare const getBandSizeOfAxis: (axis?: BaseAxisProps, ticks?: Array<TickItem>, isBar?: boolean) => number | undefined;
/**
 * parse the domain of a category axis when a domain is specified
 * @param   {Array}        specifiedDomain  The domain specified by users
 * @param   {Array}        calculatedDomain The domain calculated by dateKey
 * @param   {ReactElement} axisChild        The axis ReactElement
 * @returns {Array}        domains
 */
export declare const parseDomainOfCategoryAxis: <T>(specifiedDomain: readonly T[], calculatedDomain: readonly T[], axisChild: ReactElement) => readonly T[];
export declare const getTooltipItem: (graphicalItem: ReactElement, payload: any) => {
    dataKey: any;
    unit: any;
    formatter: any;
    name: any;
    color: any;
    value: any;
    type: any;
    payload: any;
    chartType: any;
    hide: any;
};
