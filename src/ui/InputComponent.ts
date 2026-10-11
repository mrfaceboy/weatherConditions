import { IInputDeligate } from "./intefaces/IInputDeligate";
import { RenderComponent } from "./RenderComponent";

export abstract class InputComponent extends RenderComponent{

    labelDiv:HTMLDivElement;
    inputContainer:HTMLDivElement;
    sendButton:HTMLButtonElement;
    constructor(label:string, public deligate:IInputDeligate){
        super('inputComponent');
        this.labelDiv = document.createElement('div');
        this.labelDiv.innerText = label;
        this.labelDiv.classList.add('inputLabel')
        this.inputContainer = document.createElement('div');
        this.inputContainer.classList.add('inputContainer')
        this.sendButton = document.createElement('button');
        this.sendButton.classList.add('submit');
        this.sendButton.innerText = 'Submit';
        this.root.append(this.labelDiv,this.inputContainer,this.sendButton);
        this.buildHtml();
    }

    abstract buildHtml():void

    protected buildInputHtml(label:string){
        let root = document.createElement('div');
        root.classList.add('inputPoint')
        let labelElement = document.createElement('span');
        labelElement.innerText = label;
        let inputElement = document.createElement('input');
        inputElement.placeholder = label;
        root.append(labelElement,inputElement);
        return {root,inputElement};
    }

    reset(){

    }
}