import { envVarKeys } from "./env-var-key";

export type IEnvironmentVariables = Record<keyof typeof envVarKeys, string>;

export type EnvironmentVariableName = keyof typeof envVarKeys;
