import Vue, { Component, AsyncComponent } from 'vue';
import { hasOwn } from '@vue-async/utils';

const globalLayoutArgs: {
  layouts: Dictionary<Component | AsyncComponent>;
  templates: Dictionary<Component | AsyncComponent>;
} = Vue.observable({
  layouts: {},
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
export function getLayout(name: string) {
  if (!hasLayout(name)) return;
  return globalLayoutArgs.layouts[name];
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 获取所有布局
 */
export function getLayouts() {
  return globalLayoutArgs.layouts;
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
  globalLayoutArgs.layouts[name] = layout;
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
export function getTemplate(name: string) {
  if (!hasTemplate(name)) return;
  return globalLayoutArgs.templates[name];
}

/**
 * @author Hubert
 * @since 2020-09-04
 * @version 0.0.1
 * 获取所有模版
 */
export function getTemplates() {
  return globalLayoutArgs.templates;
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
  globalLayoutArgs.templates[name] = template;
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
