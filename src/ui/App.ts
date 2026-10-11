import { IInputDeligate } from "./intefaces/IInputDeligate";
import { WeatherData } from "../services/ServicesData";
import { CityInputComponent } from "./CityInputComponent";
import { InputComponent } from "./InputComponent";
import { RenderComponent } from "./RenderComponent";
import { ZipInputComponent } from "./ZipInputComponent";
import { GeoInputComponent } from "./GeoIinputComponent";

export class App extends RenderComponent implements IInputDeligate{

    inputs:InputComponent[] = [];
    constructor(){
        super('weather');
    }
    init(){
        let inputContainer = document.createElement('div');
        inputContainer.classList.add('locationinputs');
        this.root.append(inputContainer)
        let cityInput = new CityInputComponent(this);
        let zipInput = new ZipInputComponent(this);
        let geoInput = new GeoInputComponent(this);
        inputContainer.append(cityInput.root,zipInput.root, geoInput.root);
        this.inputs.push(cityInput,zipInput,geoInput);
    }

    onAppWeatherResponse(data:WeatherData){
        for(let input of this.inputs){
            input.sendButton.disabled = false;
        }
        console.log(data);
        //show the data
    }

    onAppWeatherRequest(){
        for(let input of this.inputs){
            input.sendButton.disabled = true;
        }
    }
}