import { envVarKeys } from './env-var-key';
import { EnvironmentVariableName, IEnvironmentVariables } from './env-var.type';

export class EnvironmentVariableUtil {
  private envVars: NodeJS.ProcessEnv;
  private envVarDictionary: IEnvironmentVariables | null;

  private static instance: EnvironmentVariableUtil;

  private constructor() {
    this.envVars = process.env;
    this.envVarDictionary = null;
  }

  public constructEnvironmentVariables(): IEnvironmentVariables {
    if (this.envVarDictionary) return this.envVarDictionary;

    const result = {} as IEnvironmentVariables;

    Object.entries(envVarKeys).forEach(([label, key]) => {
      const value = this.envVars[key];
      Object.assign(result, { [label]: value ?? '' });
    });

    this.envVarDictionary = result;

    return result;
  }

  public static getEnvVarList(): IEnvironmentVariables {
    const instance = this.getInstance();
    return instance.constructEnvironmentVariables();
  }

  public static getEnvVar(name: EnvironmentVariableName): string {
    const envVarDictionary = this.getEnvVarList();
    return envVarDictionary[name];
  }

  private static getInstance() {
    if (!this.instance) this.instance = new EnvironmentVariableUtil();

    return this.instance;
  }
}
