/// <reference types="./jsx-runtime.d.ts"/>
 const ssxElement = Symbol.for("ssx.element");
const voidElements = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
]);
const attributes = new Map([
    ["className", "class"],
    ["htmlFor", "for"],
]);
const proto = Object.create(null, {
    [ssxElement]: {
        value: true,
        enumerable: false,
    },
    toString: {
        value: function () {
            return renderComponent(this);
        },
    },
});
/** The jsx function to create elements */
export function jsx(type, props) {
    const element = Object.create(proto);
    element.type = type;
    element.props = props;
    return element;
}
/** Alias jsxs to jsx for compatibility with automatic runtime */
export { jsx as jsxs };
/** Fragment component to group multiple elements */
export function Fragment(props) {
    return props.children;
}
/** Required for "precompile" mode */
export async function jsxTemplate(strings, ...values) {
    let result = strings[0];
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (typeof value === "string") {
            result += value;
        }
        else if (isComponent(value)) {
            result += await renderComponent(value);
        }
        else {
            result += await value;
        }
        result += strings[i + 1];
    }
    return result;
}
/** Required for "precompile" mode: render content */
export async function jsxEscape(content) {
    if (isEmpty(content)) {
        return "";
    }
    if (Array.isArray(content)) {
        return (await Promise.all(content.map(jsxEscape))).join("");
    }
    switch (typeof content) {
        case "string":
            return content
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
        case "object":
            if ("__html" in content) {
                return content.__html ?? "";
            }
            if (isComponent(content)) {
                return await renderComponent(content);
            }
            break;
        case "number":
        case "boolean":
            return content.toString();
    }
    return content;
}
// deno-lint-ignore no-explicit-any
function isComponent(value) {
    return value !== null && typeof value === "object" &&
        value[ssxElement] === true;
}
export async function renderComponent(component) {
    if (Array.isArray(component)) {
        return (await Promise.all(component.map(renderComponent))).join("");
    }
    if (!isComponent(component)) {
        return await jsxEscape(component);
    }
    const { type, props } = component;
    // A Fragment
    if (type === Fragment) {
        return await jsxEscape(props.children);
    }
    // An HTML tag
    if (typeof type === "string") {
        const isVoid = voidElements.has(type);
        const attrs = [type];
        let content = "";
        if (props) {
            for (const [key, val] of Object.entries(props)) {
                if (key === "dangerouslySetInnerHTML") {
                    content = val.__html ?? "";
                    continue;
                }
                if (key === "children") {
                    content = await jsxEscape(val);
                    continue;
                }
                attrs.push(jsxAttr(key, val));
            }
        }
        if (isVoid) {
            if (content) {
                throw new Error(`Void element "${type}" cannot have children`);
            }
            return `<${attrs.join(" ")}>`;
        }
        return `<${attrs.join(" ")}>${content}</${type}>`;
    }
    const comp = await type(props);
    return isEmpty(comp)
        ? ""
        : typeof comp === "string"
            ? comp
            : await renderComponent(comp);
}
/** Required for "precompile" mode: render attributes */
export function jsxAttr(name, value) {
    name = attributes.get(name) ?? name;
    if (name === "style" && typeof value === "object") {
        value = renderStyles(value);
    }
    if (typeof value === "string") {
        return `${name}="${value.replaceAll('"', "&quot;")}"`;
    }
    if (isEmpty(value)) {
        return "";
    }
    if (value === true) {
        return name;
    }
    return `${name}="${value}"`;
}
function renderStyles(properties) {
    return Object.entries(properties)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([name, value]) => `${name}:${value};`)
        .join("");
}
function isEmpty(value) {
    return value == null || value === undefined || value === false;
}
