package com.splitwise.splitwiseclone.repository;

import com.splitwise.splitwiseclone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    java.util.List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
}
