<template>
    <header class="max-w-screen-content px-edge mx-auto flex w-full items-center justify-between gap-2 pt-8">
        <h1>
            <Link route="home" class="text-2xl font-semibold tracking-tight">
                {{ $t('app.title') }}
            </Link>
        </h1>
        <div class="grow" />
        <ErrorLogs />
        <Account />
    </header>
</template>
