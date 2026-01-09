/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("/media-kraken/workbox-v4.3.1/workbox-sw.js");
workbox.setConfig({modulePathPrefix: "/media-kraken/workbox-v4.3.1"});

importScripts(
  "/media-kraken/precache-manifest.f090986834a275a8391fae0c5512ce31.js"
);

workbox.core.setCacheNameDetails({prefix: "media-kraken"});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/^https:\/\/noeldemartin\.github\.io\/media-kraken\/$/, new workbox.strategies.NetworkFirst(), 'GET');
workbox.routing.registerRoute(/^https:\/\/noeldemartin\.github\.io\/media-kraken\/.*/, new workbox.strategies.CacheFirst(), 'GET');
