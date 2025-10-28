export type IfOverflow = 'hidden' | 'visible' | 'discard' | 'extendDomain';
export declare const ifOverflowMatches: (props: {
    alwaysShow?: boolean;
    ifOverflow?: IfOverflow;
}, value: IfOverflow) => boolean;
