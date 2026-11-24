package com.resumeintel.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class ImmutableFieldViolationException extends RuntimeException {
    public ImmutableFieldViolationException(String fieldName, String message) {
        super(String.format("Security policy violation: Protected field '%s' cannot be altered by AI proposals. Detail: %s", fieldName, message));
    }
}
