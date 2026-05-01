package com.epidemiwatch.sse;

import com.epidemiwatch.entity.OutbreakAlert;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.operators.multi.processors.BroadcastProcessor;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

/**
 * Application-scoped SSE broadcaster for live outbreak alerts.
 *
 * <p>Uses a SmallRye {@link BroadcastProcessor} as the hot multi-cast source.
 * Any number of frontend clients can subscribe to {@link #stream()} and
 * receive pushed {@link OutbreakAlert} events in real time.
 *
 * <p>The detector service calls {@link #broadcast(OutbreakAlert)} each time
 * an alert is CREATED or UPDATED. Clients that connect after an alert was
 * fired will not receive historical events — they get the live feed only.
 */
@ApplicationScoped
public class AlertBroadcaster {

    private static final Logger LOG = Logger.getLogger(AlertBroadcaster.class);

    /** Hot broadcast processor — emits to all active subscribers. */
    private final BroadcastProcessor<OutbreakAlert> processor =
            BroadcastProcessor.create();

    /**
     * Returns a {@link Multi} stream that each SSE client subscribes to.
     * Every call returns the same shared hot stream.
     */
    public Multi<OutbreakAlert> stream() {
        return processor;
    }

    /**
     * Pushes a new or escalated alert to all currently connected SSE clients.
     *
     * @param alert the alert to broadcast (must not be null)
     */
    public void broadcast(OutbreakAlert alert) {
        if (alert == null) return;
        LOG.debugf("[SSE] Broadcasting alert: %s / %s / %s", alert.county, alert.disease, alert.alertLevel);
        processor.onNext(alert);
    }
}
