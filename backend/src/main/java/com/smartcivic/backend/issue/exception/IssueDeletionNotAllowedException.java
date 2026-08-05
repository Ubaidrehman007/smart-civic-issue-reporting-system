package com.smartcivic.backend.issue.exception;

public class IssueDeletionNotAllowedException extends RuntimeException {
    public IssueDeletionNotAllowedException(String message) {
        super(message);
    }
}
