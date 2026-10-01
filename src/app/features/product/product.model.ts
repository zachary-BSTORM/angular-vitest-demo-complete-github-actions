export interface Product{
    id : number;
    name : string;
    description : string;
    price : number;
    quantity : number;
    image : string;

}

export interface CreateProduct {
    name : string;
    description : string;
    price : number;
    quantity : number;
    image : string;
}

export interface UpdateProduct {
    name : string;
    description : string;
    price : number;
    quantity : number;
    image : string;
}