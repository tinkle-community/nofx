import React, { Component, FunctionComponent, ReactNode } from 'react';
import { DotProps } from '..';
import { FilteredSvgElementType } from './types';
import { AreaDot } from '../cartesian/Area';
import { LineDot } from '../cartesian/Line';
export declare const SCALE_TYPES: string[];
export declare const LEGEND_TYPES: string[];
export declare const TOOLTIP_TYPES: string[];
/**
 * Get the display name of a component
 * @param  {Object} Comp Specified Component
 * @return {String}      Display name of Component
 */
export declare const getDisplayName: (Comp: React.ComponentType | string) => string;
export declare const toArray: <T extends React.ReactNode>(children: T | T[]) => T[];
export declare function findAllByType<ComponentType extends React.ComponentType, DetailedElement = React.DetailedReactHTMLElement<React.ComponentProps<ComponentType>, HTMLElement>>(children: ReactNode, type: ComponentType | ComponentType[]): DetailedElement[];
export declare function findChildByType<ComponentType extends React.ComponentType>(children: ReactNode[], type: ComponentType | ComponentType[]): React.DetailedReactHTMLElement<React.ComponentProps<ComponentType>, HTMLElement>;
export declare const withoutType: (children: ReactNode, type: string | string[]) => React.ReactNode[];
/**
 * validate the width and height props of a chart element
 * @param  {Object} el A chart element
 * @return {Boolean}   true If the props width and height are number, and greater than 0
 */
export declare const validateWidthHeight: (el: any) => boolean;
export declare const hasClipDot: (dot: LineDot | AreaDot) => dot is DotProps;
/**
 * Checks if the property is valid to spread onto an SVG element or onto a specific component
 * @param {unknown} property property value currently being compared
 * @param {string} key property key currently being compared
 * @param {boolean} includeEvents if events are included in spreadable props
 * @param {boolean} svgElementType checks against map of SVG element types to attributes
 * @returns {boolean} is prop valid
 */
export declare const isValidSpreadableProp: (property: unknown, key: string, includeEvents?: boolean, svgElementType?: FilteredSvgElementType) => boolean;
/**
 * Filter all the svg elements of children
 * @param  {Array} children The children of a react element
 * @return {Array}          All the svg elements
 */
export declare const filterSvgElements: (children: React.ReactElement[]) => React.ReactElement[];
export declare const filterProps: (props: Record<string, any> | Component | FunctionComponent | boolean | unknown, includeEvents: boolean, svgElementType?: FilteredSvgElementType) => Record<string, any>;
/**
 * Wether props of children changed
 * @param  {Object} nextChildren The latest children
 * @param  {Object} prevChildren The prev children
 * @return {Boolean}             equal or not
 */
export declare const isChildrenEqual: (nextChildren: React.ReactElement[], prevChildren: React.ReactElement[]) => boolean;
export declare const isSingleChildEqual: (nextChild: React.ReactElement, prevChild: React.ReactElement) => boolean;
export declare const renderByOrder: (children: React.ReactElement[], renderMap: any) => React.ReactElement<any, string | React.JSXElementConstructor<any>>[];
export declare const getReactEventByType: (e: {
    type?: string;
}) => string;
export declare const parseChildIndex: (child: any, children: any[]) => number;
