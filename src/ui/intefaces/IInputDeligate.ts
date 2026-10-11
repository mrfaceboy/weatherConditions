import { WeatherData } from "../../services/ServicesData";

export interface IInputDeligate{
    onAppWeatherRequest():void
    onAppWeatherResponse(data:WeatherData | null):void
}