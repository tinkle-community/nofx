import React, { ReactNode, ReactElement, SVGProps } from 'react';
import { ViewBox } from '../util/types';
export type ContentType = ReactElement | ((props: Props) => ReactNode);
export type LabelPosition = 'top' | 'left' | 'right' | 'bottom' | 'inside' | 'outside' | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom' | 'insideTopLeft' | 'insideBottomLeft' | 'insideTopRight' | 'insideBottomRight' | 'insideStart' | 'insideEnd' | 'end' | 'center' | 'centerTop' | 'centerBottom' | 'middle' | {
    x?: number;
    y?: number;
};
interface LabelProps {
    viewBox?: ViewBox;
    parentViewBox?: ViewBox;
    formatter?: Function;
    value?: number | string;
    offset?: number;
    position?: LabelPosition;
    children?: ReactNode;
    className?: string;
    content?: ContentType;
    textBreakAll?: boolean;
    angle?: number;
    index?: number;
}
export type Props = Omit<SVGProps<SVGTextElement>, 'viewBox'> & LabelProps;
export type ImplicitLabelType = boolean | string | number | ReactElement<SVGElement> | ((props: any) => ReactElement<SVGElement>) | Props;
export declare function Label({ offset, ...restProps }: Props): React.JSX.Element;
export declare namespace Label {
    var displayName: string;
    var parseViewBox: (props: any) => ViewBox;
    var renderCallByParent: (parentProps: {
        children?: React.ReactNode;
        label?: unknown;
    }, viewBox?: ViewBox, checkPropsLabel?: boolean) => React.ReactElement<any, string | React.JSXElementConstructor<any>>[];
}
export {};
