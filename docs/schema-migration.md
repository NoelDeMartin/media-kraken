# Schema Migration

Before version 0.1.4, the data created with Media Kraken did not follow some best practices. There wasn't anything inherently wrong with the structure, but [the closing of solid.community](https://gitlab.com/solid.community/proposals/-/issues/16) surfaced some issues that could have been avoided following a different approach.

Starting in version 0.1.4, when Media Kraken boots up it will detect the legacy schema and ask for confirmation to migrate it. The technical details of this migration process are outlined below. If you didn't tinker with the data that Media Kraken created in your POD, this should update the format of your data and you'll be able to continue using the app as usual.

If you were using Media Kraken with `solid.community`, it's likely that it stopped working when the domain changed to [solidcommunity.net](https://solidcommunity.net/). If you log in again using version 0.1.4 or newer, this should be fixed.

Even if you weren't using `solid.community`, it is recommended that you run the migration script or migrate the data yourself.

If you face any problems during the migration process, please [report the problem](https://github.com/NoelDeMartin/media-kraken/issues/new).

## Technical details

The main problem was that documents were created using absolute urls. Because of that, after moving the documents between domains they were no longer valid.

For example, a movie document would have been created like this:

```turtle
<https://example.solid.community/movies/the-lord-of-the-rings-the-two-towers-2002>
    a <https://schema.org/Movie> ;
    <https://schema.org/name> "The Lord of the Rings: The Two Towers" .

<https://example.solid.community/movies/the-lord-of-the-rings-the-two-towers-2002#ea74765d-2a74-4b0e-952f-3e5c8f3ec234>
    a <https://schema.org/WatchAction> ;
    <https://schema.org/object> <https://example.solid.community/movies/the-lord-of-the-rings-the-two-towers-2002> .
```

A better approach is to use relative references instead, that way documents can be moved between domains without breaking the links.

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

In essence, those are the only two significant changes. The migration script will go through the movies collection and update all the documents.

Something else that the migration script fixes is the format of the meta document describing the container. This one does not have any practical implications, but it's also important for correctness.

Here's an example of a meta document created in previous versions:

```turtle
<https://example.solid.community/movies/>
    <http://www.w3.org/2000/01/rdf-schema#label> "Movies" ;
    <http://purl.org/dc/terms/created> "2020-03-08T14:33:09Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
    <http://purl.org/dc/terms/modified> "2020-03-08T14:33:09Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
    a <http://www.w3.org/ns/ldp#Container> .
```

Besides the issues we've already discussed, there are some additional problems here. There is a couple of properties that shouldn't be defined here, in particular the `purl:modified` and the `ldp:Container` type. The reason why these should be excluded from this meta document is that those are added by the POD server when the container is read (in the same way that `ldp:contains` properties are to send the list of contained documents).

Keeping that in mind, this is what a fixed meta document should contain:

```turtle
<>
    <http://www.w3.org/2000/01/rdf-schema#label> "Movies" ;
    <http://purl.org/dc/terms/created> "2020-03-08T14:33:09Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
```

Notice how this time, we're not referencing the main resources with a hash. For containers, this is the proper way to do it.
