import type { LayoutType, TickItem } from '../util/types';
interface ContainerOffset {
    top: number;
    left: number;
}
interface InitiableOptions {
    coordinateList?: TickItem[];
    mouseHandlerCallback?: (e: Partial<MouseEvent>) => void;
    container?: HTMLElement;
    layout?: LayoutType;
    offset?: ContainerOffset;
}
export declare class AccessibilityManager {
    private activeIndex;
    private coordinateList;
    private mouseHandlerCallback;
    private container;
    private layout;
    private offset;
    setDetails({ coordinateList, container, layout, offset, mouseHandlerCallback, }: InitiableOptions): void;
    focus(): void;
    keyboardEvent(e: any): void;
    setIndex(newIndex: number): void;
    private spoofMouse;
}
export {};
