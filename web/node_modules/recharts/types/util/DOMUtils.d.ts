import { CSSProperties } from 'react';
import { Size } from './types';
export declare const getStyleString: (style: CSSProperties) => string;
export declare const getStringSize: (text: string | number, style?: CSSProperties) => Size;
interface ContainerOffset {
    top: number;
    left: number;
}
export declare const getOffset: (rect: ContainerOffset) => ContainerOffset;
export {};
