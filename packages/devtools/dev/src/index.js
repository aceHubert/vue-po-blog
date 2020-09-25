export default function (Vue, opts) {
  opts.addRoutes([
    {
      path: '',
      name: 'index',
      component: {
        render(h) {
          return h('div', [h('h1', 'plumemo devtools'), this.$slots.default]);
        },
      },
    },
  ]);
}
