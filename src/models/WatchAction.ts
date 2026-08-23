import Model from './WatchAction.schema';

export default class WatchAction extends Model {
    public static ldpResource = false;
}

(globalThis as Record<string, unknown>).WatchAction = WatchAction;
