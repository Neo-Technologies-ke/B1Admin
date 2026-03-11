import { CommonEnvironmentHelper, ApiHelper, Locale } from "@churchapps/apphelper";
import { EnvironmentHelper as WebsiteEnvironmentHelper } from "@churchapps/apphelper-website";

export class EnvironmentHelper {
  private static LessonsApi = "";
  static B1Url = "";
  static ChurchAppsUrl = "";
  static Common = CommonEnvironmentHelper;

  static init = async () => {
    const stage = process.env.REACT_APP_STAGE;

    switch (stage) {
      case "staging": EnvironmentHelper.initStaging(); break;
      case "prod": 
        // For production, use initDev() which sets relative /api paths
        // This allows nginx to proxy to our local API
        EnvironmentHelper.initDev();
        break;
      default: EnvironmentHelper.initDev(); break;
    }
    
    // Skip CommonEnvironmentHelper.init() for all stages to avoid overwriting
    // We're handling initialization ourselves above

    const forceLocalApi = () => {
      EnvironmentHelper.Common.AttendanceApi = "/api/attendance";
      EnvironmentHelper.Common.DoingApi = "/api/doing";
      EnvironmentHelper.Common.GivingApi = "/api/giving";
      EnvironmentHelper.Common.MembershipApi = "/api/membership";
      EnvironmentHelper.Common.ReportingApi = "/api/reporting";
      EnvironmentHelper.Common.MessagingApi = "/api/messaging";
      EnvironmentHelper.Common.MessagingApiSocket = "wss://admin.lifereformationcentre.org/ws";
      EnvironmentHelper.Common.ContentApi = "/api/content";
      EnvironmentHelper.Common.AskApi = "/api/ask";
      EnvironmentHelper.Common.ContentRoot = "/api/content";
    };

    forceLocalApi();
    WebsiteEnvironmentHelper.init();
    forceLocalApi();

    ApiHelper.apiConfigs = ApiHelper.apiConfigs.map(c => {
      const byKey: Record<string, string> = {
        AttendanceApi: "/api/attendance",
        DoingApi: "/api/doing",
        GivingApi: "/api/giving",
        MembershipApi: "/api/membership",
        ReportingApi: "/api/reporting",
        MessagingApi: "/api/messaging",
        ContentApi: "/api/content",
        AskApi: "/api/ask"
      };
      const mapped = byKey[c.keyName];
      if (mapped) return { ...c, url: mapped };
      return c.url?.includes("churchapps.org") ? { ...c, url: c.url.replace(/^https:\/\/api\.churchapps\.org/, "/api") } : c;
    });

    ApiHelper.apiConfigs.push(
      {
        keyName: "ReportingApi",
        url: EnvironmentHelper.Common.ReportingApi,
        jwt: "",
        permissions: []
      },
      {
        keyName: "LessonsApi",
        url: EnvironmentHelper.LessonsApi,
        jwt: "",
        permissions: []
      },
      {
        keyName: "AskApi",
        url: EnvironmentHelper.Common.AskApi,
        jwt: "",
        permissions: []
      }
    );

    await Locale.init([`/locales/{{lng}}.json?v=1`, `/apphelper/locales/{{lng}}.json`]);
  };

  static initLocal = async () => { };

  static initDev = () => {
    // Set all API URLs directly - do NOT call initStaging() as it sets ChurchApps URLs
    EnvironmentHelper.Common.AttendanceApi = process.env.REACT_APP_ATTENDANCE_API || "/api/attendance";
    EnvironmentHelper.Common.DoingApi = process.env.REACT_APP_DOING_API || "/api/doing";
    EnvironmentHelper.Common.GivingApi = process.env.REACT_APP_GIVING_API || "/api/giving";
    EnvironmentHelper.Common.MembershipApi = process.env.REACT_APP_MEMBERSHIP_API || "/api/membership";
    EnvironmentHelper.Common.ReportingApi = process.env.REACT_APP_REPORTING_API || "/api/reporting";
    EnvironmentHelper.Common.MessagingApi = process.env.REACT_APP_MESSAGING_API || "/api/messaging";
    EnvironmentHelper.Common.MessagingApiSocket = process.env.REACT_APP_MESSAGING_API_SOCKET || "wss://admin.lifereformationcentre.org/ws";
    EnvironmentHelper.Common.ContentApi = process.env.REACT_APP_CONTENT_API || "/api/content";
    EnvironmentHelper.Common.AskApi = process.env.REACT_APP_ASK_API || "/api/ask";
    EnvironmentHelper.Common.GoogleAnalyticsTag = process.env.REACT_APP_GOOGLE_ANALYTICS || "G-47N4XQJQJ5";
    EnvironmentHelper.Common.ContentRoot = process.env.REACT_APP_CONTENT_ROOT || "/api/content";
    EnvironmentHelper.Common.B1Root = process.env.REACT_APP_B1_WEBSITE_URL || "https://admin.lifereformationcentre.org";
    EnvironmentHelper.Common.B1AdminRoot = process.env.REACT_APP_B1_WEBSITE_URL || "https://admin.lifereformationcentre.org";
    EnvironmentHelper.Common.LessonsRoot = "https://lessons.church";
    EnvironmentHelper.LessonsApi = process.env.REACT_APP_LESSONS_API || "https://api.lessons.church";
    EnvironmentHelper.B1Url = process.env.REACT_APP_B1_WEBSITE_URL || "https://admin.lifereformationcentre.org";
  };

  //NOTE: None of these values are secret.
  static initStaging = () => {
    EnvironmentHelper.LessonsApi = "https://api.lifereformationcentre.org/lessons";
    EnvironmentHelper.B1Url = "https://{subdomain}.lifereformationcentre.org";
  };

  //NOTE: None of these values are secret.
  static initProd = () => {
    EnvironmentHelper.Common.GoogleAnalyticsTag = "G-47N4XQJQJ5";
    EnvironmentHelper.LessonsApi = "https://api.lessons.church";
    EnvironmentHelper.B1Url = process.env.REACT_APP_B1_WEBSITE_URL || "https://{subdomain}.lifereformationcentre.org";
  };
}
