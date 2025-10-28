/**
 * @fileOverview Render a group of scatters
 */
import React, { PureComponent, ReactElement } from 'react';
import { ImplicitLabelListType } from '../component/LabelList';
import { Props as ZAxisProps } from './ZAxis';
import { Props as CurveProps, CurveType } from '../shape/Curve';
import { Props as ErrorBarProps } from './ErrorBar';
import { LegendType, AnimationTiming, D3Scale, ChartOffset, DataKey, TickItem, PresentationAttributesAdaptChildEvent, AnimationDuration, ActiveShape, SymbolType } from '../util/types';
import { TooltipType } from '../component/DefaultTooltipContent';
import { Props as XAxisProps } from './XAxis';
import { Props as YAxisProps } from './YAxis';
import { InnerSymbolsProp } from '../shape/Symbols';
interface ScattterPointNode {
    x?: number | string;
    y?: number | string;
    z?: number | string;
}
export interface ScatterPointItem {
    cx?: number;
    cy?: number;
    size?: number;
    node?: ScattterPointNode;
    payload?: any;
}
export type ScatterCustomizedShape = ActiveShape<ScatterPointItem, SVGPathElement & InnerSymbolsProp> | SymbolType;
interface ScatterProps {
    data?: any[];
    xAxisId?: string | number;
    yAxisId?: string | number;
    zAxisId?: string | number;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    xAxis?: Omit<XAxisProps, 'scale'> & {
        scale: D3Scale<string | number>;
    };
    yAxis?: Omit<YAxisProps, 'scale'> & {
        scale: D3Scale<string | number>;
    };
    zAxis?: Omit<ZAxisProps, 'scale'> & {
        scale: D3Scale<string | number>;
    };
    dataKey?: DataKey<any>;
    line?: ReactElement<SVGElement> | ((props: any) => ReactElement<SVGElement>) | CurveProps | boolean;
    lineType?: 'fitting' | 'joint';
    lineJointType?: CurveType;
    legendType?: LegendType;
    tooltipType?: TooltipType;
    className?: string;
    name?: string | number;
    activeIndex?: number;
    activeShape?: ScatterCustomizedShape;
    shape?: ScatterCustomizedShape;
    points?: ScatterPointItem[];
    hide?: boolean;
    label?: ImplicitLabelListType<any>;
    isAnimationActive?: boolean;
    animationId?: number;
    animationBegin?: number;
    animationDuration?: AnimationDuration;
    animationEasing?: AnimationTiming;
}
export type Props = PresentationAttributesAdaptChildEvent<any, SVGElement> & ScatterProps;
interface State {
    isAnimationFinished?: boolean;
    prevPoints?: ScatterPointItem[];
    curPoints?: ScatterPointItem[];
    prevAnimationId?: number;
}
export declare class Scatter extends PureComponent<Props, State> {
    static displayName: string;
    static defaultProps: {
        xAxisId: number;
        yAxisId: number;
        zAxisId: number;
        legendType: string;
        lineType: string;
        lineJointType: string;
        data: any[];
        shape: string;
        hide: boolean;
        isAnimationActive: boolean;
        animationBegin: number;
        animationDuration: number;
        animationEasing: string;
    };
    /**
     * Compose the data of each group
     * @param  {Object} xAxis   The configuration of x-axis
     * @param  {Object} yAxis   The configuration of y-axis
     * @param  {String} dataKey The unique key of a group
     * @return {Array}  Composed data
     */
    static getComposedData: ({ xAxis, yAxis, zAxis, item, displayedData, xAxisTicks, yAxisTicks, offset, }: {
        props: Props;
        xAxis: Props['xAxis'];
        yAxis: Props['yAxis'];
        zAxis: Props['zAxis'];
        xAxisTicks: TickItem[];
        yAxisTicks: TickItem[];
        item: Scatter;
        bandSize: number;
        displayedData: any[];
        offset: ChartOffset;
    }) => {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
        width?: number;
        height?: number;
        brushBottom?: number;
        points: any[];
    };
    state: State;
    static getDerivedStateFromProps(nextProps: Props, prevState: State): State;
    handleAnimationEnd: () => void;
    handleAnimationStart: () => void;
    id: string;
    renderSymbolsStatically(points: ScatterPointItem[]): React.JSX.Element[];
    renderSymbolsWithAnimation(): React.JSX.Element;
    renderSymbols(): React.JSX.Element | React.JSX.Element[];
    renderErrorBar(): React.ReactElement<ErrorBarProps, string | React.JSXElementConstructor<any>>[];
    renderLine(): React.JSX.Element;
    render(): React.JSX.Element;
}
export {};
