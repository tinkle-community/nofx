/**
 * @fileOverview Tooltip
 */
import React, { PureComponent, CSSProperties, ReactNode, ReactElement, SVGProps } from 'react';
import { ValueType, NameType, Payload, Props as ToltipContentProps } from './DefaultTooltipContent';
import { UniqueOption } from '../util/payload/getUniqPayload';
import { AllowInDimension, AnimationDuration, AnimationTiming, CartesianViewBox, Coordinate } from '../util/types';
export type ContentType<TValue extends ValueType, TName extends NameType> = ReactElement | ((props: TooltipProps<TValue, TName>) => ReactNode);
export type TooltipProps<TValue extends ValueType, TName extends NameType> = ToltipContentProps<TValue, TName> & {
    accessibilityLayer?: boolean;
    /**
     * If true, then Tooltip is always displayed, once an activeIndex is set by mouse over, or programmatically.
     * If false, then Tooltip is never displayed.
     * If active is undefined, Recharts will control when the Tooltip displays. This includes mouse and keyboard controls.
     */
    active?: boolean | undefined;
    /**
     * If true, then Tooltip will information about hidden series (defaults to false). Interacting with the hide property of Area, Bar, Line, Scatter.
     */
    includeHidden?: boolean | undefined;
    allowEscapeViewBox?: AllowInDimension;
    animationDuration?: AnimationDuration;
    animationEasing?: AnimationTiming;
    content?: ContentType<TValue, TName>;
    coordinate?: Partial<Coordinate>;
    cursor?: boolean | ReactElement | SVGProps<SVGElement>;
    filterNull?: boolean;
    defaultIndex?: number;
    isAnimationActive?: boolean;
    offset?: number;
    payloadUniqBy?: UniqueOption<Payload<TValue, TName>>;
    position?: Partial<Coordinate>;
    reverseDirection?: AllowInDimension;
    shared?: boolean;
    trigger?: 'hover' | 'click';
    useTranslate3d?: boolean;
    viewBox?: CartesianViewBox;
    wrapperStyle?: CSSProperties;
};
export declare class Tooltip<TValue extends ValueType, TName extends NameType> extends PureComponent<TooltipProps<TValue, TName>> {
    static displayName: string;
    static defaultProps: {
        accessibilityLayer: boolean;
        allowEscapeViewBox: {
            x: boolean;
            y: boolean;
        };
        animationDuration: number;
        animationEasing: string;
        contentStyle: {};
        coordinate: {
            x: number;
            y: number;
        };
        cursor: boolean;
        cursorStyle: {};
        filterNull: boolean;
        isAnimationActive: boolean;
        itemStyle: {};
        labelStyle: {};
        offset: number;
        reverseDirection: {
            x: boolean;
            y: boolean;
        };
        separator: string;
        trigger: string;
        useTranslate3d: boolean;
        viewBox: {
            x: number;
            y: number;
            height: number;
            width: number;
        };
        wrapperStyle: {};
    };
    render(): React.JSX.Element;
}
