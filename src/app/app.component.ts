import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'WeatherApp';
  yearNow = new Date().getFullYear().toString();
  appTitle = 'Weather App';

  constructor() { }

}
