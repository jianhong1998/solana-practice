'use server';

export const getAppMode = async (): Promise<string> => {
  const appMode = process.env.APP_MODE ?? 'dev';
  return appMode;
};
