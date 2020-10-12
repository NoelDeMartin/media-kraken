import Migration from './Migration';

const requireMigration = require.context('@/migrations/scripts', false, /\.ts$/);
const migrations: Migration[] = [];

for (const fileName of requireMigration.keys()) {
    const name = fileName.match(/^(?:\.\/)?(.+)\.ts$/)![1];

    if (typeof name !== 'undefined')
        migrations.push(new Migration(name, requireMigration(fileName).default));
}

export default migrations;
