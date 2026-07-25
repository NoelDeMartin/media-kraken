<template>
    <div
        class="border-primary-400 bg-primary-50 dark:bg-primary-950/30 relative rounded-lg border-2 border-dashed p-8 text-center"
    >
        <h2 class="text-3xl font-bold">Welcome to your new app</h2>
        <Markdown class="mx-auto">This is just some boilerplate, edit me in `src/components/Welcome.vue`.</Markdown>
        <div class="mt-4 flex justify-center gap-4">
            <Button href="https://aerogel.js.org/guide/">Read the Docs</Button>
            <Button href="https://github.com/noeldemartin/aerogel" variant="secondary">
                <i-mdi-github class="size-4" />
                GitHub
            </Button>
        </div>
    </div>
</template>
