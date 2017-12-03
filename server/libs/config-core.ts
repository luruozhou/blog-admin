import * as Path from 'path';

//调试输出开关
export let isDebugMode = true;

export let debugLogDir = Path.join(process.cwd(), './log/debug-logs/');

//debug日志有效时间为一周
export let debugLogExpireLimit = 7 * 24 * 60 * 60 * 1000;