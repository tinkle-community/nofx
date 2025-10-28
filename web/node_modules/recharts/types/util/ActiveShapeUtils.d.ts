import React, { SVGProps } from 'react';
import { GraphicalItem } from '../chart/generateCategoricalChart';
/**
 * This is an abstraction for rendering a user defined prop for a customized shape in several forms.
 *
 * <Shape /> is the root and will handle taking in:
 *  - an object of svg properties
 *  - a boolean
 *  - a render prop(inline function that returns jsx)
 *  - a react element
 *
 * <ShapeSelector /> is a subcomponent of <Shape /> and used to match a component
 * to the value of props.shapeType that is passed to the root.
 *
 */
type ShapeType = 'trapezoid' | 'rectangle' | 'sector' | 'symbols';
export type ShapeProps<OptionType, ExtraProps, ShapePropsType> = {
    shapeType: ShapeType;
    option: OptionType;
    isActive: boolean;
    activeClassName?: string;
    propTransformer?: (option: OptionType, props: unknown) => ShapePropsType;
} & ExtraProps;
export declare function getPropsFromShapeOption(option: unknown): SVGProps<SVGPathElement>;
export declare function Shape<OptionType, ExtraProps, ShapePropsType>({ option, shapeType, propTransformer, activeClassName, isActive, ...props }: ShapeProps<OptionType, ExtraProps, ShapePropsType>): React.JSX.Element;
type FunnelItem = {
    x: number;
    y: number;
    labelViewBox: {
        x: number;
        y: number;
    };
    tooltipPayload: Array<{
        payload: {
            payload: ShapeData;
        };
    }>;
};
type PieItem = {
    startAngle: number;
    endAngle: number;
    tooltipPayload: Array<{
        payload: {
            payload: ShapeData;
        };
    }>;
};
type ScatterItem = {
    x: number;
    y: number;
    z: number;
    payload?: ShapeData;
};
type ShapeData = FunnelItem | PieItem | ScatterItem;
type GetActiveShapeIndexForTooltip = {
    activeTooltipItem: ShapeData;
    graphicalItem: GraphicalItem;
    itemData: unknown[];
};
export declare function isFunnel(graphicalItem: GraphicalItem, _item: unknown): _item is FunnelItem;
export declare function isPie(graphicalItem: GraphicalItem, _item: unknown): _item is PieItem;
export declare function isScatter(graphicalItem: GraphicalItem, _item: unknown): _item is ScatterItem;
export declare function compareFunnel(shapeData: FunnelItem, activeTooltipItem: FunnelItem): boolean;
export declare function comparePie(shapeData: PieItem, activeTooltipItem: PieItem): boolean;
export declare function compareScatter(shapeData: ScatterItem, activeTooltipItem: ScatterItem): boolean;
/**
 *
 * @param {GetActiveShapeIndexForTooltip} arg an object of incoming attributes from Tooltip
 * @returns {number}
 *
 * To handle possible duplicates in the data set,
 * match both the data value of the active item to a data value on a graph item,
 * and match the mouse coordinates of the active item to the coordinates of in a particular components shape data.
 * This assumes equal lengths of shape objects to data items.
 */
export declare function getActiveShapeIndexForTooltip({ activeTooltipItem, graphicalItem, itemData, }: GetActiveShapeIndexForTooltip): number;
export {};
