import { Propagation, SpanArtifact, SpanBag, Spanner } from '../../types/instrumentation.types';
import { Spannable } from "../../types/instrumentation.types";

/**
 * This is a proxy class for the opentelemetry span interface,
 * encapsulating the underlying {@link SpanArtifact}.
 */
export default class Span {
    private spannable: Spannable;
    private artifact: SpanArtifact;
    private bag: SpanBag = {};

    /**
     * Constructs a new span.
     * 
     * @param spannable - the definition of the span being constructed
     */
    constructor(spannable: Spannable) {
        this.spannable = spannable;
    }

    /**
     * Links an actual opentelemetry span into this proxy representation of a span.
     * 
     * @param artifact - the actual opentelemetry span proxied as a {@link SpanArtifact}
     */
    public attach(artifact: SpanArtifact): void {
        this.artifact = artifact;
    }

    /**
     * Accessor for the name of the span.
     * 
     * @returns the name of the span
     */
    public name(): string {
        return this.spannable.name;
    }

    /**
     * Accessor for the {@link Spanner} of the span.
     * 
     * @returns the kind of span 
     */
    public kind(): Spanner {
        return this.spannable.kind;
    }

    /**
     * Accessor for the {@link Propagation} data.
     * 
     * @returns the propagation data
     */
    public propagation(): Propagation {
        return this.spannable.propagation;
    }

    /**
     * Accesor for the parent {@link Span}.
     * 
     * @returns the parent {@link Span} instance
     */
    public parent(): Span {
        return this.spannable.parent;
    }

    /**
     * Accesor for the underlying opentelemetry span instance.
     * 
     * @returns the opentelemetry span proxied as a {@link SpanArtifact}
     */
    public get(): SpanArtifact {
        return this.artifact;
    }

    /**
     * Overrides the actual name of the span.
     *
     * @param name - the new name for the span
     */
    public updateName(name: string) {
        this.spannable.name = name;
    }

    /**
     * Updates the span attributes, modeled after a {@link SpanBag} data structure.
     *
     * @param keyOrBag - if a string this param acts as the new key, otherwise this defines a {@link SpanBag} to be merged into the current attributes.
     * @param value - if a string key is defined then this param acts as the new value, otherwise is ignored.
     */
    public attr(keyOrBag: string | SpanBag, value?: string | string[]) {
        if (typeof keyOrBag === 'string') {
            const key = keyOrBag as string;
            this.bag[key] = value;
        } else {
            const bag = keyOrBag as SpanBag;

            for (const key of Object.keys(bag)) {
                this.bag[key] = bag[key];
            } 
        }
    }

    /**
     * Accessor for the attributes of the span.
     * 
     * @returns the attributes modeled after the {@link SpanBag} data structure
     */
    public attributes(): SpanBag {
        return this.bag;
    }
}
