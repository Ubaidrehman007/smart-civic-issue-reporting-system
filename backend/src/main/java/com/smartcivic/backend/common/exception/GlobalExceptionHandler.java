package com.smartcivic.backend.common.exception;

import com.smartcivic.backend.auth.exception.InvalidCredentialsException;
import com.smartcivic.backend.common.response.ApiResponse;
import com.smartcivic.backend.issue.exception.InvalidIssueStatusTransitionException;
import com.smartcivic.backend.issue.exception.IssueAccessDeniedException;
import com.smartcivic.backend.issue.exception.IssueDeletionNotAllowedException;
import com.smartcivic.backend.issue.exception.IssueNotFoundException;
import com.smartcivic.backend.user.exception.UserAlreadyExistsException;
import com.smartcivic.backend.user.exception.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleUserAlreadyExists(
            UserAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ex.getMessage(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<List<String>>> handleValidationException(
            MethodArgumentNotValidException ex) {

        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fieldError -> fieldError.getDefaultMessage())
                .toList();

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("Validation failed", errors));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleUserNotFound(
            UserNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage(), null));
    }

    @ExceptionHandler(IssueNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleIssueNotFound(
            IssueNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage(), null));
    }



    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex) {

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(
                        "Invalid value '" + ex.getValue() +
                                "'. Please provide a valid value.",
                        null
                ));
    }


    @ExceptionHandler(IssueAccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleIssueAccessDeniedException(
            IssueAccessDeniedException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        ApiResponse.error(
                                ex.getMessage(),
                                null
                        )
                );
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingRequestParameter(
            MissingServletRequestParameterException ex
    ) {

        return ResponseEntity
                .badRequest()
                .body(
                        ApiResponse.error(
                                "Required parameter '" + ex.getParameterName() + "' is missing.",
                                null
                        )
                );
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiResponse<List<String>>> handleHandlerMethodValidation(
            HandlerMethodValidationException ex
    ) {

        List<String> errors = ex.getAllErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .toList();

        return ResponseEntity
                .badRequest()
                .body(
                        ApiResponse.error(
                                "Validation failed",
                                errors
                        )
                );
    }


    @ExceptionHandler(InvalidIssueStatusTransitionException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidIssueStatusTransition(
            InvalidIssueStatusTransitionException ex
    ) {

        return ResponseEntity
                .badRequest()
                .body(
                        ApiResponse.error(
                                ex.getMessage(),
                                null
                        )
                );
    }



    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(
            IllegalArgumentException ex
    ) {
        return ResponseEntity
                .badRequest()
                .body(
                        ApiResponse.error(
                                ex.getMessage(),
                                null
                        )
                );
    }




    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalStateException(
            IllegalStateException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        ApiResponse.error(
                                ex.getMessage(),
                                null
                        )
                );
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthorizationDenied(
            AuthorizationDeniedException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        ApiResponse.error(
                                "You do not have permission to perform this action.",
                                null
                        )
                );
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(
            Exception ex) {

        ex.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Something went wrong.", null));
    }



    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidCredentials(
            InvalidCredentialsException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ex.getMessage(), null));
    }


    @ExceptionHandler(IssueDeletionNotAllowedException.class)
    public ResponseEntity<ApiResponse<Void>> handleIssueDeletionNotAllowedException(
            IssueDeletionNotAllowedException ex
    ) {

        return ResponseEntity.badRequest()
                .body(ApiResponse.error(ex.getMessage(), null));
    }





}