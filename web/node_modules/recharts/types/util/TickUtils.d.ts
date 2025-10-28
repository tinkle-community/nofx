import { Size, CartesianViewBox, CartesianTickItem } from './types';
export declare function getAngledTickWidth(contentSize: Size, unitSize: Size, angle: number): number;
export declare function getTickBoundaries(viewBox: CartesianViewBox, sign: number, sizeKey: string): {
    start: number;
    end: number;
};
export declare function isVisible(sign: number, tickPosition: number, getSize: () => number, start: number, end: number): boolean;
export declare function getNumberIntervalTicks(ticks: CartesianTickItem[], interval: number): CartesianTickItem[];
