<template>
    <header
        class="max-w-screen-content px-edge relative isolate mx-auto flex w-full items-center justify-between gap-2 pt-8"
    >
        <h1>
            <Link route="home" class="text-2xl font-semibold tracking-tight">
                <span class="sr-only">{{ $t('app.title') }}</span>
                <i-app-media-kraken class="h-16 w-12" />
            </Link>
        </h1>
        <AppHeaderSearch />
        <div class="grow" />
        <AppHeaderNav />
        <ErrorLogs />
        <Account />
    </header>
</template>
