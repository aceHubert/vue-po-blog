export function timeFix() {
  const time = new Date();
  const hour = time.getHours();
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好';
}

/**
 * 触发 window.resize
 */
export function triggerWindowResizeEvent() {
  const event = document.createEvent('HTMLEvents');
  event.initEvent('resize', true, true);
  // @ts-ignore
  event.eventType = 'message';
  window.dispatchEvent(event);
}

export function handleScrollHeader(callback: (direction: 'up' | 'down') => void) {
  let timer: any;

  let beforeScrollTop = window.pageYOffset;
  callback = callback || function () {};
  window.addEventListener(
    'scroll',
    (_event) => {
      timer && clearTimeout(timer);
      timer = setTimeout(() => {
        let direction: 'up' | 'down' = 'up';
        const afterScrollTop = window.pageYOffset;
        const delta = afterScrollTop - beforeScrollTop;
        if (delta === 0) {
          return;
        }
        direction = delta > 0 ? 'down' : 'up';
        callback(direction);
        beforeScrollTop = afterScrollTop;
      }, 50);
    },
    false,
  );
}

/**
 * 是否是IE
 */
export function isIE() {
  const bw = window.navigator.userAgent;
  const compare = (s: string) => bw.indexOf(s) >= 0;
  const ie11 = (() => 'ActiveXObject' in window)();
  return compare('MSIE') || ie11;
}

/**
 * Remove loading animate
 * @param id parent element id or class
 * @param timeout
 */
export function removeLoadingAnimate(id = '', timeout = 1500) {
  if (id === '') {
    return;
  }
  setTimeout(() => {
    const el = document.getElementById(id);
    el && document.body.removeChild(el);
  }, timeout);
}

/**
 * 获取 OverloadedRest 参数
 * <T>(value: Array<T>)
 * <T>(...value:Array<T>)
 * @param overloadedArray
 */
export function getArrayFromOverloadedRest<T>(overloadedArray: Array<T | T[]>): T[] {
  let items: T[];
  if (Array.isArray(overloadedArray[0])) {
    items = overloadedArray[0] as T[];
  } else {
    items = overloadedArray as T[];
  }
  return items;
}
