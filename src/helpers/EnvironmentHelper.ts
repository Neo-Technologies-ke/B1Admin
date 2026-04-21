import { CommonEnvironmentHelper, ApiHelper, Locale } from "@churchapps/apphelper";
import { EnvironmentHelper as WebsiteEnvironmentHelper } from "@churchapps/apphelper-website";

export class EnvironmentHelper {
  private static LessonsApi = "";
  static B1Url = "";
  static ChurchAppsUrl = "";
  static Common = CommonEnvironmentHelper;

  static init = async () => {
    const stage = process.env.REACT_APP_STAGE;

    // Call WebsiteEnvironmentHelper.init() first so its internal hasInit guard
    // fires and it can never run again to overwrite our URLs.
    WebsiteEnvironmentHelper.init();

    // Now apply our URLs — these will not be overwritten by WebsiteEnvironmentHelper.
    EnvironmentHelper.initDev();

    // For prod, nginx proxies /api/* locally so switch to relative paths.
    if (stage === "prod") {
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
    }

    // Rebuild ApiHelper.apiConfigs from our authoritative URLs.
    ApiHelper.apiConfigs = [
      { keyName: "AttendanceApi", url: EnvironmentHelper.Common.AttendanceApi, jwt: "", permissions: [] },
      { keyName: "DoingApi", url: EnvironmentHelper.Common.DoingApi, jwt: "", permissions: [] },
      { keyName: "GivingApi", url: EnvironmentHelper.Common.GivingApi, jwt: "", permissions: [] },
      { keyName: "MembershipApi", url: EnvironmentHelper.Common.MembershipApi, jwt: "", permissions: [] },
      { keyName: "MessagingApi", url: EnvironmentHelper.Common.MessagingApi, jwt: "", permissions: [] },
      { keyName: "ContentApi", url: EnvironmentHelper.Common.ContentApi, jwt: "", permissions: [] },
    ];

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
    EnvironmentHelper.Common.LessonsRoot = "https://lessons.lifereformationcentre.org";
    EnvironmentHelper.LessonsApi = process.env.REACT_APP_LESSONS_API || "https://api.lifereformationcentre.org/lessons";
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
    EnvironmentHelper.LessonsApi = "https://api.lifereformationcentre.org/lessons";
    EnvironmentHelper.B1Url = process.env.REACT_APP_B1_WEBSITE_URL || "https://{subdomain}.lifereformationcentre.org";
  };
}
