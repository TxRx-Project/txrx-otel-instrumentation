import { InstrumentationConfig, Propagation, Spannable, Spanner } from '../types/instrumentation.types';
import Span from "./opentelemetry/span";
import OpenTelemetry from './opentelemetry';

/**
 * A Facade entrypoint for the implemented opentelemetry features.
 * 
 * The main idea is to hide the actual opentelemetry sdk behind
 * this package own typing and interfaces.
 */
export default class Instrumentation {
  private static instance: OpenTelemetry;
  private static active: Span;

  /**
   * Brings an entrypoint to the opentelemetry SDK initialization.
   * 
   * @param config - the {@link InstrumentationConfig} to start the opentelemetry SDK.
   */
  public static start(config: InstrumentationConfig) {
    if (typeof Instrumentation.instance === 'undefined') {
      Instrumentation.instance = new OpenTelemetry(config);
      Instrumentation.instance.start();
    }
  }

  /**
   * Brings an entrypoint to the opentelemetry SDK initialization and also starts a new
   * span as a SERVER, per the {@link Spanner} enum. This new span is flagged as the
   * contextual active one.
   *
   * @param config - the {@link InstrumentationConfig} to start the opentelemetry SDK.
   * @returns the generated {@link Span}
   */
  public static service(config: InstrumentationConfig): Span {
    this.start(config);

    const spannable: Spannable = {
      name: `srv:${config.serviceName}`,
      kind: Spanner.SERVER,
    };

    const span = Instrumentation.trace(spannable);
    Instrumentation.activate(span);

    return span;
  }

  /**
   * Overrides the contextual active span.
   *
   * @param span - the {@link Span} to activate
   */
  public static activate(span: Span) {
    Instrumentation.active = span;
  }

  /**
   * Constructs a new span.
   *
   * @param spannable - the definition of the span to be created, as a {@link Spannable}
   * @returns the new {@link Span} instance
   */
  public static trace(spannable: Spannable): Span {
    return Instrumentation.instance.span(spannable);
  }

  /**
   * Closes the span.
   * 
   * @param span - the {@link Span} to be closed
   */
  public static end(span: Span) {
    Instrumentation.instance.closeSpan(span);
  }

  /**
   * Constructs a new PRODUCER span, according to the {@link Spanner} enum.
   *
   * @param name - a name for the new span
   * @param maybeParent - either a {@link Span} or {@link Propagation} to set the span's parent. The contextual active span will be used by default, unless a explicit false value is given.
   * @returns the new {@link Span} instance
   */
  public static producer(name: string, maybeParent?: Span | false | Propagation): Span {
    return Instrumentation.trace({
      kind: Spanner.PRODUCER,
      name,
      ...Instrumentation.maybeSpannable(maybeParent),
    });
  }

  /**
   * Constructs a new CONSUMER span, according to the {@link Spanner} enum.
   *
   * @param name - a name for the new span
   * @param maybeParent - either a {@link Span} or {@link Propagation} to set the span's parent. The contextual active span will be used by default, unless a explicit false value is given.
   * @returns the new {@link Span} instance
   */  
  public static consumer(name: string, maybeParent?: Span | false | Propagation): Span {
    return Instrumentation.trace({
      kind: Spanner.CONSUMER,
      name,
      ...Instrumentation.maybeSpannable(maybeParent),
    });
  }

  /**
   * Computes the parent or propagation data for a {@link Spannable}.
   *  
   * @param maybeParent - either a {@link Span} or {@link Propagation} to set the span's parent. The contextual active span will be used by default, unless a explicit false value is given.
   * @returns a partial {@link Spannable} including parent or propagation data only.
   */
  private static maybeSpannable(maybeParent?: Span | false | Propagation): Partial<Spannable> {
    let parent: Span;
    let propagation: Propagation;

    if (maybeParent !== false) {
      if (maybeParent instanceof Span) {
        parent = maybeParent;
      }
      else if (typeof maybeParent !== 'undefined') {
        propagation = maybeParent as Propagation;
      } else {
        parent = Instrumentation.active;
      }
    }
  
    return {
      parent,
      propagation,
    };
  }

  /**
   * Extracts propagation data from a given span.
   * 
   * @param span - the span to propagate
   * @returns propagation data modeled after the {@link Propagation} data structure
   */
  public static propagate(span: Span): Propagation {
    return Instrumentation.instance.propagate(span);
  }
}
