// export const URL_REGEX =
//   /(?:https?:\/\/)?(?:www\.)?[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})+(?:\/[a-zA-Z0-9?=-]{2,})?/g;

export const URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?[a-zA-Z]{1,}(?:\.[a-zA-Z]{2,})+(?:\/[a-zA-Z0-9?\/_.=-]{1,})?/g;

export const TITLE_REGEX = /<title.*?>(.*?)<\/title>/g;

export const CUSTOM_HYPERLINK_REGEX = /\[([^\]]+)\]\([^)]+\)/g;

export const META_TAGS_REGEX =
  /<meta\s+([^>]*(name|property)\s*=\s*["']([^"']*)["'][^>]*)?content\s*=\s*["']([^"']*)["'][^>]*>/gi;

export const TAGS_CONTENT_REGEX = /content="(.*?)"/;

export const TITLE_TAG_REGEX = /<title>(.*?)<\/title>/gi;
