import * as Index from '../index';
import Instrumentation from '../src/instrumentation';
import Span from '../src/opentelemetry/span';
import * as Types from '../types/instrumentation.types';

test('index exports', () => {
    expect(Index.Instrumentation).toBe(Instrumentation);
    expect(Index.Span).toBe(Span);
    expect(Index.SpanArtifact).toBe(Types.SpanArtifact);
    expect(Index.Spanner).toBe(Types.Spanner);
    expect(Index.TELEMETRY).toBe(Types.TELEMETRY);
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
