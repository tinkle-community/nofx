/**
 * @fileOverview Cartesian Axis
 */
import React, { ReactElement, ReactNode, Component, SVGProps } from 'react';
import { CartesianViewBox, PresentationAttributesAdaptChildEvent, CartesianTickItem, AxisInterval } from '../util/types';
/** The orientation of the axis in correspondence to the chart */
export type Orientation = 'top' | 'bottom' | 'left' | 'right';
/** A unit to be appended to a value */
export type Unit = string | number;
/** The formatter function of tick */
export type TickFormatter = (value: any, index: number) => string;
export interface CartesianAxisProps {
    className?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    unit?: Unit;
    orientation?: Orientation;
    viewBox?: CartesianViewBox;
    tick?: SVGProps<SVGTextElement> | ReactElement<SVGElement> | ((props: any) => ReactElement<SVGElement>) | boolean;
    axisLine?: boolean | SVGProps<SVGLineElement>;
    tickLine?: boolean | SVGProps<SVGLineElement>;
    mirror?: boolean;
    tickMargin?: number;
    hide?: boolean;
    label?: any;
    minTickGap?: number;
    ticks?: CartesianTickItem[];
    tickSize?: number;
    tickFormatter?: TickFormatter;
    ticksGenerator?: (props?: CartesianAxisProps) => CartesianTickItem[];
    interval?: AxisInterval;
    /** Angle in which ticks will be rendered. */
    angle?: number;
}
interface IState {
    fontSize: string;
    letterSpacing: string;
}
export type Props = Omit<PresentationAttributesAdaptChildEvent<any, SVGElement>, 'viewBox'> & CartesianAxisProps;
export declare class CartesianAxis extends Component<Props, IState> {
    static displayName: string;
    static defaultProps: {
        x: number;
        y: number;
        width: number;
        height: number;
        viewBox: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        orientation: string;
        ticks: CartesianTickItem[];
        stroke: string;
        tickLine: boolean;
        axisLine: boolean;
        tick: boolean;
        mirror: boolean;
        minTickGap: number;
        tickSize: number;
        tickMargin: number;
        interval: string;
    };
    private layerReference;
    constructor(props: Props);
    shouldComponentUpdate({ viewBox, ...restProps }: Props, nextState: IState): boolean;
    componentDidMount(): void;
    /**
     * Calculate the coordinates of endpoints in ticks
     * @param  {Object} data The data of a simple tick
     * @return {Object} (x1, y1): The coordinate of endpoint close to tick text
     *  (x2, y2): The coordinate of endpoint close to axis
     */
    getTickLineCoord(data: CartesianTickItem): {
        line: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        };
        tick: {
            x: number;
            y: number;
        };
    };
    getTickTextAnchor(): string;
    getTickVerticalAnchor(): string;
    renderAxisLine(): React.JSX.Element;
    static renderTickItem(option: Props['tick'], props: any, value: ReactNode): React.JSX.Element;
    /**
     * render the ticks
     * @param {Array} ticks The ticks to actually render (overrides what was passed in props)
     * @param {string} fontSize Fontsize to consider for tick spacing
     * @param {string} letterSpacing Letterspacing to consider for tick spacing
     * @return {ReactComponent} renderedTicks
     */
    renderTicks(ticks: CartesianTickItem[], fontSize: string, letterSpacing: string): React.JSX.Element;
    render(): React.JSX.Element;
}
export {};
