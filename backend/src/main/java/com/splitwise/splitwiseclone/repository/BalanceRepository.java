package com.splitwise.splitwiseclone.repository;

import com.splitwise.splitwiseclone.entity.Balance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BalanceRepository extends JpaRepository<Balance, Long> {

    @Query("SELECT b FROM Balance b WHERE b.fromUserId = :userId OR b.toUserId = :userId")
    List<Balance> findByUserId(@Param("userId") Long userId);

    List<Balance> findByGroupId(Long groupId);

    Optional<Balance> findByFromUserIdAndToUserIdAndGroupId(Long fromUserId, Long toUserId, Long groupId);

    @Query("SELECT b FROM Balance b WHERE (b.fromUserId = :userId OR b.toUserId = :userId) AND b.groupId = :groupId")
    List<Balance> findByUserIdAndGroupId(@Param("userId") Long userId, @Param("groupId") Long groupId);

    void deleteByGroupId(Long groupId);
}
