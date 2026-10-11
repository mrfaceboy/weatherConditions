import { GEOData, WeatherData } from "./ServicesData";
import { ServicesUrls } from "./ServicesUrls";

export class WeatherServices{

    static readonly APIKEY = '846775e1cf60749b81a4f29871bb0f3d';
    // static readonly APIKEY = 'cf002751564a4c78f5f7ed479f1b9ba3';
    static async getCurrentWeatherByZip(zip:string,countrycode:string){
        let search =  `?zip=${zip},${countrycode}&appid=${WeatherServices.APIKEY}`
        let url = `${ServicesUrls.WEATHER_GEO}/zip${search}`;
        return await this.getCurrentWeatherFromGeoUrl(url);
    }
    static async getCurrentWeatherByCity(city:string,countrycode:string,stateCode?:string){
        let search = stateCode ? `?q=${city},${stateCode},${countrycode}&appid=${WeatherServices.APIKEY}` :
            `?q=${city},${countrycode}&appid=${WeatherServices.APIKEY}`
        let url = `${ServicesUrls.WEATHER_GEO}/direct${search}`;
        return await this.getCurrentWeatherFromGeoUrl(url);
    }

    static async getCurrentWeatherByGeo(lon:string,lat:string){
        let url = `${ServicesUrls.WEATHER_GEO}/reverse?lat=${lat}&lon=${lon}&appid=${WeatherServices.APIKEY}`;
        let reverseSearchData = await fetch(url);
        if(reverseSearchData.ok){
            let reverseSearchJSON = await reverseSearchData.json()
            return await this.getCurrentWeather(reverseSearchJSON[0].lon, reverseSearchJSON[0].lat)
        }
        else{
            return null;
        }
        
    }

    static async getCurrentWeatherFromGeoUrl(url:string){
        try{
            let response = await fetch(url);
            if(response.ok){
                let geo:GEOData[] | GEOData = await response.json();
                if(Array.isArray(geo)){
                    return await this.getCurrentWeather(geo[0].lon,geo[0].lat)
                }
                return await this.getCurrentWeather(geo.lon,geo.lat)
                
            }
            else{
                //TODO potential show error message
                console.error('error fatching data', response.body);
                return null;
            }
        } catch(e){
            console.error('error fetching data', e);
            return null;
            
        }
    }

    static async getCurrentWeather(lon:number, lat:number):Promise<WeatherData | null>{
        let url = `${ServicesUrls.WEATHER_DATA}?lat=${lat}&lon=${lon}&appid=${WeatherServices.APIKEY}&units=imperial`;
        try{
            let response = await fetch(url);
            if(response.ok){
                return await response.json();
            }
            else{
                //TODO potential show error message
                console.error('error fatching data', response.body);
                return null;
            }
        } catch(e){
            console.error('error fetching data', e);
            return null;
            
        }
    }
}