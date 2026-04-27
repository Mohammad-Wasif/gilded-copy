import { db } from '../../config/db';

export class AdminSettingsService {
  async getSetting(key: string) {
    const setting = await db.setting.findUnique({
      where: { key },
    });
    return setting;
  }

  async updateSetting(key: string, value: string) {
    const setting = await db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return setting;
  }
}
