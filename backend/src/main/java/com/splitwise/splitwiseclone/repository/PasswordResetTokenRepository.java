package com.splitwise.splitwiseclone.repository;

import com.splitwise.splitwiseclone.entity.PasswordResetToken;
import com.splitwise.splitwiseclone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUser(User user);
}
