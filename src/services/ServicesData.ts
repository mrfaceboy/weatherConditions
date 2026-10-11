export interface GEOData{
    name:string,
    local_names?:Record<string, string>,
    lat:number,
    lon:number,
    country:string,
    state?:string
}

export interface WeatherCondition{
  id:number,
  main:string,
  description:string,
  icon:string
}

export interface Precipitation{
  "1h":number
}

export interface WeatherDataPoint{
  dt:number,
  sunrise?:number,
  sunset?:number,
  temp:number,
  feels_like:number,
  pressure:number,
  humidity:number,
  dew_point:number,
  uvi?:number,
  clouds:number,
  visibility?:number,
  wind_speed:number,
  wind_deg:number,
  wind_gust?:number,
  rain?:Precipitation,
  snow?:Precipitation,
  weather:WeatherCondition[],
  alerts?:string[]
}

export interface WeatherData{
  lat:number,
  lon:number,
  timezone:string,
  timezone_offset:number,
  data:WeatherDataPoint[]
}
