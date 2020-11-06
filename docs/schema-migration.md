# Schema Migration

Before version 0.2.0, the data created with Media Kraken did not follow some best practices. There wasn't anything inherently wrong with the structure, but [the closing of solid.community](https://gitlab.com/solid.community/proposals/-/issues/16) surfaced some issues that could have been avoided following a different approach.

Starting in version 0.2.0, when Media Kraken boots up it will detect the legacy schema and ask for confirmation to migrate it. The technical details of this migration process are outlined below. If you didn't tinker with the data that Media Kraken created in your POD, this should update the format of your data and you'll be able to use the app as usual.

If you were using Media Kraken with `solid.community`, it's likely that it stopped working when the domain changed to [solidcommunity.net](https://solidcommunity.net/). If you log in again using version 0.2.0 or newer, this should be fixed.

Even if you weren't using `solid.community`, it is recommended that you run the migration script or migrate the data yourself.

If you face any problems during the migration process, please [report the problem](https://github.com/NoelDeMartin/media-kraken/issues/new).

## Technical details

The main problem was that documents were created using absolute urls. Because of that, after moving the documents between domains they were no longer valid.

For example, a movie document would be something like this:

```turtle
<https://example.solid.community/movies/the-lord-of-the-rings-the-two-towers-2002>
    a <https://schema.org/Movie> ;
    <https://schema.org/name> "The Lord of the Rings: The Two Towers" .

<https://example.solid.community/movies/the-lord-of-the-rings-the-two-towers-2002#ea74765d-2a74-4b0e-952f-3e5c8f3ec234>
    a <https://schema.org/WatchAction> ;
    <https://schema.org/object> <https://example.solid.community/movies/the-lord-of-the-rings-the-two-towers-2002> .
```

A better approach is to use relative references instead, that way documents can be moved around without breaking the links.

An additional issue is that the movie resource had the same url as the document. This is also a bad practice because the document and the movie are different entities, the most common approach is to refer to the main entity of a document using a `#it` hash fragment in the url.

The migration script would transform the document above into this:

```turtle
<#it>
    a <https://schema.org/Movie> ;
    <https://schema.org/name> "The Lord of the Rings: The Two Towers" .

<#ea74765d-2a74-4b0e-952f-3e5c8f3ec234>
    a <https://schema.org/WatchAction> ;
    <https://schema.org/object> <#it> .
```

In essence, those are the only two significant changes. The migration script will go through the movies collection and update all the documents, as well as the container metadata placed on `/movies/.meta` (this one will not use the `#it` pattern).

In order to find out if documents have a legacy structure, some heuristics are employed (you're welcome to [look at the code](https://github.com/NoelDeMartin/media-kraken/blob/main/src/workers/LoadMediaWorker.ts) to see the full story). The only relevant one if you plan to modify the data yourself is that the `purl:modified` value from `/movies/.meta` should be updated to have a posterior date to the [0.2.0 release date](https://github.com/NoelDeMartin/media-kraken/releases/tag/v0.2.0). The reason for this is that a GET request to `/movies/` does not return the contents of the `/movies/.meta` document, so there is no way to know if it had the proper schema or not. An heuristic that's being used is to look at the updated date to avoid making an unnecessary request for the specific `/movies/.meta` document.
