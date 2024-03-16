import * as Index from '../index';
import Instrumentation from '../src/instrumentation';
import Span from '../src/opentelemetry/span';
import * as Types from '../types/instrumentation.types';

test('index exports', () => {
    expect(typeof Index.Instrumentation).toBe(typeof Instrumentation);
    expect(typeof Index.Span).toBe(typeof Span);
    expect(typeof Index.SpanArtifact).toBe(typeof Types.SpanArtifact);
    expect(typeof Index.Spanner).toBe(typeof Types.Spanner);
    expect(typeof Index.TELEMETRY).toBe(typeof Types.TELEMETRY);
});

test('index scope', () => {
    expect(Object.keys(Index).sort()).toEqual([
        'Instrumentation',
        'Span',
        'SpanArtifact',
        'Spanner',
        'TELEMETRY',
    ].sort())
});
