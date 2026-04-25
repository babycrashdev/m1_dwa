package com.example.m1dwa.controller;

import com.example.m1dwa.dto.PixelDTO;
import com.example.m1dwa.dto.PlacePixelRequest;
import com.example.m1dwa.service.PixelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class PixelWSController {

    private final PixelService pixelService;

    @MessageMapping("/place")
    @SendTo("/topic/board")
    public PixelDTO handlePlacePixel(PlacePixelRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("Utilisateur non authentifié");
            return null; 
        }

        String username = authentication.getName();
        return pixelService.placePixel(request, username);
    }
}
