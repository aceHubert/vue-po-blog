// @ts-ignore
import client from 'webpack-theme-color-replacer/client';
import generate from '@ant-design/colors/lib/generate';

export const themeColor = {
  getAntdSerials(color: string) {
    // 淡化（即less的tint）
    const lightens = new Array(9).fill(null).map((t, i) => {
      return client.varyColor.lighten(color, i / 10);
    });
    // colorPalette 变换得到颜色值
    const colorPalettes = generate(color);
    const rgb = client.varyColor.toNum3(color.replace('#', '')).join(',');
    return lightens.concat(colorPalettes).concat(rgb);
  },
  changeColor(newColor: string) {
    const options = {
      newColors: this.getAntdSerials(newColor), // new colors array, one-to-one corresponde with `matchColors`
      changeUrl(cssUrl: string) {
        return `/${cssUrl}`; // while router is not `hash` mode, it needs absolute path
      },
    };
    return client.changer.changeColor(options, Promise);
  },
};

export const updateTheme = (newPrimaryColor: string) => {
  return themeColor.changeColor(newPrimaryColor);
};

export const updateColorWeak = (colorWeak: boolean) => {
  // document.body.className = colorWeak ? 'colorWeak' : '';
  const app = document.body.querySelector('#app') || document.body.querySelector('__next') || document.body;
  colorWeak ? app.classList.add('colorWeak') : app.classList.remove('colorWeak');
};
