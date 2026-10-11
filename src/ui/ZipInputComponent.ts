import { WeatherServices } from "../services/WeatherServices";
import { InputComponent } from "./InputComponent";
import { IInputDeligate } from "./intefaces/IInputDeligate";

export class ZipInputComponent extends InputComponent{
    constructor(deligate:IInputDeligate){
        super('Search by Zipcode',deligate);
        
    }

    buildHtml(): void {

        let zipInput = this.buildInputHtml('Zipcode');
        let countryInput = this.buildInputHtml('CountryCode');
        this.inputContainer.append(zipInput.root,countryInput.root);
        this.sendButton.onclick = () => {
            
            this.deligate.onAppWeatherRequest();
            WeatherServices.getCurrentWeatherByZip(
                zipInput.inputElement.value, 
                countryInput.inputElement.value,).then((data) => {
                    this.deligate.onAppWeatherResponse(data)
                , () =>{
                    this.deligate.onAppWeatherResponse(null)
                }})
        }

    }
}