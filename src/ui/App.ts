import { IInputDeligate } from "./intefaces/IInputDeligate";
import { CityInputComponent } from "./CityInputComponent";
import { InputComponent } from "./InputComponent";
import { RenderComponent } from "./RenderComponent";
import { ZipInputComponent } from "./ZipInputComponent";
import { GeoInputComponent } from "./GeoIinputComponent";
import { dataComponent } from "./dataComponent";

export class App extends RenderComponent implements IInputDeligate{

    inputs:InputComponent[] = [];
    dataContainer:HTMLDivElement;
    inputContainer:HTMLDivElement;
    constructor(){
        super('weather');
        this.inputContainer = document.createElement('div');
        this.inputContainer.classList.add('locationinputs');
        this.dataContainer = document.createElement('div');
        this.dataContainer.classList.add('dataContainer');
        this.root.append(this.inputContainer,this.dataContainer);
    }
    init(){
        let cityInput = new CityInputComponent(this);
        let zipInput = new ZipInputComponent(this);
        let geoInput = new GeoInputComponent(this);
        this.inputContainer.append(cityInput.root,zipInput.root, geoInput.root);
        this.inputs.push(cityInput,zipInput,geoInput);
    }

    onAppWeatherResponse(data:any){
        for(let input of this.inputs){
            input.sendButton.disabled = false;
        }
        console.log(data);
        for(let dataKey in data){
            if(data[dataKey] == null) continue;
            else{
                let dataComp = new dataComponent(dataKey);
                dataComp.setData(data[dataKey]);
                this.dataContainer.append(dataComp.root);
            }
        }
    }

    onAppWeatherRequest(){
        for(let input of this.inputs){
            input.sendButton.disabled = true;
        }
        this.dataContainer.innerHTML = '';
    }
}

