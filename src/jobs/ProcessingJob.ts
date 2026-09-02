import { range, required } from '@noeldemartin/utils';
import { Job, type JobStatus } from 'soukai-bis';

export interface ProcessingJobStatus extends JobStatus {
    children: { completed: boolean }[];
}

export default abstract class ProcessingJob<TItem, TResult = void> extends Job<TResult, TResult, ProcessingJobStatus> {
    constructor(protected readonly items: TItem[]) {
        super();
    }

    protected async markItemCompleted(index: number): Promise<void> {
        await this.updateProgress((status) => (required(status.children[index]).completed = true));
    }

    protected override getInitialStatus(): ProcessingJobStatus {
        return {
            completed: false,
            children: range(this.items.length).map(() => ({ completed: false })),
        };
    }
}
