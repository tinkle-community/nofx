/**
 * @fileOverview Reference Line
 */
import React, { ReactElement } from 'react';
import { ImplicitLabelType } from '../component/Label';
import { IfOverflow } from '../util/IfOverflowMatches';
import { Props as RectangleProps } from '../shape/Rectangle';
import { CartesianViewBox, D3Scale } from '../util/types';
import { Props as XAxisProps } from './XAxis';
import { Props as YAxisProps } from './YAxis';
interface InternalReferenceAreaProps {
    viewBox?: CartesianViewBox;
    xAxis?: Omit<XAxisProps, 'scale'> & {
        scale: D3Scale<string | number>;
    };
    yAxis?: Omit<YAxisProps, 'scale'> & {
        scale: D3Scale<string | number>;
    };
    clipPathId?: number | string;
}
interface ReferenceAreaProps extends InternalReferenceAreaProps {
    isFront?: boolean;
    /** @deprecated use ifOverflow="extendDomain"  */
    alwaysShow?: boolean;
    ifOverflow?: IfOverflow;
    x1?: number | string;
    x2?: number | string;
    y1?: number | string;
    y2?: number | string;
    className?: number | string;
    yAxisId?: number | string;
    xAxisId?: number | string;
    shape?: ReactElement<SVGElement> | ((props: any) => ReactElement<SVGElement>);
    label?: ImplicitLabelType;
}
export type Props = RectangleProps & ReferenceAreaProps;
export declare class ReferenceArea extends React.Component<Props> {
    static displayName: string;
    static defaultProps: {
        isFront: boolean;
        ifOverflow: string;
        xAxisId: number;
        yAxisId: number;
        r: number;
        fill: string;
        fillOpacity: number;
        stroke: string;
        strokeWidth: number;
    };
    static renderRect: (option: ReferenceAreaProps['shape'], props: any) => React.JSX.Element;
    render(): React.JSX.Element;
}
export {};
