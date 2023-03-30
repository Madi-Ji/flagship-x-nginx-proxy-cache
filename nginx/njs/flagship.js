function convertCampaignVariationIntoCacheKey(
  usecases,
  separatorCV,
  separatorEach
) {
  return usecases
    .map((uc) => `${uc.campaignId}${separatorCV}${uc.variationId}`)
    .join(separatorEach);
}

async function fetchExperienceCacheKey(r) {
  ngx.log(ngx.WARN, JSON.stringify(r.headersIn));
  let reply = await ngx.fetch(
    `https://decision.flagship.io/v2/${r.variables.fs_env_id}/campaigns?mode=simple&exposeAllKeys=true`,
    {
      method: "POST",
      body: JSON.stringify({
        visitor_id: "@Madi-Ji",
        context: {
          github: "Madi-Ji/flagship-x-nginx-proxy-cache",
        },
        visitor_consent: false,
        trigger_hit: false,
      }),
      headers: { "x-api-key": r.variables.fs_api_key },
    }
  );

  if (reply.status !== 200) {
    // If something's wrong, optout
    r.headersOut["X-fs-experiences"] = "optout";
    r.return(reply.status);
    return;
  }

  let json = await reply.json();

  let cacheKey = convertCampaignVariationIntoCacheKey(
    json.campaignsVariation,
    ":",
    "|"
  );
  // Most of the Work done here.
  r.headersOut["X-fs-experiences"] = cacheKey;
  r.return(200);
  return;
}

export default { fetchExperienceCacheKey };
