import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) {}

  getWeather(cityName: string) {
    return this.http.get('https://api.openweathermap.org/data/2.5/weather?appid={your api key}&q=' + cityName + '&units=metric');
  }

  getForecast(cityName: string) {
    return this.http.get('https://api.openweathermap.org/data/2.5/forecast?appid={your api key}&q=' + cityName + '&units=metric');
  }

  getJSON(): any {
    return this.http.get('../../assets/data/cities-fr.json');
  }

}
