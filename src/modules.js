//This file acts as a re-exporter for node modules

// export * as d3 from "d3";

// noinspection JSUnresolvedReference
export const API_URL = env.API_URL ?? `https://${location.hostname}/api/`;
