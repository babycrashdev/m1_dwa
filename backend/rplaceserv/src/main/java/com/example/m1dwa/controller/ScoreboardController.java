package com.example.m1dwa.controller;

import com.example.m1dwa.dto.ScoreboardEntryDTO;
import com.example.m1dwa.service.ScoreboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ScoreboardController {

    private final ScoreboardService scoreboardService;

    @GetMapping("/scoreboard")
    public ResponseEntity<List<ScoreboardEntryDTO>> getScoreboard() {
        return ResponseEntity.ok(scoreboardService.getScoreboardEntries());
    }
}
