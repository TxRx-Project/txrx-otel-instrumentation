# txrx-otel-instrumentation

An `OpenTelemetry` wrapper.

## Synopsis

Utilize the provided facade to interact with the opentelemetry sdk.

### Start the SDK for a service

```typescript 
const mainSpan = Instrumentation.service({
    serviceName: 'my-service',
    serviceVersion: '1.0.0',
    mode: TELEMETRY.EXPORTED,
    otlp: {
        metrics: 'http://otelcol:4318/v1/metrics',
        traces: 'http://otelcol:4318/v1/traces',
    },
});
```

### Console mode

```typescript
Instrumentation.start({
    serviceName: 'my-service',
    serviceVersion: '1.0.0',
    mode: TELEMETRY.CONSOLE,
});
```

### No telemetry

```typescript
Instrumentation.start({
    serviceName: 'my-service',
    serviceVersion: '1.0.0',
    mode: TELEMETRY.NOTEL,
});
```

### New producer span

```typescript
const producerSpan = Instrumentation.producer({
    'my-producer-span',
    mainSpan
});
```

### New consumer span

```typescript
const consumerSpan = Instrumentation.consumer({
    'my-consumer-span',
    producerSpan
});
```

### Propagation

Extracts the propagation data.

```typescript
const propagation = Instrumentation.propagation(consumerSpan);
```

Links the propagation data to a new span.

```typescript
const newSpan = Instrumentation.consumer('new-span', propagation);
```

### Close a span

```typescript
Instrumentation.end(span);
```

### Activate a span

```typescript
Instrumentation.activate(span);
```

## Devel

Dev container is recommended, to run the `devel` container:

```bash
make build
make install
```

### CI

The workflow runs:

```bash
make test
```

Or separately:

#### Tests

```bash
make jest
```

#### Linter

```bash
make syntax
```

