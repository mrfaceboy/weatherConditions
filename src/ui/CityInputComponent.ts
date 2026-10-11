import { WeatherServices } from "../services/WeatherServices";
import { InputComponent } from "./InputComponent";
import { IInputDeligate } from "./intefaces/IInputDeligate";

export class CityInputComponent extends InputComponent{
    constructor(deligate:IInputDeligate){
        super('Search by city',deligate);
        
    }

    buildHtml(): void {

        let cityInput = this.buildInputHtml('City');
        let stateInput = this.buildInputHtml('State');
        let countryInput = this.buildInputHtml('CountryCode');
        this.inputContainer.append(cityInput.root,stateInput.root,countryInput.root);
        this.sendButton.onclick = () => {
            
            this.deligate.onAppWeatherRequest();
            WeatherServices.getCurrentWeatherByCity(
                cityInput.inputElement.value, 
                countryInput.inputElement.value,
                stateInput.inputElement.value).then((data) => {
                    this.deligate.onAppWeatherResponse(data)
                , () =>{
                    this.deligate.onAppWeatherResponse(null)
                }})
        }

    }


}