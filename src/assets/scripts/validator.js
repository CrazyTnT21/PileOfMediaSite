import {Config, DateStyle} from "./config.js";

export default class validator
{
  static date(value, dateStyle = Config.dateStyle)
  {
    //(?<=^\s*) - Only allow start or start with whitespaces after
    //(3[0-1]|[1-2][0-9]|0?[1-9]) - Match day
    //[.\/\-] - Separator
    //(1[0-2]|0[1-9]|[1-9]) - Match month
    //[.\/\-] - Separator
    //(19|20)[0-9]{2} - Match years from 1900 to 2099
    //(?=\s*$) - Only allow end or end with whitespaces before
    if (dateStyle === DateStyle.eu)
      return new RegExp(/(?<=^\s*)(3[0-1]|[1-2][0-9]|0?[1-9])[.\/\-](1[0-2]|0[1-9]|[1-9])[.\/\-](19|20)[0-9]{2}(?=\s*$)/).test(value);

    if (dateStyle === DateStyle.us)
      return new RegExp(/(?<=^\s*)(1[0-2]|0[1-9]|[1-9])[.\/\-](3[0-1]|[1-2][0-9]|0?[1-9])[.\/\-](19|20)[0-9]{2}(?=\s*$)/).test(value);
    return new RegExp(/(?<=^\s*)(19|20)[0-9]{2}[.\/\-](1[0-2]|0[1-9]|[1-9])[.\/\-](3[0-1]|[1-2][0-9]|0?[1-9])(?=\s*$)/).test(value);
  }
}
