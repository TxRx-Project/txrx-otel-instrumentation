import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import OpenTelemetry from '../../src/opentelemetry';
import { Spanner, TELEMETRY } from '../../types/instrumentation.types';
import * as OtelSDK from '@opentelemetry/sdk-node';
import * as OtelMetrics from '@opentelemetry/sdk-metrics';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import * as OtelExporterMetricsProto from '@opentelemetry/exporter-metrics-otlp-proto';
import * as OtelExportTraceProto from '@opentelemetry/exporter-trace-otlp-proto';
import { Span as SpanImpl } from '@opentelemetry/sdk-trace-base'
import Span from '../../src/opentelemetry/span';

jest.mock('@opentelemetry/sdk-node', () => {
    return {
      __esModule: true,
      ...jest.requireActual('@opentelemetry/sdk-node'),
      NodeSDK: () => jest.fn,
    };
});

jest.mock('@opentelemetry/sdk-metrics', () => {
    return {
      __esModule: true,
      ...jest.requireActual('@opentelemetry/sdk-metrics'),
      PeriodicExportingMetricReader: () => jest.fn,
    };
});

jest.mock('@opentelemetry/exporter-metrics-otlp-proto', () => {
    return {
      __esModule: true,
      ...jest.requireActual('@opentelemetry/exporter-metrics-otlp-proto'),
      OTLPMetricExporter: () => jest.fn,
    };
});

jest.mock('@opentelemetry/exporter-trace-otlp-proto', () => {
    return {
      __esModule: true,
      ...jest.requireActual('@opentelemetry/exporter-trace-otlp-proto'),
      OTLPTraceExporter: () => jest.fn,
    };
});
  
describe('The OpenTelemetry class', () => {
    let sdkConstructorSpy: jest.SpyInstance;
    let metricReaderConstructorSpy: jest.SpyInstance;
    let traceExporterConstructorSpy: jest.SpyInstance;
    let metricsExporterConstructorSpy: jest.SpyInstance;
    let consoleDebugSpy: jest.SpyInstance;

    const sdkSpies = {
        start: jest.fn(),
    };

    beforeEach(() => {
        sdkConstructorSpy = jest.spyOn(OtelSDK, 'NodeSDK').mockImplementation((): any => {
            return sdkSpies;
        });

        metricReaderConstructorSpy = jest.spyOn(OtelMetrics, 'PeriodicExportingMetricReader');
        traceExporterConstructorSpy = jest.spyOn(OtelExportTraceProto, 'OTLPTraceExporter');
        metricsExporterConstructorSpy = jest.spyOn(OtelExporterMetricsProto, 'OTLPMetricExporter');
        consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
    
    it('should construct a console mode instance', async () => {
        const config = {
            serviceName: 'console-service',
            serviceVersion: '1.0.0',
            mode: TELEMETRY.CONSOLE,
        };

        const otel = new OpenTelemetry(config);

        expect(otel).toBeInstanceOf(OpenTelemetry);

        const args = sdkConstructorSpy.mock.calls[0][0];

        expect((args.resource as Resource).attributes).toEqual({
            [SEMRESATTRS_SERVICE_NAME]: config.serviceName,
            [SEMRESATTRS_SERVICE_VERSION]: config.serviceVersion,
        });

        expect(args.traceExporter).toBeInstanceOf(ConsoleSpanExporter);

        const metricReaderArgs = metricReaderConstructorSpy.mock.calls[0][0];

        expect(metricReaderArgs.exporter).toBeInstanceOf(OtelMetrics.ConsoleMetricExporter);
    });

    it('should construct a exported mode instance', async () => {
        const config = {
            serviceName: 'exported-service',
            serviceVersion: '1.0.0',
            mode: TELEMETRY.EXPORTED,
            otlp: {
                metrics: 'http://otelcol:4318/v1/metrics',
                traces: 'http://otelcol:4318/v1/traces',
            },
        };

        const otel = new OpenTelemetry(config);

        expect(otel).toBeInstanceOf(OpenTelemetry);

        const args = sdkConstructorSpy.mock.calls[0][0];

        expect((args.resource as Resource).attributes).toEqual({
            [SEMRESATTRS_SERVICE_NAME]: config.serviceName,
            [SEMRESATTRS_SERVICE_VERSION]: config.serviceVersion,
        });

        expect(args.traceExporter).toBeInstanceOf(OtelExportTraceProto.OTLPTraceExporter);

        const traceExporterArgs = traceExporterConstructorSpy.mock.calls[0][0];

        expect(traceExporterArgs).toEqual({
            url: config.otlp.traces,
            headers: {},
        });

        expect(args.metricReader).toBeInstanceOf(OtelMetrics.PeriodicExportingMetricReader);

        const metricReaderArgs = metricReaderConstructorSpy.mock.calls[0][0];

        expect(metricReaderArgs.exporter).toBeInstanceOf(OtelExporterMetricsProto.OTLPMetricExporter);

        const metricExporterArgs = metricsExporterConstructorSpy.mock.calls[0][0];

        expect(metricExporterArgs).toEqual({
            url: config.otlp.metrics,
            headers: {},
        })
    });

    it('should construct a notel mode instance', async () => {
        const config = {
            serviceName: 'notel-service',
            serviceVersion: '1.0.0',
            mode: TELEMETRY.NOTEL,
        };

        const otel = new OpenTelemetry(config);

        expect(otel).toBeInstanceOf(OpenTelemetry);

        expect(sdkConstructorSpy).toHaveBeenCalledTimes(0);

        expect(consoleDebugSpy).toHaveBeenCalledWith(`NOTEL for ${config.serviceName} ${config.serviceVersion}`);
    });

    it('should start the sdk in console mode', async() => {
        const config = {
            serviceName: 'console-service',
            serviceVersion: '1.0.0',
            mode: TELEMETRY.CONSOLE,
        };

        const otel = new OpenTelemetry(config);
        otel.start();

        expect(sdkSpies.start).toHaveBeenCalledTimes(1);
    });

    it('should start the sdk in exported mode', async() => {
        const config = {
            serviceName: 'exported-service',
            serviceVersion: '1.0.0',
            mode: TELEMETRY.EXPORTED,
            otlp: {
                metrics: 'http://otelcol:4318/v1/metrics',
                traces: 'http://otelcol:4318/v1/traces',
            },
        };

        const otel = new OpenTelemetry(config);
        otel.start();

        expect(sdkSpies.start).toHaveBeenCalledTimes(1);
    });

    it('should not start the sdk in notel mode', async() => {
        const config = {
            serviceName: 'notel-service',
            serviceVersion: '1.0.0',
            mode: TELEMETRY.NOTEL,
        };

        const otel = new OpenTelemetry(config);
        otel.start();

        expect(sdkSpies.start).toHaveBeenCalledTimes(0);
    });
});
