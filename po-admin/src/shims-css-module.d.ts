// @nuxt/webpack css-loader resourceQuery: /module/
declare module '*.less?module' {
  const content: { [className: string]: string };
  export default content;
}
