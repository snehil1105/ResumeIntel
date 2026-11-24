package com.resumeintel.controller;

import com.resumeintel.dto.ApiResponse;
import com.resumeintel.dto.AuthResponse;
import com.resumeintel.dto.LoginRequest;
import com.resumeintel.dto.RegisterRequest;
import com.resumeintel.dto.UserDto;
import com.resumeintel.security.UserPrincipal;
import com.resumeintel.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Login successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserDto userDto = UserDto.builder()
                .id(currentUser.getId())
                .email(currentUser.getEmail())
                .fullName(currentUser.getUsername())
                .role(currentUser.getAuthorities().iterator().next().getAuthority())
                .build();
        return ResponseEntity.ok(ApiResponse.ok(userDto, "Current user retrieved"));
    }
}
