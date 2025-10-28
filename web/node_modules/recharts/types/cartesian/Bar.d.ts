/**
 * @fileOverview Render a group of bar
 */
import React, { Key, PureComponent, ReactElement } from 'react';
import { Props as RectangleProps } from '../shape/Rectangle';
import { Props as XAxisProps } from './XAxis';
import { Props as YAxisProps } from './YAxis';
import { D3Scale, TooltipType, LegendType, AnimationTiming, ChartOffset, DataKey, TickItem, PresentationAttributesAdaptChildEvent, AnimationDuration, ActiveShape } from '../util/types';
import { ImplicitLabelType } from '../component/Label';
import { MinPointSize } from '../util/BarUtils';
export interface BarRectangleItem extends RectangleProps {
    value?: number | [number, number];
    /** the coordinate of background rectangle */
    background?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    };
}
interface InternalBarProps {
    xAxis?: Omit<XAxisProps, 'scale'> & {
        scale: D3Scale<string | number>;
        x?: number;
        width?: number;
    };
    yAxis?: Omit<YAxisProps, 'scale'> & {
        scale: D3Scale<string | number>;
        y?: number;
        height?: number;
    };
    data?: BarRectangleItem[];
    top?: number;
    left?: number;
    width?: number;
    height?: number;
}
export interface BarProps extends InternalBarProps {
    className?: string;
    index?: Key;
    activeIndex?: number;
    layout?: 'horizontal' | 'vertical';
    xAxisId?: string | number;
    yAxisId?: string | number;
    stackId?: string | number;
    barSize?: string | number;
    unit?: string | number;
    name?: string | number;
    dataKey: DataKey<any>;
    tooltipType?: TooltipType;
    legendType?: LegendType;
    minPointSize?: MinPointSize;
    maxBarSize?: number;
    hide?: boolean;
    shape?: ActiveShape<BarProps, SVGPathElement>;
    activeBar?: ActiveShape<BarProps, SVGPathElement>;
    background?: ActiveShape<BarProps, SVGPathElement>;
    radius?: number | [number, number, number, number];
    onAnimationStart?: () => void;
    onAnimationEnd?: () => void;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: AnimationDuration;
    animationEasing?: AnimationTiming;
    animationId?: number;
    id?: string;
    label?: ImplicitLabelType;
}
export type Props = Omit<PresentationAttributesAdaptChildEvent<any, SVGPathElement>, 'radius' | 'name'> & BarProps;
interface State {
    readonly isAnimationFinished?: boolean;
    readonly prevData?: BarRectangleItem[];
    readonly curData?: BarRectangleItem[];
    readonly prevAnimationId?: number;
}
export declare class Bar extends PureComponent<Props, State> {
    static displayName: string;
    static defaultProps: {
        xAxisId: number;
        yAxisId: number;
        legendType: string;
        minPointSize: number;
        hide: boolean;
        data: BarRectangleItem[];
        layout: string;
        activeBar: boolean;
        isAnimationActive: boolean;
        animationBegin: number;
        animationDuration: number;
        animationEasing: string;
    };
    /**
     * Compose the data of each group
     * @param {Object} props Props for the component
     * @param {Object} item        An instance of Bar
     * @param {Array} barPosition  The offset and size of each bar
     * @param {Object} xAxis       The configuration of x-axis
     * @param {Object} yAxis       The configuration of y-axis
     * @param {Array} stackedData  The stacked data of a bar item
     * @return{Array} Composed data
     */
    static getComposedData: ({ props, item, barPosition, bandSize, xAxis, yAxis, xAxisTicks, yAxisTicks, stackedData, dataStartIndex, displayedData, offset, }: {
        props: Props;
        item: ReactElement;
        barPosition: any;
        bandSize: number;
        xAxis: InternalBarProps['xAxis'];
        yAxis: InternalBarProps['yAxis'];
        xAxisTicks: TickItem[];
        yAxisTicks: TickItem[];
        stackedData: Array<[number, number]>;
        dataStartIndex: number;
        offset: ChartOffset;
        displayedData: any[];
    }) => {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
        width?: number;
        height?: number;
        brushBottom?: number;
        data: any[];
        layout: "horizontal" | "vertical";
    };
    state: State;
    static getDerivedStateFromProps(nextProps: Props, prevState: State): State;
    id: string;
    handleAnimationEnd: () => void;
    handleAnimationStart: () => void;
    renderRectanglesStatically(data: BarRectangleItem[]): React.JSX.Element[];
    renderRectanglesWithAnimation(): React.JSX.Element;
    renderRectangles(): React.JSX.Element | React.JSX.Element[];
    renderBackground(): React.JSX.Element[];
    renderErrorBar(needClip: boolean, clipPathId: string): React.JSX.Element;
    render(): React.JSX.Element;
}
export {};
