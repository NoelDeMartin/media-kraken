# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.1.4](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.4) - 2020-11-27

### Added

- New error modals with more debugging information and buttons to get help.
- New hot keys ("c" to visit the collection page, "h" for going home, and "f" for filtering collection items).
- Watched movies can be moved back to "watch later" using the options menu on the movie page.
- Goodfil.ms movies import ([#6](https://github.com/NoelDeMartin/media-kraken/issues/6)).
- Prompt `solid.community` users to use `solidcommunity.net` instead.
- Migration script for Solid users, read more about that in the [Schema Migration docs](https://github.com/NoelDeMartin/media-kraken/tree/v0.1.4/docs/schema-migration.md).

### Changed

- `soukai` dependency has been updated to 0.4.0.
- `soukai-solid` dependency has been updated to 0.4.0.
- Improved IMDB import (detect mobile urls, and ignore non-movie urls).
- Improved error handling overall.

## [v0.1.3](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.3) - 2020-07-24

### Added

- Opt-in error reporting to [Sentry](https://sentry.io/).
- Settings modal to configure animations and error reporting.
- Development deploy at [media-kraken.netlify.com](https://media-kraken.netlify.com).

### Changed

- Service worker caching strategy in index to NetworkFirst.

## [v0.1.2](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.2) - 2020-07-19

### Added

- Progress messages in loading overlay.

## [v0.1.1](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.1) - 2020-07-18

### Changed

- Improved initial loading for large collections.

### Fixed

- Opengraph meta tags.

## [v0.1.0](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.0) - 2020-07-18

### Added

- Everything!
