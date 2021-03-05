import serverCookies from 'cookies'; // server-side cookie

/**
 * client-side cookie
 */
export function cookies(doc: Document | string) {
  if (!doc) doc = {} as Document;
  if (typeof doc === 'string') doc = { cookie: doc } as Document;
  if (doc.cookie === undefined) doc.cookie = '';

  return {
    get(key: string) {
      const splat = (doc as Document).cookie.split(/;\s*/);
      for (let i = 0; i < splat.length; i++) {
        const ps = splat[i].split('=');
        const k = unescape(ps[0]);
        if (k === key) return unescape(ps[1]);
      }
      return undefined;
    },
    set: function (
      key: string,
      value: string,
      opts: {
        path?: string;
        domain?: string;
        expires?: Date;
        maxAge?: number;
        samesite?: 'none' | 'lax' | 'strict';
        secure?: boolean;
      } = {},
    ) {
      let s = escape(key) + '=' + escape(value);
      if (opts.path) s += '; path=' + escape(opts.path);
      if (opts.domain) s += '; domain=' + escape(opts.domain);
      if (opts.expires) s += '; expires=' + opts.expires.toUTCString();
      if (opts.maxAge) s += '; max-age=' + opts.maxAge;
      if (opts.samesite) s += '; samesite=' + opts.samesite;
      if (opts.secure) s += '; secure';
      (doc as Document).cookie = s;
      return s;
    },
  };
}

export default {
  clientCookie: (() => {
    let clientCookie: ReturnType<typeof cookies> = { get: () => undefined, set: () => '' };
    if (typeof document !== 'undefined') {
      clientCookie = cookies(document);
    }
    return clientCookie;
  })(),
  serverCookie: serverCookies,
};
