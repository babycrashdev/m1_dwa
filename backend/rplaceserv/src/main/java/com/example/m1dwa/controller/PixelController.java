package com.example.m1dwa.controller;

import com.example.m1dwa.dto.PixelDTO;
import com.example.m1dwa.repository.PixelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pixels")
@RequiredArgsConstructor
public class PixelController {

    private final PixelRepository pixelRepository;

    @GetMapping
    public List<PixelDTO> getAllPixels() {
        return pixelRepository.findAllSimplified();
    }
}
