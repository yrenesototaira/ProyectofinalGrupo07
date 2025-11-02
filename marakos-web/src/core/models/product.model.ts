export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface Product {
    id: number;
    code: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    pictureUrl: string | null;
    status: string;
    active: boolean;
    category: Category;
}
