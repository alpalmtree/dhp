import type { HTMLElements } from "./html.ts";
interface RawHtml {
    __html?: string;
}
type Props = Record<string, unknown>;
type Content = string | number | boolean | RawHtml | ((...args: unknown[]) => Content) | Content[];
interface Component {
    type: string | ((props: Props) => any);
    props: Props;
}
/** The jsx function to create elements */
export declare function jsx(type: string, props: Props): Component;
/** Alias jsxs to jsx for compatibility with automatic runtime */
export { jsx as jsxs };
/** Fragment component to group multiple elements */
export declare function Fragment(props: {
    children: unknown;
}): unknown;
/** Required for "precompile" mode */
export declare function jsxTemplate(strings: string[], ...values: unknown[]): Promise<string>;
/** Required for "precompile" mode: render content */
export declare function jsxEscape(content: Content): Promise<string>;
export declare function renderComponent(component: Component | Component[]): Promise<string>;
/** Required for "precompile" mode: render attributes */
export declare function jsxAttr(name: string, value: unknown): string;
/** Make JSX global */
declare global {
    export namespace JSX {
        type Children = HTMLElements | RawHtml | string | number | boolean | null | Children[];
        interface IntrinsicElements extends HTMLElements {
        }
        interface ElementChildrenAttribute {
            children: Children;
        }
    }
}
