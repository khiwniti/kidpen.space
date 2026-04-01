// Environment mode types
export enum EnvMode {
  LOCAL = 'local',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

// Configuration object
interface Config {
  ENV_MODE: EnvMode;
  IS_LOCAL: boolean;
  IS_STAGING: boolean;
}

function getEnvironmentMode(): EnvMode {
  const envMode = process.env.NEXT_PUBLIC_ENV_MODE?.toUpperCase();
  switch (envMode) {
    case 'LOCAL':
      return EnvMode.LOCAL;
    case 'STAGING':
      return EnvMode.STAGING;
    case 'PRODUCTION':
      return EnvMode.PRODUCTION;
    default:
      return EnvMode.LOCAL;
  }
}

const currentEnvMode = getEnvironmentMode();

export const config: Config = {
  ENV_MODE: currentEnvMode,
  IS_LOCAL: currentEnvMode === EnvMode.LOCAL,
  IS_STAGING: currentEnvMode === EnvMode.STAGING,
};

export const isLocalMode = (): boolean => {
  return config.IS_LOCAL;
};

export const isStagingMode = (): boolean => {
  return config.IS_STAGING;
};

export const isProductionMode = (): boolean => {
  return config.ENV_MODE === EnvMode.PRODUCTION;
};
