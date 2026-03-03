// ─── Product Image ───
export interface ProductImageDto {
    id: number;
    url: string;
    altText: string;
    isPrimary: boolean;
    displayOrder: number;
}

// ─── Product Response (public) ───
export interface ProduitResponseDto {
    id: number;
    nom: string;
    descriptionCourte: string;
    descriptionDetaillee: string;
    prix: number;
    prixPromo: number | null;
    quantiteStock: number;
    statutProduit: string;
    categorieId: number;
    categorieNom: string;
    categorieSlug: string;
    tags: string;
    deliveryOption: string;
    noteMoyenne: number;
    nombreAvis: number;
    compteurVues: number;
    nombreVentes: number;
    primaryImageUrl: string;
    images: ProductImageDto[];
    boutiqueId: number;
    boutiqueNom: string;
    typeActivite: string;
    createdAt: string;
}

// ─── Merchant Product (extends response with private fields) ───
export interface ProduitMerchantDto extends ProduitResponseDto {
    sku: string;
    poidsProduit: number;
    dimensions: string;
}

// ─── Product Request (create/update) ───
export interface ProduitRequestDto {
    nom: string;
    descriptionCourte: string;
    descriptionDetaillee: string;
    prix: number;
    prixPromo?: number | null;
    quantiteStock: number;
    categorieId: number;
    tags?: string;
    sku?: string;
    deliveryOption?: string;
    statutProduit?: string;
    poidsProduit?: number;
    dimensions?: string;
}

// ─── Filter Request ───
export interface ProductFilterRequest {
    keyword?: string;
    categorieId?: number;
    minPrice?: number;
    maxPrice?: number;
    merchantType?: string;
    sort?: string;
    page?: number;
    size?: number;
}

// ─── Page Response ───
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}
