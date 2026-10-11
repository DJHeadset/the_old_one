const PIHOLE_URL = process.env.PIHOLE_URL || "http://192.168.0.150";
const PIHOLE_PASSWORD = process.env.PIHOLE_PASSWORD;

// Pi-hole status cache
const CACHE_TTL = 20_000; // 20 seconds
let cachedInfo = null;
let cacheTime = 0;
let inFlight = null;

async function fetchPiHoleInfo() {
  console.log("get PiHole info");
  if (!PIHOLE_PASSWORD) {
    throw new Error("PIHOLE_PASSWORD is not configured");
  }

  // Authenticate with Pi-hole v6
  const authResponse = await fetch(`${PIHOLE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: PIHOLE_PASSWORD }),
    signal: AbortSignal.timeout(5000),
  });

  if (!authResponse.ok) {
    throw new Error(`Pi-hole authentication failed: ${authResponse.status}`);
  }

  const authData = await authResponse.json();
  const sid = authData.session?.sid;

  if (!authData.session?.valid || !sid) {
    throw new Error("Pi-hole returned an invalid session");
  }

  try {
    const headers = { "X-FTL-SID": sid };

    const [summaryResponse, blockingResponse, dhcpResponse] = await Promise.all(
      [
        fetch(`${PIHOLE_URL}/api/stats/summary`, {
          headers,
          signal: AbortSignal.timeout(5000),
        }),
        fetch(`${PIHOLE_URL}/api/dns/blocking`, {
          headers,
          signal: AbortSignal.timeout(5000),
        }),
        fetch(`${PIHOLE_URL}/api/dhcp/leases`, {
          headers,
          signal: AbortSignal.timeout(5000),
        }),
      ],
    );

    if (!summaryResponse.ok) {
      throw new Error(`Pi-hole summary failed: ${summaryResponse.status}`);
    }

    if (!blockingResponse.ok) {
      throw new Error(
        `Pi-hole blocking status failed: ${blockingResponse.status}`,
      );
    }

    const summary = await summaryResponse.json();
    const blocking = await blockingResponse.json();

    // DHCP leases are useful context, but do not equal devices currently online.
    const data = dhcpResponse.ok ? await dhcpResponse.json() : [];
    const leases = data.leases;

    // Pi-hole v6 summary fields may vary slightly by version.
    const queries = summary.queries ?? {};
    const total = queries.total ?? summary.total_queries ?? 0;
    const blocked = queries.blocked ?? summary.blocked_queries ?? 0;

    return {
      online: true,

      // DNS statistics
      queries_today: total,
      blocked_today: blocked,
      blocked_percentage:
        queries.percent_blocked ??
        summary.percent_blocked ??
        (total > 0 ? (blocked / total) * 100 : 0),

      domains_blocked:
        summary.gravity?.domains_being_blocked ??
        summary.domains_being_blocked ??
        null,

      // Device statistics
      active_devices: null, // Not implemented yet

      // Service status
      dns: true,
      dhcp: Array.isArray(leases),
      dhcp_leases: Array.isArray(leases) ? leases.length : null,

      blocking_enabled: blocking.blocking === "enabled",
      blocking_status: blocking.blocking ?? "unknown",
      clients: {
        active: summary.clients.active,
        total: summary.clients.total,
      },
    };
  } finally {
    // Invalidate the temporary session.
    await fetch(`${PIHOLE_URL}/api/auth`, {
      method: "DELETE",
      headers: { "X-FTL-SID": sid },
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
  }
}

async function getPiHoleInfo() {
  console.log("Pi-hole wrapper called");

  // Reuse a recent successful result.
  if (cachedInfo && Date.now() - cacheTime < CACHE_TTL) {
    console.log("Pi-hole: serving cached statistics");
    return cachedInfo;
  }

  // Share an authentication/API request already in progress.
  if (inFlight) {
    console.log("Pi-hole: reusing in-flight request");
    return inFlight;
  }

  console.log("Pi-hole: starting NEW API request");
  inFlight = fetchPiHoleInfo();

  try {
    const info = await inFlight;

    cachedInfo = info;
    cacheTime = Date.now();

    return info;
  } finally {
    inFlight = null;
  }
}

module.exports = { getPiHoleInfo };
