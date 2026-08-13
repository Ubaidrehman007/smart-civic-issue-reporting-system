package com.smartcivic.backend.issue.exception;

public class InvalidIssueStatusTransitionException
        extends RuntimeException {

    public InvalidIssueStatusTransitionException(String message) {
        super(message);
    }
}