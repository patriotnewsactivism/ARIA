// Real OAuth2 provider registry. NO simulated/demo URLs.
//
// Each entry maps an integration `slug` to its actual authorize/token
// endpoints and the env var names holding that provider's OAuth app
// credentials. If an entry is missing here, or its env vars aren't set,
// the /connect route returns an honest "not configured" error instead
// of pretending to connect.
//
// To activate a provider: register a real OAuth app with that vendor,
// set <NAME>_OAUTH_CLIENT_ID / <NAME>_OAUTH_CLIENT_SECRET in Railway env
// vars for the api-server service, using the env var names below.

export interface OAuthProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  extraAuthorizeParams?: Record<string, string>;
  tokenRequestStyle?: "form" | "json";
  accessTokenKey?: string;
  refreshTokenKey?: string;
}

export const OAUTH_PROVIDERS: Record<string, OAuthProviderConfig> = {
  "github": {
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    clientIdEnv: "GITHUB_OAUTH_CLIENT_ID",
    clientSecretEnv: "GITHUB_OAUTH_CLIENT_SECRET",
  },
  "gitlab": {
    authorizeUrl: "https://gitlab.com/oauth/authorize",
    tokenUrl: "https://gitlab.com/oauth/token",
    clientIdEnv: "GITLAB_OAUTH_CLIENT_ID",
    clientSecretEnv: "GITLAB_OAUTH_CLIENT_SECRET",
  },
  "bitbucket": {
    authorizeUrl: "https://bitbucket.org/site/oauth2/authorize",
    tokenUrl: "https://bitbucket.org/site/oauth2/access_token",
    clientIdEnv: "BITBUCKET_OAUTH_CLIENT_ID",
    clientSecretEnv: "BITBUCKET_OAUTH_CLIENT_SECRET",
  },
  "slack": {
    authorizeUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    clientIdEnv: "SLACK_OAUTH_CLIENT_ID",
    clientSecretEnv: "SLACK_OAUTH_CLIENT_SECRET",
    accessTokenKey: "access_token",
  },
  "discord": {
    authorizeUrl: "https://discord.com/api/oauth2/authorize",
    tokenUrl: "https://discord.com/api/oauth2/token",
    clientIdEnv: "DISCORD_OAUTH_CLIENT_ID",
    clientSecretEnv: "DISCORD_OAUTH_CLIENT_SECRET",
  },
  "google-calendar": {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    clientSecretEnv: "GOOGLE_OAUTH_CLIENT_SECRET",
    extraAuthorizeParams: { access_type: "offline", prompt: "consent" },
  },
  "gmail": {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    clientSecretEnv: "GOOGLE_OAUTH_CLIENT_SECRET",
    extraAuthorizeParams: { access_type: "offline", prompt: "consent" },
  },
  "google-drive": {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    clientSecretEnv: "GOOGLE_OAUTH_CLIENT_SECRET",
    extraAuthorizeParams: { access_type: "offline", prompt: "consent" },
  },
  "google-photos": {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    clientSecretEnv: "GOOGLE_OAUTH_CLIENT_SECRET",
    extraAuthorizeParams: { access_type: "offline", prompt: "consent" },
  },
  "microsoft-teams": {
    authorizeUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    clientIdEnv: "MICROSOFT_OAUTH_CLIENT_ID",
    clientSecretEnv: "MICROSOFT_OAUTH_CLIENT_SECRET",
  },
  "outlook": {
    authorizeUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    clientIdEnv: "MICROSOFT_OAUTH_CLIENT_ID",
    clientSecretEnv: "MICROSOFT_OAUTH_CLIENT_SECRET",
  },
  "outlook-calendar": {
    authorizeUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    clientIdEnv: "MICROSOFT_OAUTH_CLIENT_ID",
    clientSecretEnv: "MICROSOFT_OAUTH_CLIENT_SECRET",
  },
  "onedrive": {
    authorizeUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    clientIdEnv: "MICROSOFT_OAUTH_CLIENT_ID",
    clientSecretEnv: "MICROSOFT_OAUTH_CLIENT_SECRET",
  },
  "notion": {
    authorizeUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    clientIdEnv: "NOTION_OAUTH_CLIENT_ID",
    clientSecretEnv: "NOTION_OAUTH_CLIENT_SECRET",
    tokenRequestStyle: "json",
  },
  "hubspot": {
    authorizeUrl: "https://app.hubspot.com/oauth/authorize",
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
    clientIdEnv: "HUBSPOT_OAUTH_CLIENT_ID",
    clientSecretEnv: "HUBSPOT_OAUTH_CLIENT_SECRET",
  },
  "salesforce": {
    authorizeUrl: "https://login.salesforce.com/services/oauth2/authorize",
    tokenUrl: "https://login.salesforce.com/services/oauth2/token",
    clientIdEnv: "SALESFORCE_OAUTH_CLIENT_ID",
    clientSecretEnv: "SALESFORCE_OAUTH_CLIENT_SECRET",
  },
  "dropbox": {
    authorizeUrl: "https://www.dropbox.com/oauth2/authorize",
    tokenUrl: "https://api.dropboxapi.com/oauth2/token",
    clientIdEnv: "DROPBOX_OAUTH_CLIENT_ID",
    clientSecretEnv: "DROPBOX_OAUTH_CLIENT_SECRET",
    extraAuthorizeParams: { token_access_type: "offline" },
  },
  "box": {
    authorizeUrl: "https://account.box.com/api/oauth2/authorize",
    tokenUrl: "https://api.box.com/oauth2/token",
    clientIdEnv: "BOX_OAUTH_CLIENT_ID",
    clientSecretEnv: "BOX_OAUTH_CLIENT_SECRET",
  },
  "zoom": {
    authorizeUrl: "https://zoom.us/oauth/authorize",
    tokenUrl: "https://zoom.us/oauth/token",
    clientIdEnv: "ZOOM_OAUTH_CLIENT_ID",
    clientSecretEnv: "ZOOM_OAUTH_CLIENT_SECRET",
  },
  "linkedin": {
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    clientIdEnv: "LINKEDIN_OAUTH_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_OAUTH_CLIENT_SECRET",
  },
  "twitter-x": {
    authorizeUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    clientIdEnv: "TWITTER_OAUTH_CLIENT_ID",
    clientSecretEnv: "TWITTER_OAUTH_CLIENT_SECRET",
  },
  "asana": {
    authorizeUrl: "https://app.asana.com/-/oauth_authorize",
    tokenUrl: "https://app.asana.com/-/oauth_token",
    clientIdEnv: "ASANA_OAUTH_CLIENT_ID",
    clientSecretEnv: "ASANA_OAUTH_CLIENT_SECRET",
  },
  "monday": {
    authorizeUrl: "https://auth.monday.com/oauth2/authorize",
    tokenUrl: "https://auth.monday.com/oauth2/token",
    clientIdEnv: "MONDAY_OAUTH_CLIENT_ID",
    clientSecretEnv: "MONDAY_OAUTH_CLIENT_SECRET",
  },
  "pipedrive": {
    authorizeUrl: "https://oauth.pipedrive.com/oauth/authorize",
    tokenUrl: "https://oauth.pipedrive.com/oauth/token",
    clientIdEnv: "PIPEDRIVE_OAUTH_CLIENT_ID",
    clientSecretEnv: "PIPEDRIVE_OAUTH_CLIENT_SECRET",
  },
  "xero": {
    authorizeUrl: "https://login.xero.com/identity/connect/authorize",
    tokenUrl: "https://identity.xero.com/connect/token",
    clientIdEnv: "XERO_OAUTH_CLIENT_ID",
    clientSecretEnv: "XERO_OAUTH_CLIENT_SECRET",
  },
  "coinbase": {
    authorizeUrl: "https://www.coinbase.com/oauth/authorize",
    tokenUrl: "https://api.coinbase.com/oauth/token",
    clientIdEnv: "COINBASE_OAUTH_CLIENT_ID",
    clientSecretEnv: "COINBASE_OAUTH_CLIENT_SECRET",
  },
  "calendly": {
    authorizeUrl: "https://auth.calendly.com/oauth/authorize",
    tokenUrl: "https://auth.calendly.com/oauth/token",
    clientIdEnv: "CALENDLY_OAUTH_CLIENT_ID",
    clientSecretEnv: "CALENDLY_OAUTH_CLIENT_SECRET",
  },
  "intercom": {
    authorizeUrl: "https://app.intercom.com/oauth",
    tokenUrl: "https://api.intercom.io/auth/eagle/token",
    clientIdEnv: "INTERCOM_OAUTH_CLIENT_ID",
    clientSecretEnv: "INTERCOM_OAUTH_CLIENT_SECRET",
  },
  "quickbooks": {
    authorizeUrl: "https://appcenter.intuit.com/connect/oauth2",
    tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    clientIdEnv: "QUICKBOOKS_OAUTH_CLIENT_ID",
    clientSecretEnv: "QUICKBOOKS_OAUTH_CLIENT_SECRET",
  },
  "clickup": {
    authorizeUrl: "https://app.clickup.com/api",
    tokenUrl: "https://api.clickup.com/api/v2/oauth/token",
    clientIdEnv: "CLICKUP_OAUTH_CLIENT_ID",
    clientSecretEnv: "CLICKUP_OAUTH_CLIENT_SECRET",
  },
  "todoist": {
    authorizeUrl: "https://todoist.com/oauth/authorize",
    tokenUrl: "https://todoist.com/oauth/access_token",
    clientIdEnv: "TODOIST_OAUTH_CLIENT_ID",
    clientSecretEnv: "TODOIST_OAUTH_CLIENT_SECRET",
  },
  "figma": {
    authorizeUrl: "https://www.figma.com/oauth",
    tokenUrl: "https://www.figma.com/api/oauth/token",
    clientIdEnv: "FIGMA_OAUTH_CLIENT_ID",
    clientSecretEnv: "FIGMA_OAUTH_CLIENT_SECRET",
  },
  "confluence": {
    authorizeUrl: "https://auth.atlassian.com/authorize",
    tokenUrl: "https://auth.atlassian.com/oauth/token",
    clientIdEnv: "ATLASSIAN_OAUTH_CLIENT_ID",
    clientSecretEnv: "ATLASSIAN_OAUTH_CLIENT_SECRET",
    tokenRequestStyle: "json",
    extraAuthorizeParams: { audience: "api.atlassian.com", prompt: "consent" },
  },
  "docusign": {
    authorizeUrl: "https://account.docusign.com/oauth/auth",
    tokenUrl: "https://account.docusign.com/oauth/token",
    clientIdEnv: "DOCUSIGN_OAUTH_CLIENT_ID",
    clientSecretEnv: "DOCUSIGN_OAUTH_CLIENT_SECRET",
  },
  "miro": {
    authorizeUrl: "https://miro.com/oauth/authorize",
    tokenUrl: "https://api.miro.com/v1/oauth/token",
    clientIdEnv: "MIRO_OAUTH_CLIENT_ID",
    clientSecretEnv: "MIRO_OAUTH_CLIENT_SECRET",
  },
  "typeform": {
    authorizeUrl: "https://api.typeform.com/oauth/authorize",
    tokenUrl: "https://api.typeform.com/oauth/token",
    clientIdEnv: "TYPEFORM_OAUTH_CLIENT_ID",
    clientSecretEnv: "TYPEFORM_OAUTH_CLIENT_SECRET",
  },
  "netlify": {
    authorizeUrl: "https://app.netlify.com/authorize",
    tokenUrl: "https://api.netlify.com/oauth/token",
    clientIdEnv: "NETLIFY_OAUTH_CLIENT_ID",
    clientSecretEnv: "NETLIFY_OAUTH_CLIENT_SECRET",
  },
  "digitalocean": {
    authorizeUrl: "https://cloud.digitalocean.com/v1/oauth/authorize",
    tokenUrl: "https://cloud.digitalocean.com/v1/oauth/token",
    clientIdEnv: "DIGITALOCEAN_OAUTH_CLIENT_ID",
    clientSecretEnv: "DIGITALOCEAN_OAUTH_CLIENT_SECRET",
  },
  "sentry": {
    authorizeUrl: "https://sentry.io/oauth/authorize/",
    tokenUrl: "https://sentry.io/oauth/token/",
    clientIdEnv: "SENTRY_OAUTH_CLIENT_ID",
    clientSecretEnv: "SENTRY_OAUTH_CLIENT_SECRET",
  },
  "supabase": {
    authorizeUrl: "https://api.supabase.com/v1/oauth/authorize",
    tokenUrl: "https://api.supabase.com/v1/oauth/token",
    clientIdEnv: "SUPABASE_OAUTH_CLIENT_ID",
    clientSecretEnv: "SUPABASE_OAUTH_CLIENT_SECRET",
  },
  "pagerduty": {
    authorizeUrl: "https://identity.pagerduty.com/oauth/authorize",
    tokenUrl: "https://identity.pagerduty.com/oauth/token",
    clientIdEnv: "PAGERDUTY_OAUTH_CLIENT_ID",
    clientSecretEnv: "PAGERDUTY_OAUTH_CLIENT_SECRET",
  },
  "zoho-crm": {
    authorizeUrl: "https://accounts.zoho.com/oauth/v2/auth",
    tokenUrl: "https://accounts.zoho.com/oauth/v2/token",
    clientIdEnv: "ZOHO_OAUTH_CLIENT_ID",
    clientSecretEnv: "ZOHO_OAUTH_CLIENT_SECRET",
  },
  "keap": {
    authorizeUrl: "https://accounts.infusionsoft.com/app/oauth/authorize",
    tokenUrl: "https://api.infusionsoft.com/token",
    clientIdEnv: "KEAP_OAUTH_CLIENT_ID",
    clientSecretEnv: "KEAP_OAUTH_CLIENT_SECRET",
  },
  "square": {
    authorizeUrl: "https://connect.squareup.com/oauth2/authorize",
    tokenUrl: "https://connect.squareup.com/oauth2/token",
    clientIdEnv: "SQUARE_OAUTH_CLIENT_ID",
    clientSecretEnv: "SQUARE_OAUTH_CLIENT_SECRET",
    tokenRequestStyle: "json",
  },
  "paypal": {
    authorizeUrl: "https://www.paypal.com/connect",
    tokenUrl: "https://api-m.paypal.com/v1/oauth2/token",
    clientIdEnv: "PAYPAL_OAUTH_CLIENT_ID",
    clientSecretEnv: "PAYPAL_OAUTH_CLIENT_SECRET",
  },
  "wave": {
    authorizeUrl: "https://api.waveapps.com/oauth2/authorize/",
    tokenUrl: "https://api.waveapps.com/oauth2/token/",
    clientIdEnv: "WAVE_OAUTH_CLIENT_ID",
    clientSecretEnv: "WAVE_OAUTH_CLIENT_SECRET",
  },
  "freshbooks": {
    authorizeUrl: "https://auth.freshbooks.com/oauth/authorize",
    tokenUrl: "https://api.freshbooks.com/auth/oauth/token",
    clientIdEnv: "FRESHBOOKS_OAUTH_CLIENT_ID",
    clientSecretEnv: "FRESHBOOKS_OAUTH_CLIENT_SECRET",
  },
  "acuity-scheduling": {
    authorizeUrl: "https://acuityscheduling.com/oauth2/authorize",
    tokenUrl: "https://acuityscheduling.com/oauth2/token",
    clientIdEnv: "ACUITY_OAUTH_CLIENT_ID",
    clientSecretEnv: "ACUITY_OAUTH_CLIENT_SECRET",
  },
  "ringcentral": {
    authorizeUrl: "https://platform.ringcentral.com/restapi/oauth/authorize",
    tokenUrl: "https://platform.ringcentral.com/restapi/oauth/token",
    clientIdEnv: "RINGCENTRAL_OAUTH_CLIENT_ID",
    clientSecretEnv: "RINGCENTRAL_OAUTH_CLIENT_SECRET",
  },
  "front": {
    authorizeUrl: "https://app.frontapp.com/oauth/authorize",
    tokenUrl: "https://app.frontapp.com/oauth/token",
    clientIdEnv: "FRONT_OAUTH_CLIENT_ID",
    clientSecretEnv: "FRONT_OAUTH_CLIENT_SECRET",
  },
  "mailchimp": {
    authorizeUrl: "https://login.mailchimp.com/oauth2/authorize",
    tokenUrl: "https://login.mailchimp.com/oauth2/token",
    clientIdEnv: "MAILCHIMP_OAUTH_CLIENT_ID",
    clientSecretEnv: "MAILCHIMP_OAUTH_CLIENT_SECRET",
  },
  "whatsapp-business": {
    authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    clientIdEnv: "META_OAUTH_CLIENT_ID",
    clientSecretEnv: "META_OAUTH_CLIENT_SECRET",
  },
  "facebook-messenger": {
    authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    clientIdEnv: "META_OAUTH_CLIENT_ID",
    clientSecretEnv: "META_OAUTH_CLIENT_SECRET",
  },
  "instagram": {
    authorizeUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    clientIdEnv: "INSTAGRAM_OAUTH_CLIENT_ID",
    clientSecretEnv: "INSTAGRAM_OAUTH_CLIENT_SECRET",
  },
  "onenote": {
    authorizeUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    clientIdEnv: "MICROSOFT_OAUTH_CLIENT_ID",
    clientSecretEnv: "MICROSOFT_OAUTH_CLIENT_SECRET",
  },
  "basecamp": {
    authorizeUrl: "https://launchpad.37signals.com/authorization/new",
    tokenUrl: "https://launchpad.37signals.com/authorization/token",
    clientIdEnv: "BASECAMP_OAUTH_CLIENT_ID",
    clientSecretEnv: "BASECAMP_OAUTH_CLIENT_SECRET",
    extraAuthorizeParams: { type: "web_server" },
  },
  "wordpress": {
    authorizeUrl: "https://public-api.wordpress.com/oauth2/authorize",
    tokenUrl: "https://public-api.wordpress.com/oauth2/token",
    clientIdEnv: "WORDPRESS_OAUTH_CLIENT_ID",
    clientSecretEnv: "WORDPRESS_OAUTH_CLIENT_SECRET",
  },
};

export function getRedirectUri(): string {
  const base = process.env.OAUTH_REDIRECT_BASE_URL
    || (process.env.RAILWAY_SERVICE_API_SERVER_URL ? `https://${process.env.RAILWAY_SERVICE_API_SERVER_URL}` : null)
    || "https://api-server-production-90ef.up.railway.app";
  return `${base}/api/integrations/oauth/callback`;
}
