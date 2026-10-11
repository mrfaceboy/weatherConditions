import { RenderComponent } from "./RenderComponent";

export class dataComponent extends RenderComponent{

    dataElement:HTMLDivElement;
    labelElement:HTMLDivElement;

    constructor(public dataPoint:string){
        super('dataComponent');
        
        this.labelElement = document.createElement('div');
        this.labelElement.classList.add('dataLabel');
        this.labelElement.innerText = dataPoint
        this.dataElement = document.createElement('div');
        this.root.append(this.labelElement,this.dataElement);
    }

    clearData(){
        this.dataElement.innerText = '';
    }

    setData(value:any){
        if(value !== null && typeof value === 'object'){
            for(let [key, subValue] of Object.entries(value)){
                let subData = new dataComponent(key);
                subData.setData(subValue);
                this.dataElement.append(subData.root);
            }
        }
        else{
            this.dataElement.innerText = String(value);
        }
    }
}