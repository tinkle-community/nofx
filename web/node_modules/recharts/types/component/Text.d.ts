import React, { CSSProperties, SVGProps } from 'react';
interface TextProps {
    scaleToFit?: boolean;
    angle?: number;
    textAnchor?: 'start' | 'middle' | 'end' | 'inherit';
    verticalAnchor?: 'start' | 'middle' | 'end';
    style?: CSSProperties;
    lineHeight?: number | string;
    breakAll?: boolean;
    children?: string | number;
    maxLines?: number;
}
export type Props = Omit<SVGProps<SVGTextElement>, 'textAnchor' | 'verticalAnchor'> & TextProps;
export declare const Text: ({ x: propsX, y: propsY, lineHeight, capHeight, scaleToFit, textAnchor, verticalAnchor, fill, ...props }: Props) => React.JSX.Element;
export {};
