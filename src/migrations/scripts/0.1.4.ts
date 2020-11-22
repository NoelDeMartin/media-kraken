import ModelsCache from '@/models/ModelsCache';

export default async function migrate(): Promise<void> {
    await ModelsCache.clear();
}
