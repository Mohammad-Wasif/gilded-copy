import { Request, Response } from 'express';
import { AdminSettingsService } from './admin-settings.service';

const settingsService = new AdminSettingsService();

export class AdminSettingsController {
  async getSetting(req: Request, res: Response) {
    try {
      const key = req.params.key as string;
      const setting = await settingsService.getSetting(key);
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      return res.status(200).json(setting);
    } catch (error) {
      console.error('Error fetching setting:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateSetting(req: Request, res: Response) {
    try {
      const key = req.params.key as string;
      const { value } = req.body;
      
      if (value === undefined || value === null) {
        return res.status(400).json({ error: 'Value is required' });
      }

      const setting = await settingsService.updateSetting(key, typeof value === 'string' ? value : JSON.stringify(value));
      return res.status(200).json(setting);
    } catch (error) {
      console.error('Error updating setting:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
