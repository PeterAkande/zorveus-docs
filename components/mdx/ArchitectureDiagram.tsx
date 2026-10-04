export function ArchitectureDiagram() {
  return (
    <figure className="zorveus-architecture not-prose" aria-label="Zorveus architecture">
      <div className="zorveus-architecture-management">
        <strong>Zorveus dashboard</strong>
        <span>Configure apps, connections, model access, caps, provider credentials, and webhooks.</span>
      </div>
      <div className="zorveus-architecture-connector" aria-hidden="true">↓ Configures Zorveus</div>
      <ol className="zorveus-architecture-flow">
        <li><strong>Your application backend</strong><span>Sends a model request with a Zorveus API key and your customer’s external user ID.</span></li>
        <li><strong>Zorveus</strong><span>Checks access, attribution, allowance, and funding. Routes the request and records usage.</span></li>
        <li><strong>Model provider</strong><span>Runs the model. The response returns through Zorveus to your application.</span></li>
      </ol>
      <figcaption>Separate server-to-server path: your backend uses a service key for supported product-user reads, upserts, and credit grants by external user ID.</figcaption>
    </figure>
  );
}
