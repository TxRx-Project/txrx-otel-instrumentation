import Instrumentation from '../../src/instrumentation';
import { Spanner, TELEMETRY } from '../../types/instrumentation.types';
import { NodeSDK } from '@opentelemetry/sdk-node';
import Span from '../../src/opentelemetry/span';
import { Span as SpanImpl } from '@opentelemetry/sdk-trace-base'

describe('The Instrumentation Facade', () => {
    let sdkStartSpy: jest.SpyInstance;
    let instrumentationStartSpy: jest.SpyInstance;
    let activateSpy: jest.SpyInstance;
    let originalActivate = Instrumentation.activate.bind(null);

    beforeEach(() => {
        originalActivate();

        instrumentationStartSpy = jest.spyOn(Instrumentation, 'start');
        sdkStartSpy = jest.spyOn(NodeSDK.prototype, 'start');
        activateSpy = jest.spyOn(Instrumentation, 'activate').mockImplementation(args => {
            return originalActivate(args);
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should start the opentelemetry sdk', async () => {
        Instrumentation.start({
            serviceName: 'test-service',
            serviceVersion: '1.0.0',
            mode: TELEMETRY.CONSOLE,
        });

        expect(sdkStartSpy).toHaveBeenCalledTimes(1);
    });

    it('should not start the sdk again', async () => {
        Instrumentation.start({
            serviceName: 'test-service',
            serviceVersion: '1.0.0',
            mode: TELEMETRY.CONSOLE,
        });

        expect(sdkStartSpy).toHaveBeenCalledTimes(0);
    });

    it('should initiate a new span for a service', async () => {
        const span = Instrumentation.service({
            serviceName: 'test-service',
            serviceVersion: '1.0.0',
            mode: TELEMETRY.CONSOLE,
        });

        expect(span).toBeInstanceOf(Span);
        expect(span.attributes()).toEqual({});
        expect(span.name()).toEqual('srv:test-service');
        expect(span.kind()).toEqual(Spanner.SERVER);
        expect(span.parent()).toBeUndefined();
        expect(span.propagation()).toBeUndefined();

        expect(activateSpy).toHaveBeenCalledWith(span);
        expect(instrumentationStartSpy).toHaveBeenCalledTimes(1);
        expect(sdkStartSpy).toHaveBeenCalledTimes(0);
    });

    it('should initiate a new span for a consumer', async () => {
        const span = Instrumentation.consumer('consumer');

        expect(span).toBeInstanceOf(Span);
        expect(span.attributes()).toEqual({});
        expect(span.name()).toEqual('consumer');
        expect(span.kind()).toEqual(Spanner.CONSUMER);
        expect(span.parent()).toBeUndefined();
        expect(span.propagation()).toBeUndefined();

        expect(activateSpy).toHaveBeenCalledTimes(0);
        expect(instrumentationStartSpy).toHaveBeenCalledTimes(0);
        expect(sdkStartSpy).toHaveBeenCalledTimes(0);
    });

    it('should initiate a new span for a consumer with parent', async () => {
        const parent = Instrumentation.consumer('parent');
        const span = Instrumentation.consumer('consumer', parent);

        expect(span).toBeInstanceOf(Span);
        expect(span.attributes()).toEqual({});
        expect(span.name()).toEqual('consumer');
        expect(span.kind()).toEqual(Spanner.CONSUMER);
        expect(span.parent()).toBe(parent);
        expect(span.propagation()).toBeUndefined();

        expect(activateSpy).toHaveBeenCalledTimes(0);
        expect(instrumentationStartSpy).toHaveBeenCalledTimes(0);
        expect(sdkStartSpy).toHaveBeenCalledTimes(0);
    });

    it('should initiate a new span for a consumer with propagation', async () => {
        const parent = Instrumentation.consumer('parent');
        const propagation = Instrumentation.propagate(parent);
        const span = Instrumentation.consumer('consumer', propagation);

        expect(span).toBeInstanceOf(Span);
        expect(span.attributes()).toEqual({});
        expect(span.name()).toEqual('consumer');
        expect(span.kind()).toEqual(Spanner.CONSUMER);
        expect(span.parent()).toBeUndefined();
        expect(span.propagation()).toBe(propagation);

        expect(activateSpy).toHaveBeenCalledTimes(0);
        expect(instrumentationStartSpy).toHaveBeenCalledTimes(0);
        expect(sdkStartSpy).toHaveBeenCalledTimes(0);
    });

    it('should initiate a new span for a consumer with parent from active span', async () => {
        const parent = Instrumentation.consumer('parent');
        Instrumentation.activate(parent);

        const span = Instrumentation.consumer('consumer');

        expect(span).toBeInstanceOf(Span);
        expect(span.attributes()).toEqual({});
        expect(span.name()).toEqual('consumer');
        expect(span.kind()).toEqual(Spanner.CONSUMER);
        expect(span.parent()).toEqual(parent);
        expect(span.propagation()).toBeUndefined();

        expect(activateSpy).toHaveBeenCalledTimes(1);
        expect(instrumentationStartSpy).toHaveBeenCalledTimes(0);
        expect(sdkStartSpy).toHaveBeenCalledTimes(0);
    });

    it('should initiate a new span for a producer', async () => {
        const span = Instrumentation.producer('producer');

        expect(span).toBeInstanceOf(Span);
        expect(span.attributes()).toEqual({});
        expect(span.name()).toEqual('producer');
        expect(span.kind()).toEqual(Spanner.PRODUCER);
        expect(span.parent()).toBeUndefined();
        expect(span.propagation()).toBeUndefined();

        expect(activateSpy).toHaveBeenCalledTimes(0);
        expect(instrumentationStartSpy).toHaveBeenCalledTimes(0);
        expect(sdkStartSpy).toHaveBeenCalledTimes(0);
    });

    it('should initiate a new span for a producer with parent', async () => {
        const parent = Instrumentation.producer('parent');
        const span = Instrumentation.producer('producer', parent);

        expect(span).toBeInstanceOf(Span);
        expect(span.attributes()).toEqual({});
        expect(span.name()).toEqual('producer');
        expect(span.kind()).toEqual(Spanner.PRODUCER);
        expect(span.parent()).toBe(parent);
        expect(span.propagation()).toBeUndefined();

        expect(activateSpy).toHaveBeenCalledTimes(0);
        expect(instrumentationStartSpy).toHaveBeenCalledTimes(0);
        expect(sdkStartSpy).toHaveBeenCalledTimes(0);
    });

    it('should initiate a new span for a producer with propagation', async () => {
        const parent = Instrumentation.producer('parent');
        const propagation = Instrumentation.propagate(parent);
        const span = Instrumentation.producer('producer', propagation);

        expect(span).toBeInstanceOf(Span);
        expect(span.attributes()).toEqual({});
        expect(span.name()).toEqual('producer');
        expect(span.kind()).toEqual(Spanner.PRODUCER);
        expect(span.parent()).toBeUndefined();
        expect(span.propagation()).toBe(propagation);

        expect(activateSpy).toHaveBeenCalledTimes(0);
        expect(instrumentationStartSpy).toHaveBeenCalledTimes(0);
        expect(sdkStartSpy).toHaveBeenCalledTimes(0);
    });

    it('should initiate a new span for a producer with parent from active span', async () => {
        const parent = Instrumentation.producer('parent');
        Instrumentation.activate(parent);

        const span = Instrumentation.producer('producer');

        expect(span).toBeInstanceOf(Span);
        expect(span.attributes()).toEqual({});
        expect(span.name()).toEqual('producer');
        expect(span.kind()).toEqual(Spanner.PRODUCER);
        expect(span.parent()).toEqual(parent);
        expect(span.propagation()).toBeUndefined();

        expect(activateSpy).toHaveBeenCalledTimes(1);
        expect(instrumentationStartSpy).toHaveBeenCalledTimes(0);
        expect(sdkStartSpy).toHaveBeenCalledTimes(0);
    });

    it('should close the span', async() => {
        const span = Instrumentation.producer('producer');
        span.attr('test', 'value');
        span.attr('foo', 'bar');

        expect(span.get().isRecording()).toBeTruthy();

        Instrumentation.end(span);

        const spanImpl = span.get() as unknown as SpanImpl;

        expect(spanImpl.attributes).toEqual({
            foo: 'bar',
            test: 'value',
        });

        expect(span.get().isRecording()).toBeFalsy();
    });
});
