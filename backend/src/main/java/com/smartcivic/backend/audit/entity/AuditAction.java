package com.smartcivic.backend.audit.entity;

public enum AuditAction {

    // =========================
    // AUTHENTICATION
    // =========================

    LOGIN,
    LOGOUT,
    PASSWORD_CHANGED,

    // =========================
    // USER MANAGEMENT
    // =========================

    USER_CREATED,
    USER_UPDATED,
    USER_STATUS_CHANGED,
    USER_DELETED,

    // =========================
    // ISSUE MANAGEMENT
    // =========================

    ISSUE_CREATED,
    ISSUE_UPDATED,
    ISSUE_STATUS_CHANGED,
    ISSUE_ASSIGNED,
    ISSUE_DELETED
}