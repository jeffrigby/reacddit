declare module 'url-regex-safe' {
  interface UrlRegexOptions {
    exact?: boolean;
    strict?: boolean;
  }

  function urlRegex(options?: UrlRegexOptions): RegExp;

  export = urlRegex;
}
