import React, { ReactElement } from 'react';
import type { DebouncedFunc } from 'lodash';
import { AxisStackGroups } from '../util/ChartUtils';
import { AxisType, CategoricalChartOptions, ChartCoordinate, DataKey, LayoutType, Margin, StackOffsetType, TooltipEventType } from '../util/types';
import { AccessibilityManager } from './AccessibilityManager';
import { AxisMap, CategoricalChartState } from './types';
export interface MousePointer {
    pageX: number;
    pageY: number;
}
export type GraphicalItem<Props = Record<string, any>> = ReactElement<Props, string | React.JSXElementConstructor<Props>> & {
    item: ReactElement<Props, string | React.JSXElementConstructor<Props>>;
};
/**
 * This function exists as a temporary workaround.
 *
 * Why? generateCategoricalChart does not render `{children}` directly;
 * instead it passes them through `renderByOrder` function which reads their handlers.
 *
 * So, this is a handler that does nothing.
 * Once we get rid of `renderByOrder` and switch to JSX only, we can get rid of this handler too.
 *
 * @param {JSX} element as is in JSX
 * @returns {JSX} the same element
 */
declare function renderAsIs(element: React.ReactElement): React.ReactElement;
/**
 * Get the configuration of axis by the options of axis instance
 * @param  {Object} props         Latest props
 * @param {Array}  axes           The instance of axes
 * @param  {Array} graphicalItems The instances of item
 * @param  {String} axisType      The type of axis, xAxis - x-axis, yAxis - y-axis
 * @param  {String} axisIdKey     The unique id of an axis
 * @param  {Object} stackGroups   The items grouped by axisId and stackId
 * @param {Number} dataStartIndex The start index of the data series when a brush is applied
 * @param {Number} dataEndIndex   The end index of the data series when a brush is applied
 * @return {Object}      Configuration
 */
export declare const getAxisMapByAxes: (props: CategoricalChartProps, { axes, graphicalItems, axisType, axisIdKey, stackGroups, dataStartIndex, dataEndIndex, }: {
    axes: ReadonlyArray<ReactElement>;
    graphicalItems: ReadonlyArray<ReactElement>;
    axisType: AxisType;
    axisIdKey: string;
    stackGroups: AxisStackGroups;
    dataStartIndex: number;
    dataEndIndex: number;
}) => AxisMap;
/**
 * Returns default, reset state for the categorical chart.
 * @param {Object} props Props object to use when creating the default state
 * @return {Object} Whole new state
 */
export declare const createDefaultState: (props: CategoricalChartProps) => CategoricalChartState;
export type CategoricalChartFunc = (nextState: CategoricalChartState, event: any) => void;
export interface CategoricalChartProps {
    syncId?: number | string;
    syncMethod?: 'index' | 'value' | Function;
    compact?: boolean;
    width?: number;
    height?: number;
    dataKey?: DataKey<any>;
    data?: any[];
    layout?: LayoutType;
    stackOffset?: StackOffsetType;
    throttleDelay?: number;
    margin?: Margin;
    barCategoryGap?: number | string;
    barGap?: number | string;
    barSize?: number | string;
    maxBarSize?: number;
    style?: any;
    className?: string;
    children?: any;
    defaultShowTooltip?: boolean;
    onClick?: CategoricalChartFunc;
    onMouseLeave?: CategoricalChartFunc;
    onMouseEnter?: CategoricalChartFunc;
    onMouseMove?: CategoricalChartFunc;
    onMouseDown?: CategoricalChartFunc;
    onMouseUp?: CategoricalChartFunc;
    onContextMenu?: CategoricalChartFunc;
    onDoubleClick?: CategoricalChartFunc;
    reverseStackOrder?: boolean;
    id?: string;
    startAngle?: number;
    endAngle?: number;
    cx?: number | string;
    cy?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
    title?: string;
    desc?: string;
    accessibilityLayer?: boolean;
    role?: string;
    tabIndex?: number;
}
export declare const generateCategoricalChart: ({ chartName, GraphicalChild, defaultTooltipEventType, validateTooltipEventTypes, axisComponents, legendContent, formatAxisMap, defaultProps, }: CategoricalChartOptions) => React.ForwardRefExoticComponent<CategoricalChartProps & React.RefAttributes<{
    readonly eventEmitterSymbol: Symbol;
    clipPathId: string;
    accessibilityManager: AccessibilityManager;
    throttleTriggeredAfterMouseMove: DebouncedFunc<(e: MousePointer) => any>;
    container?: HTMLElement;
    componentDidMount(): void;
    displayDefaultTooltip(): void;
    getSnapshotBeforeUpdate(prevProps: Readonly<CategoricalChartProps>, prevState: Readonly<CategoricalChartState>): null;
    componentDidUpdate(prevProps: CategoricalChartProps): void;
    componentWillUnmount(): void;
    getTooltipEventType(): TooltipEventType;
    /**
     * Get the information of mouse in chart, return null when the mouse is not in the chart
     * @param  {MousePointer} event    The event object
     * @return {Object}          Mouse data
     */
    getMouseInfo(event: MousePointer): {
        activeTooltipIndex: number;
        activeLabel: any;
        activePayload: any[];
        activeCoordinate: ChartCoordinate;
        xValue: any;
        yValue: any;
        chartX: number;
        chartY: number;
    } | {
        activeTooltipIndex: number;
        activeLabel: any;
        activePayload: any[];
        activeCoordinate: ChartCoordinate;
        chartX: number;
        chartY: number;
    };
    inRange(x: number, y: number, scale?: number): any;
    parseEventsOfWrapper(): any;
    addListener(): void;
    removeListener(): void;
    handleLegendBBoxUpdate: (box: DOMRect | null) => void;
    handleReceiveSyncEvent: (cId: number | string, data: CategoricalChartState, emitter: Symbol) => void;
    handleBrushChange: ({ startIndex, endIndex }: {
        startIndex: number;
        endIndex: number;
    }) => void;
    /**
     * The handler of mouse entering chart
     * @param  {Object} e              Event object
     * @return {Null}                  null
     */
    handleMouseEnter: (e: React.MouseEvent) => void;
    triggeredAfterMouseMove: (e: MousePointer) => any;
    /**
     * The handler of mouse entering a scatter
     * @param {Object} el The active scatter
     * @return {Object} no return
     */
    handleItemMouseEnter: (el: any) => void;
    /**
     * The handler of mouse leaving a scatter
     * @return {Object} no return
     */
    handleItemMouseLeave: () => void;
    /**
     * The handler of mouse moving in chart
     * @param  {React.MouseEvent} e        Event object
     * @return {void} no return
     */
    handleMouseMove: (e: MousePointer & Partial<Omit<React.MouseEvent, keyof MousePointer>>) => void;
    /**
     * The handler if mouse leaving chart
     * @param {Object} e Event object
     * @return {Null} no return
     */
    handleMouseLeave: (e: any) => void;
    handleOuterEvent: (e: React.MouseEvent | React.TouchEvent) => void;
    handleClick: (e: React.MouseEvent) => void;
    handleMouseDown: (e: React.MouseEvent | React.Touch) => void;
    handleMouseUp: (e: React.MouseEvent | React.Touch) => void;
    handleTouchMove: (e: React.TouchEvent) => void;
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchEnd: (e: React.TouchEvent) => void;
    handleDoubleClick: (e: React.MouseEvent) => void;
    handleContextMenu: (e: React.MouseEvent) => void;
    triggerSyncEvent: (data: CategoricalChartState) => void;
    applySyncEvent: (data: CategoricalChartState) => void;
    filterFormatItem(item: any, displayName: any, childIndex: any): any;
    renderCursor: (element: ReactElement) => React.JSX.Element;
    renderPolarAxis: (element: React.ReactElement<any>, displayName: string, index: number) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    renderPolarGrid: (element: React.ReactElement) => React.ReactElement;
    /**
     * Draw legend
     * @return {ReactElement}            The instance of Legend
     */
    renderLegend: () => React.ReactElement;
    /**
     * Draw Tooltip
     * @return {ReactElement}  The instance of Tooltip
     */
    renderTooltip: () => React.ReactElement;
    renderBrush: (element: React.ReactElement) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    renderReferenceElement: (element: React.ReactElement, displayName: string, index: number) => React.ReactElement;
    renderActivePoints: ({ item, activePoint, basePoint, childIndex, isRange }: any) => React.ReactElement<any, string | React.JSXElementConstructor<any>>[];
    renderGraphicChild: (element: React.ReactElement, displayName: string, index: number) => any[];
    renderCustomized: (element: React.ReactElement, displayName: string, index: number) => React.ReactElement;
    renderClipPath(): React.JSX.Element;
    getXScales(): {
        [x: string]: Function | import("../util/types").ScaleType;
    };
    getYScales(): {
        [x: string]: Function | import("../util/types").ScaleType;
    };
    getXScaleByAxisId(axisId: string): Function | import("../util/types").ScaleType;
    getYScaleByAxisId(axisId: string): Function | import("../util/types").ScaleType;
    getItemByXY(chartXY: {
        x: number;
        y: number;
    }): {
        graphicalItem: any;
        payload: any;
    };
    renderMap: {
        CartesianGrid: {
            handler: typeof renderAsIs;
            once: boolean;
        };
        ReferenceArea: {
            handler: (element: React.ReactElement, displayName: string, index: number) => React.ReactElement;
        };
        ReferenceLine: {
            handler: typeof renderAsIs;
        };
        ReferenceDot: {
            handler: (element: React.ReactElement, displayName: string, index: number) => React.ReactElement;
        };
        XAxis: {
            handler: typeof renderAsIs;
        };
        YAxis: {
            handler: typeof renderAsIs;
        };
        Brush: {
            handler: (element: React.ReactElement) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
            once: boolean;
        };
        Bar: {
            handler: (element: React.ReactElement, displayName: string, index: number) => any[];
        };
        Line: {
            handler: (element: React.ReactElement, displayName: string, index: number) => any[];
        };
        Area: {
            handler: (element: React.ReactElement, displayName: string, index: number) => any[];
        };
        Radar: {
            handler: (element: React.ReactElement, displayName: string, index: number) => any[];
        };
        RadialBar: {
            handler: (element: React.ReactElement, displayName: string, index: number) => any[];
        };
        Scatter: {
            handler: (element: React.ReactElement, displayName: string, index: number) => any[];
        };
        Pie: {
            handler: (element: React.ReactElement, displayName: string, index: number) => any[];
        };
        Funnel: {
            handler: (element: React.ReactElement, displayName: string, index: number) => any[];
        };
        Tooltip: {
            handler: (element: ReactElement) => React.JSX.Element;
            once: boolean;
        };
        PolarGrid: {
            handler: (element: React.ReactElement) => React.ReactElement;
            once: boolean;
        };
        PolarAngleAxis: {
            handler: (element: React.ReactElement<any>, displayName: string, index: number) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
        };
        PolarRadiusAxis: {
            handler: (element: React.ReactElement<any>, displayName: string, index: number) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
        };
        Customized: {
            handler: (element: React.ReactElement, displayName: string, index: number) => React.ReactElement;
        };
    };
    render(): React.JSX.Element;
    context: unknown;
    setState<K extends keyof CategoricalChartState>(state: CategoricalChartState | ((prevState: Readonly<CategoricalChartState>, props: Readonly<CategoricalChartProps>) => CategoricalChartState | Pick<CategoricalChartState, K>) | Pick<CategoricalChartState, K>, callback?: () => void): void;
    forceUpdate(callback?: () => void): void;
    readonly props: Readonly<CategoricalChartProps>;
    state: Readonly<CategoricalChartState>;
    refs: {
        [key: string]: React.ReactInstance;
    };
    shouldComponentUpdate?(nextProps: Readonly<CategoricalChartProps>, nextState: Readonly<CategoricalChartState>, nextContext: any): boolean;
    componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
    componentWillMount?(): void;
    UNSAFE_componentWillMount?(): void;
    componentWillReceiveProps?(nextProps: Readonly<CategoricalChartProps>, nextContext: any): void;
    UNSAFE_componentWillReceiveProps?(nextProps: Readonly<CategoricalChartProps>, nextContext: any): void;
    componentWillUpdate?(nextProps: Readonly<CategoricalChartProps>, nextState: Readonly<CategoricalChartState>, nextContext: any): void;
    UNSAFE_componentWillUpdate?(nextProps: Readonly<CategoricalChartProps>, nextState: Readonly<CategoricalChartState>, nextContext: any): void;
}>>;
export {};
