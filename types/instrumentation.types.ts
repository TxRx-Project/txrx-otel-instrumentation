import { Span as OTelSpan } from '@opentelemetry/api';
import Span from '../src/opentelemetry/span';

/**
 * Choices for telemetry support.
 * 
 * - CONSOLE: use the logs 
 * 
 * - EXPORTED: use an external collector
 * s
 * - NOTEL: disable telemetry entirely
 */
export enum TELEMETRY {
    CONSOLE = 'console',
    EXPORTED = 'exported',
    NOTEL = 'notel',
}

/**
 * A proxy symbol for the for the opentelemetry span interface.
 */

export const SpanArtifact = Symbol('SpanArtifact');

/**
 * A proxy interface of for the opentelemetry span interface.
 */
export interface SpanArtifact extends OTelSpan {}

/**
 * This data structure holds the required data to construct a span.
 */
export type Spannable = {
    /**
     * Name of the span.
     */
    name: string;
    /**
     * The kind of the span.
     */
    kind: Spanner;
    /**
     * The parent span. If defined the resulting {@link Span} will be linked
     * to this span.
     */
    parent?: Span;
    /**
     * Propagation data. If defined the resulting {@link Span} will be linked
     * to the trace.
     */
    propagation?: Propagation,
};

/**
 * Kind of spans.
 * 
 * - SERVER: proxy for the SpanKind.SERVER value from the opentelemetry sdk
 * 
 * - PRODUCER: proxy for the SpanKind.PRODUCER value from the opentelemetry sdk
 * 
 * - CONSUMER: proxy for the SpanKind.CONSUMER value from the opentelemetry sdk
 */
export enum Spanner {
    SERVER,
    PRODUCER,
    CONSUMER,
}

/** 
 * A collection of {@link Trace}
 */
export type StackTrace = Trace[];

/**
 * A collection of {@link Span}
 */
export type Trace = Span[];

/**
 * Arbitrary data attached to a {@link Span}.
 */
export type SpanBag = {
    [key:string]: string | string[];
};

/**
 * Propagation data according to the opentelemetry sdk.
 */
export type Propagation = {
    /**
     * Trace parent.
     */
    traceparent?: string;
    /**
     * Trace state.
     */
    tracestate?: string;
};

/**
 * Endpoints URL for telemetry data delivery.
 */
export type OTLPEndpoints = {
    /**
     * Metrics endpoint URL.
     */
    metrics: string;
    /**
     * Traces endpoint URL.
     */
    traces: string;
};

/**
 * Instrumentation configuration data structure.
 */
export type InstrumentationConfig = {
    /**
     * Name of the instrumentalized service.
     */
    serviceName: string;
    /**
     * Version of the instrumentalized service.
     */
    serviceVersion: string;
    /**
     * Telemetry mode according to {@link TELEMETRY}.
     */
    mode: TELEMETRY,
    /**
     * Required for EXTERNAL {@link TELEMETRY} only, defines the endpoints where
     * to deliver the telemetry data.
     */
    otlp?: OTLPEndpoints;
};
