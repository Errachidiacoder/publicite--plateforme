package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);

    java.util.List<Role> findAllByNameIn(java.util.Collection<String> names);
}
