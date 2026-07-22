import { ChangeWindow } from '../../types/change-window';

export class ChangeWindowService {
  public getActiveWindows(): ChangeWindow[] {
    return [
      {
        id: `win-${Date.now()}`,
        type: "DeploymentWindow",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        isActive: true,
        reason: "Standard Business Hours"
      }
    ];
  }
}
