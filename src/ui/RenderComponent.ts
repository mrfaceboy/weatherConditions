export class RenderComponent{
    root:HTMLDivElement
    constructor(rootClass:string){
        this.root = document.createElement('div');
        this.root.classList.add(rootClass);
    }
}