import * as Index from '../index';
import Instrumentation from '../src/instrumentation';

test('index exports', () => {
    expect(typeof Index.Instrumentation).toBe(typeof Instrumentation);
});

test('index scope', () => {
    expect(Object.keys(Index).sort()).toEqual([
        'Instrumentation'
    ].sort())
});
