package com.edugrowhub.controller;

import com.edugrowhub.config.JwtUtil;
import com.edugrowhub.dto.AuthRequest;
import com.edugrowhub.dto.AuthResponse;
import com.edugrowhub.entity.Role;
import com.edugrowhub.entity.User;
import com.edugrowhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/superadmin/login")
    public ResponseEntity<?> superadminLogin(@RequestBody AuthRequest authRequest) {
        try {
            // Find user by email
            Optional<User> userOptional = userRepository.findByEmail(authRequest.getEmail());
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
            }
            
            User user = userOptional.get();
            
            // Check if user is SUPERADMIN
            if (user.getRole() != Role.SUPERADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Superadmin access required.");
            }
            
            // Verify password
            if (!passwordEncoder.matches(authRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");            }
            
            // Authenticate user
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.getEmail(),
                    authRequest.getPassword()
                )
            );
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());
            
            // Build success response  
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("tokenType", "Bearer");
            response.put("expiresIn", 3600000); // 1 hour
            
            // Add user information
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("email", user.getEmail());
            userInfo.put("name", user.getName());
            userInfo.put("role", user.getRole().toString());
            response.put("user", userInfo);
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid email or password");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Authentication failed: " + e.getMessage());
        }
    }
}
