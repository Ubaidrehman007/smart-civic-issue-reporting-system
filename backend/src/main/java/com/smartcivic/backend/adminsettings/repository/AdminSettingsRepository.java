package com.smartcivic.backend.adminsettings.repository;

import com.smartcivic.backend.adminsettings.entity.AdminSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AdminSettingsRepository
        extends JpaRepository<AdminSettings, UUID> {

    Optional<AdminSettings> findTopByOrderByCreatedAtAsc();
}