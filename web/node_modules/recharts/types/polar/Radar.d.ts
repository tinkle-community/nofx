/**
 * @fileOverview Radar
 */
import React, { PureComponent, ReactElement, MouseEvent, SVGProps } from 'react';
import { Props as DotProps } from '../shape/Dot';
import { LegendType, TooltipType, AnimationTiming, DataKey, AnimationDuration } from '../util/types';
import { Props as PolarAngleAxisProps } from './PolarAngleAxis';
import { Props as PolarRadiusAxisProps } from './PolarRadiusAxis';
interface RadarPoint {
    x: number;
    y: number;
    cx?: number;
    cy?: number;
    angle?: number;
    radius?: number;
    value?: number;
    payload?: any;
    name?: string;
}
type RadarDot = ReactElement<SVGElement> | ((props: any) => ReactElement<SVGElement>) | DotProps | boolean;
interface RadarProps {
    className?: string;
    dataKey: DataKey<any>;
    angleAxisId?: string | number;
    radiusAxisId?: string | number;
    points?: RadarPoint[];
    baseLinePoints?: RadarPoint[];
    isRange?: boolean;
    shape?: ReactElement<SVGElement> | ((props: any) => ReactElement<SVGElement>);
    activeDot?: RadarDot;
    dot?: RadarDot;
    legendType?: LegendType;
    tooltipType?: TooltipType;
    hide?: boolean;
    connectNulls?: boolean;
    label?: any;
    onAnimationStart?: () => void;
    onAnimationEnd?: () => void;
    animationBegin?: number;
    animationDuration?: AnimationDuration;
    isAnimationActive?: boolean;
    animationId?: number;
    animationEasing?: AnimationTiming;
    onMouseEnter?: (props: any, e: MouseEvent<SVGPolygonElement>) => void;
    onMouseLeave?: (props: any, e: MouseEvent<SVGPolygonElement>) => void;
}
type RadiusAxis = PolarRadiusAxisProps & {
    scale: (value: any) => number;
};
type AngleAxis = PolarAngleAxisProps & {
    scale: (value: any) => number;
};
export type Props = Omit<SVGProps<SVGElement>, 'onMouseEnter' | 'onMouseLeave' | 'points'> & RadarProps;
interface State {
    isAnimationFinished?: boolean;
    prevPoints?: RadarPoint[];
    curPoints?: RadarPoint[];
    prevAnimationId?: number;
}
export declare class Radar extends PureComponent<Props, State> {
    static displayName: string;
    static defaultProps: {
        angleAxisId: number;
        radiusAxisId: number;
        hide: boolean;
        activeDot: boolean;
        dot: boolean;
        legendType: string;
        isAnimationActive: boolean;
        animationBegin: number;
        animationDuration: number;
        animationEasing: string;
    };
    static getComposedData: ({ radiusAxis, angleAxis, displayedData, dataKey, bandSize, }: {
        radiusAxis: RadiusAxis;
        angleAxis: AngleAxis;
        displayedData: any[];
        dataKey: RadarProps['dataKey'];
        bandSize: number;
    }) => {
        points: RadarPoint[];
        isRange: boolean;
        baseLinePoints: RadarPoint[];
    };
    state: State;
    static getDerivedStateFromProps(nextProps: Props, prevState: State): State;
    handleAnimationEnd: () => void;
    handleAnimationStart: () => void;
    handleMouseEnter: (e: MouseEvent<SVGPolygonElement>) => void;
    handleMouseLeave: (e: MouseEvent<SVGPolygonElement>) => void;
    static renderDotItem(option: RadarDot, props: any): React.JSX.Element;
    renderDots(points: RadarPoint[]): React.JSX.Element;
    renderPolygonStatically(points: RadarPoint[]): React.JSX.Element;
    renderPolygonWithAnimation(): React.JSX.Element;
    renderPolygon(): React.JSX.Element;
    render(): React.JSX.Element;
}
export {};
