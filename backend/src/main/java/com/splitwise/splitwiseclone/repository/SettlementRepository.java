package com.splitwise.splitwiseclone.repository;

import com.splitwise.splitwiseclone.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    @Query("SELECT s FROM Settlement s WHERE s.fromUserId = :userId OR s.toUserId = :userId")
    List<Settlement> findByUserId(@Param("userId") Long userId);

    List<Settlement> findByGroupId(Long groupId);

    @Query("SELECT s FROM Settlement s WHERE (s.fromUserId = :userId OR s.toUserId = :userId) AND s.groupId = :groupId")
    List<Settlement> findByUserIdAndGroupId(@Param("userId") Long userId, @Param("groupId") Long groupId);
}
