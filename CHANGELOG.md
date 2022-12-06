# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.1.13](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.13) - 2022-12-06

### Changed

- [Christmas attire](https://github.com/NoelDeMartin/media-kraken/tree/v0.1.13/src/assets/icons/media-kraken.svg).

### Fixed

- Aspect ratio in profile picture and IMDb casing, by [@veyndan](https://github.com/veyndan).

## [v0.1.12](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.12) - 2022-01-07

### Changed

- Removed Christmas attire.

## [v0.1.11](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.11) - 2021-12-06

### Changed

- [Christmas attire](https://github.com/NoelDeMartin/media-kraken/tree/v0.1.11/src/assets/icons/media-kraken.svg).

### Fixed

- Error handling (authorization errors were not communicated properly).

## [v0.1.10](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.10) - 2021-09-04

### Fixed

- [#14](https://github.com/NoelDeMartin/media-kraken/issues/14) Compatibility with [Community Solid Server](https://github.com/solid/community-server).

## [v0.1.9](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.9) - 2021-03-28

### Changed

- [#11](https://github.com/NoelDeMartin/media-kraken/issues/11) Improved handling of unauthorized error codes.

### Fixed

- Actions menu on collection page (clicking the button would not show the menu).

## [v0.1.8](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.8) - 2021-01-30

### Added

- [#7](https://github.com/NoelDeMartin/media-kraken/issues/7) Collections viewer.

## [v0.1.7](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.7) - 2021-01-25

### Added

- Reading `vcard` properties from profile (name & avatar).

### Changed

- [#9](https://github.com/NoelDeMartin/media-kraken/issues/9) Authentication has been refactored to support logging in with DPoP.
- `soukai` dependency has been updated to 0.4.1.
- `soukai-solid` dependency has been updated to 0.4.1.

### Fixed

- [#10](https://github.com/NoelDeMartin/media-kraken/issues/10) TransactionInactiveError (safari-only bug).

## [v0.1.6](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.6) - 2021-01-07

### Changed

- Removed christmas attire.

## [v0.1.5](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.1.5) - 2020-12-18

### Changed

- [robots.txt](https://github.com/NoelDeMartin/media-kraken/tree/v0.1.5/public/robots.txt) to allow anywhere (crawlers cannot access private data without authentication anyways).
- [Christmas attire](https://github.com/NoelDeMartin/media-kraken/tree/v0.1.5/src/assets/icons/media-kraken.svg).

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
- Improved IMDb import (detect mobile urls, and ignore non-movie urls).
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
