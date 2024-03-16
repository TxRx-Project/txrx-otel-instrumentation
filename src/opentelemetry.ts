import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import opentelemetry, { Context, SpanKind, Tracer } from '@opentelemetry/api';
import { InstrumentationConfig, Propagation, SpanArtifact, Spannable, Spanner, TELEMETRY } from '../types/instrumentation.types';
import Span from './opentelemetry/span';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

/**
 * A proxy class around the actual opentelemetry {@link NodeSDK}.
 */
export default class OpenTelemetry {
    private sdk: NodeSDK | null;
    private config: InstrumentationConfig;
    
    /**
     * Constructs a new class.
     * 
     * It also instantiates the underlying {@link NodeSDK} according to the configuration,
     * unless a NOTEL value is given, per the {@link TELEMETRY} enum.
     * 
     * @param config - the configuration as specified by the {@link InstrumentationConfig} data structure.
     */
    constructor(config: InstrumentationConfig) {
        this.config = config;

        switch (this.config.mode){
            case TELEMETRY.CONSOLE:
                this.sdk = new NodeSDK({
                    resource: new Resource({
                        [SEMRESATTRS_SERVICE_NAME]: this.config.serviceName,
                        [SEMRESATTRS_SERVICE_VERSION]: this.config.serviceVersion,
                    }),
                    traceExporter: new ConsoleSpanExporter(),
                    metricReader: new PeriodicExportingMetricReader({
                        exporter: new ConsoleMetricExporter(),
                    }),
                });
                break;
            case TELEMETRY.EXPORTED:
                this.sdk = new NodeSDK({
                    resource: new Resource({
                        [SEMRESATTRS_SERVICE_NAME]: this.config.serviceName,
                        [SEMRESATTRS_SERVICE_VERSION]: this.config.serviceVersion,
                    }),
                    traceExporter: new OTLPTraceExporter({
                        url: config.otlp.traces,
                        headers: {},
                    }),
                    metricReader: new PeriodicExportingMetricReader({
                        exporter: new OTLPMetricExporter({
                            url: config.otlp.metrics, 
                            headers: {},
                        }),
                    }),
                });
                break;
            case TELEMETRY.NOTEL:
            default:
                console.debug(`NOTEL for ${this.config.serviceName} ${this.config.serviceVersion}`);
                this.sdk = null;
        }
    }

    /**
     * Proxy mehod for the {@link NodeSDK} class.
     */
    public start() {
        if (this.sdk) {
            this.sdk.start();
        }
    }

    /**
     * Proxy method for the opentelemetry tracer getter.
     *  
     * @returns a {@link Tracer}  
     */

    private tracer(): Tracer {
        return opentelemetry.trace.getTracer(this.config.serviceName, this.config.serviceVersion);
    }

    /**
     * Proxy method for the opentelemetry startSpan method.
     * 
     * This method also resolves the context based on the parent or propagation data
     * attached to the span.
     *
     * @param span - the {@link Span} to be started.
     * @returns an {@link SpanArtifact} instance.
     */
    public startSpan(span: Span): SpanArtifact {
        const tracer = this.tracer();
        const parent = span.parent();
        const kind = this.spanKind(span.kind());
        const propagation = span.propagation();
        const name = span.name();
        let ctx: Context;

        if (parent) {
            const artifact = parent.get();

            if (artifact) {
                ctx = opentelemetry.trace.setSpan(
                    opentelemetry.context.active(),
                    artifact,
                );
            }
        } else if (propagation) {
            ctx = opentelemetry.propagation.extract(opentelemetry.context.active(), propagation);
        }
    
        return tracer.startSpan(name, { kind }, ctx);
    }

    /**
     * Constructs a new span.
     * 
     * This method also constructs and attaches the underlying {@link SpanArtifact} instance.
     * 
     * @param spannable - the definition of the span to be constructed, per the {@link Spannable} specification.
     * @returns the {@link Span} instance.
     */
    public span(spannable: Spannable): Span {
        const span = new Span(spannable);
        const artifact = this.startSpan(span);
        span.attach(artifact);
        return span;
    }   
    
    /**
     * Closes the span.
     *
     * @param span - the {@link Span} to be closed.
     */
    public closeSpan(span: Span) {
        const artifact = (span.get()) as SpanArtifact;
        
        if (artifact) {
            artifact.setAttributes(span.attributes());
            artifact.end();
        }
    }

    /**
     * Proxy method for the opentelemetry propagation inject method.
     *
     * @param span - the {@link Span} to be propagated.
     * @returns the propagation data, as the {@link Propagation} data structure.
     */
    public propagate(span: Span): Propagation {
        const output = {} as Propagation;

        const ctx = opentelemetry.trace.setSpan(
            opentelemetry.context.active(),
            span.get(),
        );

        opentelemetry.propagation.inject(ctx, output);
        return output;
    }

    /**
     * A resolver for the span kind.
     * 
     * From the proxied enum values into the opentelemetry sdk enum values.
     * 
     * @param spanner - the {@link Spanner} value
     * @returns the resolved {@link SpanKind} value
     */
    private spanKind(spanner: Spanner): SpanKind {
        switch(spanner) {
            case Spanner.SERVER:
                return SpanKind.SERVER;
            case Spanner.PRODUCER:
                return SpanKind.PRODUCER;
            case Spanner.CONSUMER:
                return SpanKind.CONSUMER;
        }
    }
}