<template>
    <nav class="relative overflow-hidden transition-all focus-within:pb-20">
        <span class="opacity-0">My Collection</span>
        <ul class="absolute inset-y-0 left-0">
            <li><Link route="movies.index">My Movies</Link></li>
            <li><Link route="shows.index">My Shows</Link></li>
        </ul>
    </nav>
</template>
