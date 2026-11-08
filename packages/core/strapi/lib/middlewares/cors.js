'use strict';

const { defaultsDeep } = require('lodash/fp');
const cors = require('@koa/cors');

const defaults = {
  origin: '*',
  maxAge: 31536000,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  keepHeadersOnError: false,
};

/**
 * @type {import('./').MiddlewareFactory}
 */
module.exports = config => {
  const {
    origin,
    expose,
    maxAge,
    credentials,
    methods,
    headers,
    keepHeadersOnError,
  } = defaultsDeep(defaults, config);

  return cors({
    async origin(ctx) {
      const requestOrigin = ctx.get('Origin');

      if (!requestOrigin) {
        return '*';
      }

      let originList;

      if (typeof origin === 'function') {
        originList = await origin(ctx);
      } else {
        originList = origin;
      }

      // Handle arrays of origins
      if (Array.isArray(originList)) {
        return originList.includes(requestOrigin) ? requestOrigin : '';
      }

      // Handle comma-separated string of origins
      const parsedOrigin = originList.split(',').map(origin => origin.trim());
      if (parsedOrigin.length > 1) {
        return parsedOrigin.includes(requestOrigin) ? requestOrigin : '';
      }

      // Handle string of one origin with exact match (protocol, subdomain, domain, and port)
      if (typeof originList === 'string') {
        return originList === requestOrigin ? requestOrigin : '';
      }

      // block the request
      return '';
    },
    exposeHeaders: expose,
    maxAge,
    credentials,
    allowMethods: methods,
    allowHeaders: headers,
    keepHeadersOnError,
  });
};
