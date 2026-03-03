import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    ProduitResponseDto,
    ProduitMerchantDto,
    ProduitRequestDto,
    ProductFilterRequest,
    ProductImageDto,
    PageResponse
} from '../models/produit.model';

@Injectable({
    providedIn: 'root'
})
export class MarketProductService {

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/api/v1';

    // ═══════════════════════════════════════════════════════
    // PUBLIC ENDPOINTS
    // ═══════════════════════════════════════════════════════

    searchProducts(filter: ProductFilterRequest): Observable<PageResponse<ProduitResponseDto>> {
        let params = new HttpParams();
        if (filter.keyword) params = params.set('keyword', filter.keyword);
        if (filter.categorieId) params = params.set('categorieId', filter.categorieId.toString());
        if (filter.minPrice != null) params = params.set('minPrice', filter.minPrice.toString());
        if (filter.maxPrice != null) params = params.set('maxPrice', filter.maxPrice.toString());
        if (filter.merchantType) params = params.set('merchantType', filter.merchantType);
        if (filter.sort) params = params.set('sort', filter.sort);
        if (filter.page != null) params = params.set('page', filter.page.toString());
        if (filter.size != null) params = params.set('size', filter.size.toString());

        return this.http.get<PageResponse<ProduitResponseDto>>(`${this.apiUrl}/produits`, { params });
    }

    getProductById(id: number): Observable<ProduitResponseDto> {
        return this.http.get<ProduitResponseDto>(`${this.apiUrl}/produits/${id}`);
    }

    getProductsByCategory(slug: string, page = 0, size = 20): Observable<PageResponse<ProduitResponseDto>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PageResponse<ProduitResponseDto>>(`${this.apiUrl}/produits/by-category/${slug}`, { params });
    }

    getFeaturedProducts(): Observable<ProduitResponseDto[]> {
        return this.http.get<ProduitResponseDto[]>(`${this.apiUrl}/produits/featured`);
    }

    // ═══════════════════════════════════════════════════════
    // MERCHANT ENDPOINTS
    // ═══════════════════════════════════════════════════════

    getMerchantProducts(page = 0, size = 20): Observable<PageResponse<ProduitMerchantDto>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PageResponse<ProduitMerchantDto>>(`${this.apiUrl}/merchant/produits`, { params });
    }

    createProduct(dto: ProduitRequestDto): Observable<ProduitResponseDto> {
        return this.http.post<ProduitResponseDto>(`${this.apiUrl}/merchant/produits`, dto);
    }

    updateProduct(id: number, dto: ProduitRequestDto): Observable<ProduitResponseDto> {
        return this.http.put<ProduitResponseDto>(`${this.apiUrl}/merchant/produits/${id}`, dto);
    }

    archiveProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/merchant/produits/${id}`);
    }

    changeStatut(id: number, statut: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/merchant/produits/${id}/statut`, { statut });
    }

    // ═══════════════════════════════════════════════════════
    // IMAGE ENDPOINTS
    // ═══════════════════════════════════════════════════════

    uploadImages(produitId: number, files: File[]): Observable<ProductImageDto[]> {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        return this.http.post<ProductImageDto[]>(`${this.apiUrl}/merchant/produits/${produitId}/images`, formData);
    }

    deleteImage(produitId: number, imageId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/merchant/produits/${produitId}/images/${imageId}`);
    }

    setPrimaryImage(produitId: number, imageId: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/merchant/produits/${produitId}/images/${imageId}/primary`, {});
    }
}
