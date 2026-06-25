import { CommonEnvironmentHelper, ApiHelper, Locale } from "@churchapps/apphelper";
import { EnvironmentHelper as WebsiteEnvironmentHelper } from "@churchapps/apphelper/dist/website/helpers/EnvironmentHelper.js";

export class EnvironmentHelper {
  private static LessonsApi = "";
  static B1Url = "";
  static ChurchAppsUrl = "";

  static get Common() { return CommonEnvironmentHelper; }

  static init = async () => {
    const stage = process.env.REACT_APP_STAGE;

    switch (stage) {
      case "demo": EnvironmentHelper.initDemo(); break;
      case "staging": EnvironmentHelper.initStaging(); break;
      case "prod": 
        // For production, use initDev() which sets relative /api paths
        // This allows nginx to proxy to our local API
        EnvironmentHelper.initDev();
        break;
      default: EnvironmentHelper.initDev(); break;
    }
    EnvironmentHelper.Common.init(stage);

    // Inlined from apphelper/website EnvironmentHelper.init() — that helper crashes
    // here because its internal `Common` reference is undefined (circular import with
    // apphelper main snapshots the binding before it initializes).
    ApiHelper.apiConfigs = [
      { keyName: "MembershipApi", url: CommonEnvironmentHelper.MembershipApi, jwt: "", permissions: [] },
      { keyName: "AttendanceApi", url: CommonEnvironmentHelper.AttendanceApi, jwt: "", permissions: [] },
      { keyName: "MessagingApi", url: CommonEnvironmentHelper.MessagingApi, jwt: "", permissions: [] },
      { keyName: "ContentApi", url: CommonEnvironmentHelper.ContentApi, jwt: "", permissions: [] },
      { keyName: "GivingApi", url: CommonEnvironmentHelper.GivingApi, jwt: "", permissions: [] },
      { keyName: "DoingApi", url: CommonEnvironmentHelper.DoingApi, jwt: "", permissions: [] },
      { keyName: "ReportingApi", url: CommonEnvironmentHelper.ReportingApi, jwt: "", permissions: [] },
      { keyName: "LessonsApi", url: EnvironmentHelper.LessonsApi, jwt: "", permissions: [] },
      { keyName: "AskApi", url: CommonEnvironmentHelper.AskApi, jwt: "", permissions: [] }
    ];
    WebsiteEnvironmentHelper.Common = CommonEnvironmentHelper;
    WebsiteEnvironmentHelper.hasInit = true;

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
    EnvironmentHelper.Common.B1Root = process.env.REACT_APP_B1_WEBSITE_URL || "https://portal.lifereformationcentre.org";
    EnvironmentHelper.Common.B1AdminRoot = process.env.REACT_APP_B1_ADMIN_URL || "https://admin.lifereformationcentre.org";
    EnvironmentHelper.Common.LessonsRoot = process.env.REACT_APP_LESSONS_URL || "https://lessons.lifereformationcentre.org";
    EnvironmentHelper.LessonsApi = process.env.REACT_APP_LESSONS_API || "https://api.lifereformationcentre.org/lessons";
    EnvironmentHelper.B1Url = process.env.REACT_APP_B1_WEBSITE_URL || "https://admin.lifereformationcentre.org";
  };

  //NOTE: None of these values are secret.
  static initDemo = () => {
    EnvironmentHelper.initStaging();
    EnvironmentHelper.B1Url = "https://{subdomain}.demosite.b1.church";
  };

  //NOTE: None of these values are secret.
  static initStaging = () => {
    EnvironmentHelper.LessonsApi = "https://api.lifereformationcentre.org/lessons";
    EnvironmentHelper.B1Url = "https://{subdomain}.lifereformationcentre.org";
  };

  //NOTE: None of these values are secret.
  static initProd = () => {
    EnvironmentHelper.Common.GoogleAnalyticsTag = "G-47N4XQJQJ5";
    EnvironmentHelper.LessonsApi = "https://api.lifereformationcentre.org/lessons";
    EnvironmentHelper.B1Url = process.env.REACT_APP_B1_WEBSITE_URL || "https://{subdomain}.lifereformationcentre.org";
  };
}
