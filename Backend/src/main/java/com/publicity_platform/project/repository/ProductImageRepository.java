package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProduitIdOrderByDisplayOrderAsc(Long produitId);

    Optional<ProductImage> findByProduitIdAndIsPrimaryTrue(Long produitId);

    void deleteByIdAndProduitId(Long imageId, Long produitId);
}
