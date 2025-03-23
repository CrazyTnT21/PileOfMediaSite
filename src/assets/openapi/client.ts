import createClient from "openapi-fetch";
import {paths} from "pileofmedia-openapi";
import {API_URL} from "../scripts/modules";

export const apiClient = createClient<paths>({baseUrl: API_URL});
