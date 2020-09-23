import Vue, { Component, AsyncComponent } from 'vue';
import { hasOwn } from '@vue-async/utils';

// Types
import { Widget } from 'types/functions/widget';

export const globalLayoutArgs: {
  layouts: Dictionary<Component | AsyncComponent>;
  widgets: Dictionary<Widget[]>;
  templates: Dictionary<Component | AsyncComponent>;
} = Vue.observable({
  layouts: {},
  widgets: {},
  templates: {},
});

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 是否在在布局
 */
export function hasLayout(name: string) {
  return hasOwn(globalLayoutArgs.layouts, name);
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 获取布局
 */
export function getLayouts(): Record<string, Component | AsyncComponent>;
export function getLayouts(name: string): Component | AsyncComponent | null;
export function getLayouts(name?: string) {
  if (name) {
    return hasLayout(name) ? globalLayoutArgs.layouts[name] : null;
  } else {
    return globalLayoutArgs.layouts;
  }
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 添加布局
 * replace 为 false 时，如而已已在在，则返回 false。否则 undefined
 */
export function addLayout(name: string, layout: Component | AsyncComponent, replace = true) {
  if (hasLayout(name) && !replace) return false;
  return (globalLayoutArgs.layouts[name] = layout);
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 添加多个布局
 */
export function addLayouts(layouts: Record<string, Component | AsyncComponent>, replace = true) {
  Object.keys(layouts).forEach((name: string) => addLayout(name, layouts[name], replace));
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 是否在在小部件
 */
export function hasWidget(placement: string) {
  return hasOwn(globalLayoutArgs.widgets, placement) && globalLayoutArgs.widgets[placement].length;
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 获取小部件
 */
export function getWidgets(): Record<string, Widget[]>;
export function getWidgets(placement: string): Widget[];
export function getWidgets(placement?: string) {
  if (placement) {
    return hasWidget(placement) ? globalLayoutArgs.widgets[placement] : [];
  } else {
    return globalLayoutArgs.widgets;
  }
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 添加小部件
 */
export function addWidgets(placement: string, widgets: Widget | Widget[]) {
  globalLayoutArgs.widgets[placement] = (globalLayoutArgs.widgets[placement] || []).concat(widgets);
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 是否在在模版
 */
export function hasTemplate(name: string) {
  return hasOwn(globalLayoutArgs.templates, name);
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 获取模版
 */
export function getTemplates(): Record<string, Component | AsyncComponent>;
export function getTemplates(name: string): Component | AsyncComponent | null;
export function getTemplates(name?: string) {
  if (name) {
    return hasTemplate(name) ? globalLayoutArgs.templates[name] : null;
  } else {
    return globalLayoutArgs.templates;
  }
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 添加模版
 * replace 为 false 时，如而已已在在，则返回 false。否则 undefined
 */
export function addTemplate(name: string, template: Component | AsyncComponent, replace = true) {
  if (hasLayout(name) && !replace) return false;
  return (globalLayoutArgs.templates[name] = template);
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 添加多个模版
 */
export function addTemplates(templates: Record<string, Component | AsyncComponent>, replace = true) {
  Object.keys(templates).forEach((name: string) => addTemplate(name, templates[name], replace));
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 移除模版
 */
export function removeTemplates(names: string | string[]) {
  if (typeof names === 'string') {
    names = [names];
  }
  names.forEach((name: string) => {
    if (hasTemplate(name)) {
      delete globalLayoutArgs.templates[name];
    }
  });
}
