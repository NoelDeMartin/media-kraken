# Documentation

## Data schema

| Prefix     | Url                                     | Documentation                          |
| ---------- | --------------------------------------- | ------------------------------------ |
| ldp        | http://www.w3.org/ns/ldp#               | https://www.w3.org/ns/ldp            |
| purl       | http://purl.org/dc/terms/               | http://purl.org/dc/terms             |
| schema     | https://schema.org/                     | https://schema.org                   |

![Data schema](Classes.jpg)

One `MediaContainer` will be added to the [Type Registry](https://github.com/solid/solid/blob/master/proposals/data-discovery.md#type-index-registry) as a container of `schema:Movie` instances. If such declaration already existed on the registry, that one will be used instead of creating a new one.
