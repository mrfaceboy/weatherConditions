import { WeatherServices } from "../services/WeatherServices";
import { InputComponent } from "./InputComponent";
import { IInputDeligate } from "./intefaces/IInputDeligate";

export class GeoInputComponent extends InputComponent{
    constructor(deligate:IInputDeligate){
        super('Search by Geo Location',deligate);
        
    }

    buildHtml(): void {

        let lonInput = this.buildInputHtml('Longitude');
        let latInput = this.buildInputHtml('Latitude');
        this.inputContainer.append(lonInput.root,latInput.root);
        this.sendButton.onclick = () => {
            
            this.deligate.onAppWeatherRequest();
            WeatherServices.getCurrentWeatherByGeo(
                lonInput.inputElement.value, 
                latInput.inputElement.value).then((data) => {
                    this.deligate.onAppWeatherResponse(data)
                , () =>{
                    this.deligate.onAppWeatherResponse(null)
                }})
        }

    }


}