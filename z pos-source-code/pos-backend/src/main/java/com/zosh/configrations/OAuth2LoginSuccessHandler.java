package com.zosh.configrations;

import com.zosh.domain.UserRole;
import com.zosh.modal.User;
import com.zosh.repository.UserRepository;
import com.zosh.service.impl.CustomUserImplementation;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final CustomUserImplementation customUserImplementation;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oAuth2AuthenticationToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oAuth2AuthenticationToken.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        if (email == null) {
            String login = oAuth2User.getAttribute("login");
            email = login != null ? login + "@github.com" : null;
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFullName(name != null ? name : email);
            user.setRole(UserRole.ROLE_STORE_ADMIN); // Default role
            user.setCreatedAt(LocalDateTime.now());
            user.setLastLogin(LocalDateTime.now());
            user.setPassword(""); // OAuth users don't have a password in local DB initially
            user = userRepository.save(user);
        } else {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }

        UserDetails userDetails = customUserImplementation.loadUserByUsername(user.getEmail());
        Authentication authToken = new UsernamePasswordAuthenticationToken(user.getEmail(), null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);

        String jwt = jwtProvider.generateToken(authToken);

        // Redirect to Frontend
        response.sendRedirect("http://localhost:5173/auth/oauth-success?token=" + jwt);
    }
}
