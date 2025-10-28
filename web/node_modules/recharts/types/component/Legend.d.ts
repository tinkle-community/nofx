/**
 * @fileOverview Legend
 */
import React, { PureComponent, CSSProperties } from 'react';
import { Payload, Props as DefaultProps } from './DefaultLegendContent';
import { LayoutType } from '../util/types';
import { UniqueOption } from '../util/payload/getUniqPayload';
export type Props = DefaultProps & {
    wrapperStyle?: CSSProperties;
    chartWidth?: number;
    chartHeight?: number;
    width?: number;
    height?: number;
    margin?: {
        top?: number;
        left?: number;
        bottom?: number;
        right?: number;
    };
    payloadUniqBy?: UniqueOption<Payload>;
    onBBoxUpdate?: (box: DOMRect | null) => void;
};
interface State {
    boxWidth: number;
    boxHeight: number;
}
export declare class Legend extends PureComponent<Props, State> {
    static displayName: string;
    static defaultProps: {
        iconSize: number;
        layout: string;
        align: string;
        verticalAlign: string;
    };
    private wrapperNode;
    static getWithHeight(item: {
        props: {
            layout?: LayoutType;
            height?: number;
            width?: number;
        };
    }, chartWidth: number): null | {
        height: number;
    } | {
        width: number;
    };
    lastBoundingBox: {
        width: number;
        height: number;
    };
    componentDidMount(): void;
    componentDidUpdate(): void;
    getBBox(): DOMRect;
    private updateBBox;
    private getBBoxSnapshot;
    private getDefaultPosition;
    render(): React.JSX.Element;
}
export {};
