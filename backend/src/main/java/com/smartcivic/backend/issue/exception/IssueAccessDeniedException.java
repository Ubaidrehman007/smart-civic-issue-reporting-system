package com.smartcivic.backend.issue.exception;

public class IssueAccessDeniedException extends RuntimeException {

    public IssueAccessDeniedException(String message) {
        super(message);
    }

}