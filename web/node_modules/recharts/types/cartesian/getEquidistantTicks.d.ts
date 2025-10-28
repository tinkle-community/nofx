import { CartesianTickItem } from '../util/types';
import { Sign } from './getTicks';
export declare function getEquidistantTicks(sign: Sign, boundaries: {
    start: number;
    end: number;
}, getTickSize: (tick: CartesianTickItem, index: number) => number, ticks: CartesianTickItem[], minTickGap: number): CartesianTickItem[];
