export declare const BarChart: import("react").ForwardRefExoticComponent<import("./generateCategoricalChart").CategoricalChartProps & import("react").RefAttributes<{
    readonly eventEmitterSymbol: Symbol;
    clipPathId: string;
    accessibilityManager: import("./AccessibilityManager").AccessibilityManager;
    throttleTriggeredAfterMouseMove: import("lodash").DebouncedFunc<(e: import("./generateCategoricalChart").MousePointer) => any>;
    container?: HTMLElement;
    componentDidMount(): void;
    displayDefaultTooltip(): void;
    getSnapshotBeforeUpdate(prevProps: Readonly<import("./generateCategoricalChart").CategoricalChartProps>, prevState: Readonly<import("./types").CategoricalChartState>): null;
    componentDidUpdate(prevProps: import("./generateCategoricalChart").CategoricalChartProps): void;
    componentWillUnmount(): void;
    getTooltipEventType(): import("../util/types").TooltipEventType;
    getMouseInfo(event: import("./generateCategoricalChart").MousePointer): {
        activeTooltipIndex: number;
        activeLabel: any;
        activePayload: any[];
        activeCoordinate: import("../util/types").ChartCoordinate;
        xValue: any;
        yValue: any;
        chartX: number;
        chartY: number;
    } | {
        activeTooltipIndex: number;
        activeLabel: any;
        activePayload: any[];
        activeCoordinate: import("../util/types").ChartCoordinate;
        chartX: number;
        chartY: number;
    };
    inRange(x: number, y: number, scale?: number): any;
    parseEventsOfWrapper(): any;
    addListener(): void;
    removeListener(): void;
    handleLegendBBoxUpdate: (box: DOMRect) => void;
    handleReceiveSyncEvent: (cId: string | number, data: import("./types").CategoricalChartState, emitter: Symbol) => void;
    handleBrushChange: ({ startIndex, endIndex }: {
        startIndex: number;
        endIndex: number;
    }) => void;
    handleMouseEnter: (e: import("react").MouseEvent<Element, MouseEvent>) => void;
    triggeredAfterMouseMove: (e: import("./generateCategoricalChart").MousePointer) => any;
    handleItemMouseEnter: (el: any) => void;
    handleItemMouseLeave: () => void;
    handleMouseMove: (e: import("./generateCategoricalChart").MousePointer & Partial<Omit<import("react").MouseEvent<Element, MouseEvent>, keyof import("./generateCategoricalChart").MousePointer>>) => void;
    handleMouseLeave: (e: any) => void;
    handleOuterEvent: (e: import("react").MouseEvent<Element, MouseEvent> | import("react").TouchEvent<Element>) => void;
    handleClick: (e: import("react").MouseEvent<Element, MouseEvent>) => void;
    handleMouseDown: (e: import("react").MouseEvent<Element, MouseEvent> | import("react").Touch) => void;
    handleMouseUp: (e: import("react").MouseEvent<Element, MouseEvent> | import("react").Touch) => void;
    handleTouchMove: (e: import("react").TouchEvent<Element>) => void;
    handleTouchStart: (e: import("react").TouchEvent<Element>) => void;
    handleTouchEnd: (e: import("react").TouchEvent<Element>) => void;
    handleDoubleClick: (e: import("react").MouseEvent<Element, MouseEvent>) => void;
    handleContextMenu: (e: import("react").MouseEvent<Element, MouseEvent>) => void;
    triggerSyncEvent: (data: import("./types").CategoricalChartState) => void;
    applySyncEvent: (data: import("./types").CategoricalChartState) => void;
    filterFormatItem(item: any, displayName: any, childIndex: any): any;
    renderCursor: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>) => import("react").JSX.Element;
    renderPolarAxis: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
    renderPolarGrid: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
    renderLegend: () => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
    renderTooltip: () => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
    renderBrush: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
    renderReferenceElement: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
    renderActivePoints: ({ item, activePoint, basePoint, childIndex, isRange }: any) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>[];
    renderGraphicChild: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => any[];
    renderCustomized: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
    renderClipPath(): import("react").JSX.Element;
    getXScales(): {
        [x: string]: Function | import("../util/types").ScaleType;
    };
    getYScales(): {
        [x: string]: Function | import("../util/types").ScaleType;
    };
    getXScaleByAxisId(axisId: string): Function | import("../util/types").ScaleType;
    getYScaleByAxisId(axisId: string): Function | import("../util/types").ScaleType;
    getItemByXY(chartXY: {
        x: number;
        y: number;
    }): {
        graphicalItem: any;
        payload: any;
    };
    renderMap: {
        CartesianGrid: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
            once: boolean;
        };
        ReferenceArea: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
        };
        ReferenceLine: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
        };
        ReferenceDot: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
        };
        XAxis: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
        };
        YAxis: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
        };
        Brush: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
            once: boolean;
        };
        Bar: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => any[];
        };
        Line: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => any[];
        };
        Area: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => any[];
        };
        Radar: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => any[];
        };
        RadialBar: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => any[];
        };
        Scatter: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => any[];
        };
        Pie: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => any[];
        };
        Funnel: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => any[];
        };
        Tooltip: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>) => import("react").JSX.Element;
            once: boolean;
        };
        PolarGrid: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
            once: boolean;
        };
        PolarAngleAxis: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
        };
        PolarRadiusAxis: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
        };
        Customized: {
            handler: (element: import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>, displayName: string, index: number) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
        };
    };
    render(): import("react").JSX.Element;
    context: unknown;
    setState<K extends keyof import("./types").CategoricalChartState>(state: import("./types").CategoricalChartState | ((prevState: Readonly<import("./types").CategoricalChartState>, props: Readonly<import("./generateCategoricalChart").CategoricalChartProps>) => import("./types").CategoricalChartState | Pick<import("./types").CategoricalChartState, K>) | Pick<import("./types").CategoricalChartState, K>, callback?: () => void): void;
    forceUpdate(callback?: () => void): void;
    readonly props: Readonly<import("./generateCategoricalChart").CategoricalChartProps>;
    state: Readonly<import("./types").CategoricalChartState>;
    refs: {
        [key: string]: import("react").ReactInstance;
    };
    shouldComponentUpdate?(nextProps: Readonly<import("./generateCategoricalChart").CategoricalChartProps>, nextState: Readonly<import("./types").CategoricalChartState>, nextContext: any): boolean;
    componentDidCatch?(error: Error, errorInfo: import("react").ErrorInfo): void;
    componentWillMount?(): void;
    UNSAFE_componentWillMount?(): void;
    componentWillReceiveProps?(nextProps: Readonly<import("./generateCategoricalChart").CategoricalChartProps>, nextContext: any): void;
    UNSAFE_componentWillReceiveProps?(nextProps: Readonly<import("./generateCategoricalChart").CategoricalChartProps>, nextContext: any): void;
    componentWillUpdate?(nextProps: Readonly<import("./generateCategoricalChart").CategoricalChartProps>, nextState: Readonly<import("./types").CategoricalChartState>, nextContext: any): void;
    UNSAFE_componentWillUpdate?(nextProps: Readonly<import("./generateCategoricalChart").CategoricalChartProps>, nextState: Readonly<import("./types").CategoricalChartState>, nextContext: any): void;
}>>;
