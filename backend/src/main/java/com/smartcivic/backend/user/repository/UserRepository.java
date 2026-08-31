package com.smartcivic.backend.user.repository;

import com.smartcivic.backend.user.entity.AccountStatus;
import com.smartcivic.backend.user.entity.Role;
import com.smartcivic.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    boolean existsByEmail(String email);
     boolean existsByPhoneNumber(String phoneNumber);

    List<User> findByRole(Role role);

    List<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String fullName,
            String email
    );


    List<User> findByAccountStatus(AccountStatus accountStatus);



    List<User> findByRoleAndAccountStatus(
            Role role,
            AccountStatus accountStatus
    );

    long countByRole(Role role);

    long countByAccountStatus(AccountStatus accountStatus);
    @Query("""
        SELECT u
        FROM User u
        WHERE u.role = :role
          AND u.accountStatus = :accountStatus
        ORDER BY u.createdAt ASC
        """)
    List<User> findActiveWorkers(
            @Param("role") Role role,
            @Param("accountStatus") AccountStatus accountStatus
    );

}
