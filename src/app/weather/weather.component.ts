import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { WeatherService } from './../services/weather.service';
import { City } from '../modele/city';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})

export class WeatherComponent implements OnInit {

  public weatherSearchForm: FormGroup;
  public weatherData: any;
  public forecastData: any;

  cities: City[];
  selected: City;
  cityForm: FormGroup;
  weatherIcon: string;
  tempMax: number;
  tempMin: number;
  loaded = false;
  pngUrl: string;

  forecastArray = new Array ();

  constructor( private weatherService: WeatherService,
               private fB: FormBuilder,
               private spinner: NgxSpinnerService ) {
      this.getCities();
  }
  ngOnInit(): void {
    if (!this.loaded) {
      this.spinner.show();
    }
  }

  getCities() {
    this.weatherService.getJSON().subscribe(data => {
      if (data) {
        // extract all from setTimeOut in production
        setTimeout(() => {
          // ends after 1 second
          this.cities = data as City[];
          this.selected = this.cities[0];
          this.initCityForm(this.cities[0]);
          this.getMeteobyCityName(this.selected.nm);
          this.getForecastByCityName(this.selected.nm);
          this.spinner.hide();
        }, 1000);
      }
    });
  }

  initCityForm(city: City): void {
    this.cityForm = this.fB.group({
      cityControl: [city]
    });
  }

  onSelectChange(): void {
    this.loaded = !this.loaded;
    this.spinner.show();
    if (this.loaded === false) {
      // extract all from setTimeOut in production
      setTimeout(() => {
        // ends after 1 second
        this.selected = this.cityForm.controls.cityControl.value;
        this.getMeteobyCityName(this.selected.nm);
        this.getForecastByCityName(this.selected.nm);
        this.spinner.hide();
      }, 1000);
    }
  }

  getMeteobyCityName(cityName: string): void {
    this.weatherService.getWeather(cityName).subscribe(data => {
      this.weatherData = data;
      this.weatherIcon = 'wi-icon-' + this.weatherData.weather[0].id;
      this.createPngUrl(this.weatherData.weather[0].icon);
    });
  }

  getForecastByCityName(cityName: string): void {
    // clean the three days list
    this.forecastArray.length = 0;

    this.weatherService.getForecast(cityName).subscribe(data => {
      this.forecastData = data;
      this.getMaxFromArray(this.forecastData.list);
      this.getMinFromArray(this.forecastData.list);
      this.getThreeDayData(this.forecastData.list);
      this.loaded = true;
    });
  }

  getMaxFromArray(list: any): number {
    const listTempMax = new Array();
    let result: number;
    list.forEach(element => {
      const tempMax = element.main.temp_max;
      listTempMax.push(tempMax);
    });
    this.tempMax = Math.max(...listTempMax);
    result = this.tempMax;
    return result;
  }

  getMinFromArray(list: any): number {
    const listTempMin = new Array();
    let result: number;
    list.forEach(element => {
      const tempMin = element.main.temp_min;
      listTempMin.push(tempMin);
    });
    this.tempMin = Math.min(...listTempMin);
    result = this.tempMin;
    return result;
  }

  getDatefromString(str: string): Date {
    const initDateTimeFromQuery = str.split(' ');
    const dateTimeFromQuery = initDateTimeFromQuery[0] + 'T' + initDateTimeFromQuery[1];
    const dateFromQuery = new Date(dateTimeFromQuery);
    return dateFromQuery;
  }

  getThreeDayData(list: any) {

    // Array by day
    const listFirstDay = new Array();
    const listSecondDay = new Array();
    const listThirdDay = new Array();

    const dateFromQuery = this.getDatefromString(list[0].dt_txt);

    // Iterate on each element to split into 3 array of days
    list.forEach(element => {

      const dateFromElement = this.getDatefromString(element.dt_txt);

      if (dateFromElement.getDate() >= (dateFromQuery.getDate() + 1)
          && dateFromElement.getDate() <= (dateFromQuery.getDate() + 3)) {

        if (dateFromElement.getDate() === (dateFromQuery.getDate() + 1)) {
          listFirstDay.push(element);
        }
        if (dateFromElement.getDate() === (dateFromQuery.getDate() + 2)) {
          listSecondDay.push(element);
        }
        if (dateFromElement.getDate() === (dateFromQuery.getDate() + 3)) {
          listThirdDay.push(element);
        }

      }
    });

    const firstDayObj = {
      day: this.getDayFromDay(dateFromQuery.getDay() + 1),
      tempMax: this.getMaxFromArray(listFirstDay),
      tempMin: this.getMinFromArray(listFirstDay),
      icon: this.getIconHighestOccurence(listFirstDay),
      png: this.getIconPngHighestOccurence(listFirstDay)
    };

    const secondDayObj = {
      day: this.getDayFromDay(dateFromQuery.getDay() + 2),
      tempMax: this.getMaxFromArray(listSecondDay),
      tempMin: this.getMinFromArray(listSecondDay),
      icon: this.getIconHighestOccurence(listSecondDay),
      png: this.getIconPngHighestOccurence(listSecondDay)
    };

    const thirdDayObj = {
      day: this.getDayFromDay(dateFromQuery.getDay() + 3),
      tempMax: this.getMaxFromArray(listThirdDay),
      tempMin: this.getMinFromArray(listThirdDay),
      icon: this.getIconHighestOccurence(listThirdDay),
      png: this.getIconPngHighestOccurence(listThirdDay)
    };

    this.forecastArray.push(firstDayObj);
    this.forecastArray.push(secondDayObj);
    this.forecastArray.push(thirdDayObj);

  }

  getDayFromDay(day: number): string {
    if ( day === 1) {
      return 'Mon';
    }
    if ( day === 2) {
      return 'Tue';
    }
    if ( day === 3) {
      return 'Wen';
    }
    if ( day === 4) {
      return 'Thu';
    }
    if ( day === 5) {
      return 'Fri';
    }
    if ( day === 6) {
      return 'Sat';
    }
    if ( day === 7) {
      return 'Sun';
    }
  }

  getIconHighestOccurence(list: any): string {
    // Put all icon id in an array
    const iconList = new Array();
    list.forEach(element => {
      iconList.push(element.weather[0].id);
    });

    // filter on each element of the list
    const result = iconList.sort((a, b) =>
    list.filter(v => v === a).length
        - list.filter(v => v === b).length
    ).pop();
    return 'wi-icon-' + result;
  }

  getIconPngHighestOccurence(list: any): string {
    // Put all icon name in an array
    const iconPngList = new Array();
    list.forEach(element => {
      iconPngList.push(element.weather[0].icon);
    });

    // filter on each element of the list
    const result = iconPngList.sort((a, b) =>
    list.filter(v => v === a).length
        - list.filter(v => v === b).length
    ).pop();
    return 'http://openweathermap.org/img/wn/' + result + '@2x.png';
  }

  createPngUrl(iconName: string): void {
    this.pngUrl = 'http://openweathermap.org/img/wn/' + iconName + '@2x.png';
  }

}
