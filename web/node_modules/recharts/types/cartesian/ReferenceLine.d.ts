/**
 * @fileOverview Reference Line
 */
import React, { ReactElement, SVGProps } from 'react';
import { ImplicitLabelType } from '../component/Label';
import { IfOverflow } from '../util/IfOverflowMatches';
import { CartesianViewBox, D3Scale } from '../util/types';
import { Props as XAxisProps } from './XAxis';
import { Props as YAxisProps } from './YAxis';
interface InternalReferenceLineProps {
    viewBox?: CartesianViewBox;
    xAxis?: Omit<XAxisProps, 'scale'> & {
        scale: D3Scale<string | number>;
    };
    yAxis?: Omit<YAxisProps, 'scale'> & {
        scale: D3Scale<string | number>;
    };
    clipPathId?: number | string;
}
export type Segment = {
    x?: number | string;
    y?: number | string;
};
export type ReferenceLinePosition = 'middle' | 'start' | 'end';
interface ReferenceLineProps extends InternalReferenceLineProps {
    isFront?: boolean;
    /** @deprecated use ifOverflow="extendDomain"  */
    alwaysShow?: boolean;
    ifOverflow?: IfOverflow;
    x?: number | string;
    y?: number | string;
    segment?: ReadonlyArray<Segment>;
    position?: ReferenceLinePosition;
    className?: number | string;
    yAxisId?: number | string;
    xAxisId?: number | string;
    shape?: ReactElement<SVGElement> | ((props: any) => ReactElement<SVGElement>);
    label?: ImplicitLabelType;
}
/**
 * This excludes `viewBox` prop from svg for two reasons:
 * 1. The components wants viewBox of object type, and svg wants string
 *    - so there's a conflict, and the component will throw if it gets string
 * 2. Internally the component calls `filterProps` which filters the viewBox away anyway
 */
export type Props = Omit<SVGProps<SVGLineElement>, 'viewBox'> & ReferenceLineProps;
type EndPointsPropsSubset = {
    alwaysShow?: boolean;
    ifOverflow?: IfOverflow;
    segment?: ReadonlyArray<Segment>;
    x?: number | string;
    y?: number | string;
};
export declare const getEndPoints: (scales: any, isFixedX: boolean, isFixedY: boolean, isSegment: boolean, viewBox: CartesianViewBox, position: Props['position'], xAxisOrientation: XAxisProps['orientation'], yAxisOrientation: YAxisProps['orientation'], props: EndPointsPropsSubset) => any[];
export declare class ReferenceLine extends React.Component<Props> {
    static displayName: string;
    static defaultProps: {
        isFront: boolean;
        ifOverflow: string;
        xAxisId: number;
        yAxisId: number;
        fill: string;
        stroke: string;
        fillOpacity: number;
        strokeWidth: number;
        position: string;
    };
    render(): React.JSX.Element;
}
export {};
