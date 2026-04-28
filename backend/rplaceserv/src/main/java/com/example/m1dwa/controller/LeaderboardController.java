package com.example.m1dwa.controller;

import com.example.m1dwa.dto.LeaderboardTopBalanceDTO;
import com.example.m1dwa.dto.LeaderboardTopPixelDTO;
import com.example.m1dwa.repository.TopBalanceRepository;
import com.example.m1dwa.repository.TopPixelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final TopPixelRepository topPixelRepository;
    private final TopBalanceRepository topBalanceRepository;

    @GetMapping("/top-pixels")
    public List<LeaderboardTopPixelDTO> getTopPixels() {
        return topPixelRepository.findTopPixelPlacers(PageRequest.of(0, 5));
    }

    @GetMapping("/top-credits")
    public List<LeaderboardTopBalanceDTO> getTopCredits() {
        return topBalanceRepository.findTopBalances(PageRequest.of(0, 5));
    }
}
