import Span from '../../../src/opentelemetry/span';
import { Spanner } from '../../../types/instrumentation.types';

describe('The Span Proxy class', () => {
    it('should construct a span instance', async () => {
        const span = new Span({
            name: 'test-span',
            kind: Spanner.SERVER,
        });

        expect(span).toBeInstanceOf(Span);
        expect(span.kind()).toBe(Spanner.SERVER);
        expect(span.name()).toBe('test-span');
    });

    it('should be able to manipulate its attributes', async () => {
        const span = new Span({
            name: 'test-span',
            kind: Spanner.CONSUMER,
        });

        span.attr('foo', 'bar');
        
        expect(span.attributes()).toEqual({
            foo: 'bar',
        });

        span.attr({
            foo: 'baz',
            test: 'value'
        });

        expect(span.attributes()).toEqual({
            foo: 'baz',
            test: 'value',
        });
    });

    it('should be able to update its name', async () => {
        const span = new Span({
            name: 'test-span',
            kind: Spanner.PRODUCER,
        });

        expect(span.name()).toBe('test-span');

        span.updateName('span-test');

        expect(span.name()).toBe('span-test');
    });
});
