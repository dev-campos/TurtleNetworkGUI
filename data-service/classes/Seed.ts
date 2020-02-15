import { Adapter } from '@turtlenetwork/signature-adapter';
import { seedUtils } from '@turtlenetwork/waves-transactions';

Adapter.initOptions({ networkCode: (window as any).WavesApp.network.code.charCodeAt(0) });
export const Seed = seedUtils.Seed;
