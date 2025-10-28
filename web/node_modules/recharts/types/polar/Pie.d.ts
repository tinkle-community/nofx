/**
 * @fileOverview Render sectors of a pie
 */
import React, { PureComponent, ReactElement, ReactNode, SVGProps } from 'react';
import { Props as SectorProps } from '../shape/Sector';
import { LegendType, TooltipType, AnimationTiming, Coordinate, ChartOffset, DataKey, PresentationAttributesAdaptChildEvent, AnimationDuration, ActiveShape } from '../util/types';
interface PieDef {
    /** The abscissa of pole in polar coordinate  */
    cx?: number | string;
    /** The ordinate of pole in polar coordinate  */
    cy?: number | string;
    /** The start angle of first sector */
    startAngle?: number;
    /** The end angle of last sector */
    endAngle?: number;
    paddingAngle?: number;
    /** The inner radius of sectors */
    innerRadius?: number | string;
    /** The outer radius of sectors */
    outerRadius?: number | string;
    cornerRadius?: number | string;
}
type PieLabelLine = ReactElement<SVGElement> | ((props: any) => ReactElement<SVGElement>) | SVGProps<SVGPathElement> | boolean;
export type PieLabel<P = any> = ReactElement<SVGElement> | ((props: P) => ReactNode | ReactElement<SVGElement>) | (SVGProps<SVGTextElement> & {
    offsetRadius?: number;
}) | boolean;
export type PieSectorDataItem = SectorProps & {
    percent?: number;
    name?: string | number;
    midAngle?: number;
    middleRadius?: number;
    tooltipPosition?: Coordinate;
    value?: number;
    paddingAngle?: number;
    dataKey?: string;
    payload?: any;
};
interface PieProps extends PieDef {
    className?: string;
    animationId?: number;
    dataKey: DataKey<any>;
    nameKey?: DataKey<any>;
    valueKey?: DataKey<any>;
    /** Match each sector's stroke color to it's fill color */
    blendStroke?: boolean;
    /** The minimum angle for no-zero element */
    minAngle?: number;
    legendType?: LegendType;
    tooltipType?: TooltipType;
    /** the max radius of pie */
    maxRadius?: number;
    hide?: boolean;
    /** the input data */
    data?: any[];
    sectors?: PieSectorDataItem[];
    activeShape?: ActiveShape<PieSectorDataItem>;
    inactiveShape?: ActiveShape<PieSectorDataItem>;
    labelLine?: PieLabelLine;
    label?: PieLabel;
    activeIndex?: number | number[];
    animationEasing?: AnimationTiming;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: AnimationDuration;
    onAnimationEnd?: () => void;
    onAnimationStart?: () => void;
    id?: string;
    onMouseEnter?: (data: any, index: number, e: React.MouseEvent) => void;
    onMouseLeave?: (data: any, index: number, e: React.MouseEvent) => void;
    onClick?: (data: any, index: number, e: React.MouseEvent) => void;
    rootTabIndex?: number;
}
export interface PieLabelRenderProps extends PieDef {
    name: string;
    percent?: number;
    stroke: string;
    index?: number;
    textAnchor: string;
    x: number;
    y: number;
    [key: string]: any;
}
interface State {
    isAnimationFinished?: boolean;
    prevIsAnimationActive?: boolean;
    prevSectors?: PieSectorDataItem[];
    curSectors?: PieSectorDataItem[];
    prevAnimationId?: number;
    sectorToFocus?: number;
}
export type Props = PresentationAttributesAdaptChildEvent<any, SVGElement> & PieProps;
export declare class Pie extends PureComponent<Props, State> {
    pieRef: SVGGElement;
    sectorRefs: SVGGElement[];
    static displayName: string;
    static defaultProps: {
        stroke: string;
        fill: string;
        legendType: string;
        cx: string;
        cy: string;
        startAngle: number;
        endAngle: number;
        innerRadius: number;
        outerRadius: string;
        paddingAngle: number;
        labelLine: boolean;
        hide: boolean;
        minAngle: number;
        isAnimationActive: boolean;
        animationBegin: number;
        animationDuration: number;
        animationEasing: string;
        nameKey: string;
        blendStroke: boolean;
        rootTabIndex: number;
    };
    static parseDeltaAngle: (startAngle: number, endAngle: number) => number;
    static getRealPieData: (itemProps: Props) => any[];
    static parseCoordinateOfPie: (itemProps: Props, offset: ChartOffset) => {
        cx: number;
        cy: number;
        innerRadius: number;
        outerRadius: number;
        maxRadius: number;
    };
    static getComposedData: ({ item, offset, }: {
        item: React.ReactElement<Props>;
        offset: ChartOffset;
    }) => Omit<Props, 'dataKey'>;
    constructor(props: Props);
    state: State;
    static getDerivedStateFromProps(nextProps: Props, prevState: State): State;
    static getTextAnchor(x: number, cx: number): "start" | "middle" | "end";
    id: string;
    isActiveIndex(i: number): boolean;
    hasActiveIndex(): number | boolean;
    handleAnimationEnd: () => void;
    handleAnimationStart: () => void;
    static renderLabelLineItem(option: PieLabelLine, props: any, key: string): React.JSX.Element;
    static renderLabelItem(option: PieLabel, props: any, value: any): React.JSX.Element;
    renderLabels(sectors: PieSectorDataItem[]): React.JSX.Element;
    renderSectorsStatically(sectors: PieSectorDataItem[]): React.JSX.Element[];
    renderSectorsWithAnimation(): React.JSX.Element;
    attachKeyboardHandlers(pieRef: SVGGElement): void;
    renderSectors(): React.JSX.Element | React.JSX.Element[];
    componentDidMount(): void;
    render(): React.JSX.Element;
}
export {};
