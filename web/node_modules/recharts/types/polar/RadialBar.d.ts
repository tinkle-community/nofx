/**
 * @fileOverview Render a group of radial bar
 */
import React, { PureComponent, ReactElement } from 'react';
import { Props as SectorProps } from '../shape/Sector';
import { ImplicitLabelListType } from '../component/LabelList';
import { LegendType, TooltipType, AnimationTiming, TickItem, PresentationAttributesAdaptChildEvent, AnimationDuration, ActiveShape } from '../util/types';
type RadialBarDataItem = SectorProps & {
    value?: any;
    payload?: any;
    background?: SectorProps;
};
type RadialBarBackground = ActiveShape<SectorProps>;
interface InternalRadialBarProps {
    animationId?: string | number;
    className?: string;
    angleAxisId?: string | number;
    radiusAxisId?: string | number;
    startAngle?: number;
    endAngle?: number;
    shape?: ActiveShape<SectorProps, SVGPathElement>;
    activeShape?: ActiveShape<SectorProps, SVGPathElement>;
    activeIndex?: number;
    dataKey: string | number | ((obj: any) => any);
    cornerRadius?: string | number;
    forceCornerRadius?: boolean;
    cornerIsExternal?: boolean;
    minPointSize?: number;
    maxBarSize?: number;
    data?: RadialBarDataItem[];
    legendType?: LegendType;
    tooltipType?: TooltipType;
    hide?: boolean;
    label?: ImplicitLabelListType<any>;
    stackId?: string | number;
    background?: RadialBarBackground;
    onAnimationStart?: () => void;
    onAnimationEnd?: () => void;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: AnimationDuration;
    animationEasing?: AnimationTiming;
}
export type RadialBarProps = PresentationAttributesAdaptChildEvent<any, SVGElement> & InternalRadialBarProps;
interface State {
    readonly isAnimationFinished?: boolean;
    readonly prevData?: RadialBarDataItem[];
    readonly curData?: RadialBarDataItem[];
    readonly prevAnimationId?: string | number;
}
export declare class RadialBar extends PureComponent<RadialBarProps, State> {
    static displayName: string;
    static defaultProps: {
        angleAxisId: number;
        radiusAxisId: number;
        minPointSize: number;
        hide: boolean;
        legendType: string;
        data: RadialBarDataItem[];
        isAnimationActive: boolean;
        animationBegin: number;
        animationDuration: number;
        animationEasing: string;
        forceCornerRadius: boolean;
        cornerIsExternal: boolean;
    };
    static getComposedData: ({ item, props, radiusAxis, radiusAxisTicks, angleAxis, angleAxisTicks, displayedData, dataKey, stackedData, barPosition, bandSize, dataStartIndex, }: {
        item: ReactElement;
        props: any;
        radiusAxis: any;
        radiusAxisTicks: Array<TickItem>;
        angleAxis: any;
        angleAxisTicks: Array<TickItem>;
        displayedData: any[];
        dataKey: RadialBarProps['dataKey'];
        stackedData?: any[];
        barPosition?: any[];
        bandSize?: number;
        dataStartIndex: number;
    }) => {
        data: any[];
        layout: any;
    };
    state: State;
    static getDerivedStateFromProps(nextProps: RadialBarProps, prevState: State): State;
    getDeltaAngle(): number;
    handleAnimationEnd: () => void;
    handleAnimationStart: () => void;
    renderSectorsStatically(sectors: SectorProps[]): React.JSX.Element[];
    renderSectorsWithAnimation(): React.JSX.Element;
    renderSectors(): React.JSX.Element | React.JSX.Element[];
    renderBackground(sectors?: RadialBarDataItem[]): React.JSX.Element[];
    render(): React.JSX.Element;
}
export {};
