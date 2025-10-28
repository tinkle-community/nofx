import React, { CSSProperties, PureComponent, ReactNode } from 'react';
import { AllowInDimension, AnimationDuration, AnimationTiming, CartesianViewBox, Coordinate } from '../util/types';
export type TooltipBoundingBoxProps = {
    active: boolean;
    allowEscapeViewBox: AllowInDimension;
    animationDuration: AnimationDuration;
    animationEasing: AnimationTiming;
    children: ReactNode;
    coordinate: Partial<Coordinate>;
    hasPayload: boolean;
    isAnimationActive: boolean;
    offset: number;
    position: Partial<Coordinate>;
    reverseDirection: AllowInDimension;
    useTranslate3d: boolean;
    viewBox: CartesianViewBox;
    wrapperStyle: CSSProperties;
};
type State = {
    dismissed: boolean;
    dismissedAtCoordinate: Coordinate;
    lastBoundingBox: {
        width: number;
        height: number;
    };
};
export declare class TooltipBoundingBox extends PureComponent<TooltipBoundingBoxProps, State> {
    state: {
        dismissed: boolean;
        dismissedAtCoordinate: {
            x: number;
            y: number;
        };
        lastBoundingBox: {
            width: number;
            height: number;
        };
    };
    private wrapperNode;
    updateBBox(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(): void;
    handleKeyDown: (event: KeyboardEvent) => void;
    render(): React.JSX.Element;
}
export {};
