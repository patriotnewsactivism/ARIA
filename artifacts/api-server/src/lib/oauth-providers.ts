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
};

export function getRedirectUri(): string {
  const base = process.env.OAUTH_REDIRECT_BASE_URL
    || (process.env.RAILWAY_SERVICE_API_SERVER_URL ? `https://${process.env.RAILWAY_SERVICE_API_SERVER_URL}` : null)
    || "https://api-server-production-90ef.up.railway.app";
  return `${base}/api/integrations/oauth/callback`;
}
