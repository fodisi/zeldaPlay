import { HttpService, Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { tap } from 'rxjs/operators';
import { MyLogger } from '../logger/logger.service';

@Injectable()
export class WebhooksService {
  constructor(private readonly http: HttpService) {}

  herokuWebhook(herokuHMACKey: string, payload: any): void {
    console.log(payload);
    if (this.checkValidity(herokuHMACKey, payload)) {
    }
    this.http
      .post(process.env.DISCORD_WEBHOOK, {
        content:
          payload.action.toUpperCase() +
          ' caused by ' +
          payload.actor.email +
          ' for app ' +
          payload.data.app.name +
          '.'
      })
      .pipe(
        tap((data) => {
          MyLogger.debug(data.data, WebhooksService.name);
        })
      )
      .subscribe();
  }

  checkValidity(herokuHMACKey: string, payload: any): boolean {
    const hmac = createHmac('SHA256', process.env.WEBHOOK_SIGNATURE)
      .update(JSON.stringify(payload), 'utf8')
      .digest('hex');
    console.log('hmac', hmac, 'herokuHmac', herokuHMACKey);
    return hmac === herokuHMACKey;
  }
}
