/**
 * @fileOverview Brush
 */
import React, { PureComponent, ReactElement, TouchEvent, SVGProps } from 'react';
import { ScalePoint } from 'victory-vendor/d3-scale';
import { Padding, DataKey } from '../util/types';
type BrushTravellerType = ReactElement<SVGElement> | ((props: any) => ReactElement<SVGElement>);
interface BrushStartEndIndex {
    startIndex?: number;
    endIndex?: number;
}
interface InternalBrushProps {
    x?: number;
    y?: number;
    width?: number;
    data?: any[];
    updateId?: string | number;
}
interface BrushProps extends InternalBrushProps {
    className?: string;
    ariaLabel?: string;
    height: number;
    travellerWidth?: number;
    traveller?: BrushTravellerType;
    gap?: number;
    padding?: Padding;
    dataKey?: DataKey<any>;
    startIndex?: number;
    endIndex?: number;
    tickFormatter?: (value: any, index: number) => string | number;
    children?: ReactElement;
    onChange?: (newIndex: BrushStartEndIndex) => void;
    onDragEnd?: (newIndex: BrushStartEndIndex) => void;
    leaveTimeOut?: number;
    alwaysShowText?: boolean;
}
export type Props = Omit<SVGProps<SVGElement>, 'onChange'> & BrushProps;
type BrushTravellerId = 'startX' | 'endX';
interface State {
    isTravellerMoving?: boolean;
    isTravellerFocused?: boolean;
    isSlideMoving?: boolean;
    startX?: number;
    endX?: number;
    slideMoveStartX?: number;
    movingTravellerId?: BrushTravellerId;
    isTextActive?: boolean;
    brushMoveStartX?: number;
    scale?: ScalePoint<number>;
    scaleValues?: number[];
    prevData?: any[];
    prevWidth?: number;
    prevX?: number;
    prevTravellerWidth?: number;
    prevUpdateId?: string | number;
}
export declare class Brush extends PureComponent<Props, State> {
    static displayName: string;
    static defaultProps: {
        height: number;
        travellerWidth: number;
        gap: number;
        fill: string;
        stroke: string;
        padding: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
        leaveTimeOut: number;
        alwaysShowText: boolean;
    };
    constructor(props: Props);
    leaveTimer?: number;
    travellerDragStartHandlers?: Record<BrushTravellerId, (event: React.MouseEvent<SVGGElement> | TouchEvent<SVGGElement>) => void>;
    static renderDefaultTraveller(props: any): React.JSX.Element;
    static renderTraveller(option: BrushTravellerType, props: any): React.JSX.Element;
    static getDerivedStateFromProps(nextProps: Props, prevState: State): State;
    componentWillUnmount(): void;
    static getIndexInRange(valueRange: number[], x: number): number;
    getIndex({ startX, endX }: {
        startX: number;
        endX: number;
    }): {
        startIndex: number;
        endIndex: number;
    };
    getTextOfTick(index: number): any;
    handleDrag: (e: React.Touch | React.MouseEvent<SVGGElement> | MouseEvent) => void;
    handleTouchMove: (e: TouchEvent<SVGGElement>) => void;
    attachDragEndListener(): void;
    detachDragEndListener(): void;
    handleDragEnd: () => void;
    handleLeaveWrapper: () => void;
    handleEnterSlideOrTraveller: () => void;
    handleLeaveSlideOrTraveller: () => void;
    handleSlideDragStart: (e: TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => void;
    handleSlideDrag(e: React.Touch | React.MouseEvent<SVGGElement> | MouseEvent): void;
    handleTravellerDragStart(id: BrushTravellerId, e: React.MouseEvent<SVGGElement> | TouchEvent<SVGGElement>): void;
    handleTravellerMove(e: React.Touch | React.MouseEvent<SVGGElement> | MouseEvent): void;
    handleTravellerMoveKeyboard(direction: 1 | -1, id: BrushTravellerId): void;
    renderBackground(): React.JSX.Element;
    renderPanorama(): React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    renderTravellerLayer(travellerX: number, id: BrushTravellerId): React.JSX.Element;
    renderSlide(startX: number, endX: number): React.JSX.Element;
    renderText(): React.JSX.Element;
    render(): React.JSX.Element;
}
export {};
