package com.example.m1dwa.controller;

import com.example.m1dwa.dto.SlotDTO;
import com.example.m1dwa.model.Slot;
import com.example.m1dwa.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/clicker/map")
@RequiredArgsConstructor
public class MapController {

    private final SlotService slotService;

    @GetMapping
    public ResponseEntity<List<SlotDTO>> getMap(Authentication authentication) {
        return ResponseEntity.ok(convertToDTO(slotService.getSlots(authentication.getName())));
    }

    @PostMapping("/unlock")
    public ResponseEntity<List<SlotDTO>> unlockSlot(@RequestBody Map<String, Integer> request,Authentication authentication) {
        int slotIndex = request.get("slotIndex");
        return ResponseEntity.ok(convertToDTO(slotService.unlockSlot(authentication.getName(), slotIndex)));
    }

    @PostMapping("/place")
    public ResponseEntity<List<SlotDTO>> placeBuilding(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        int slotIndex = (Integer) request.get("slotIndex");
        String buildingType = (String) request.get("buildingType");
        
        return ResponseEntity.ok(convertToDTO(slotService.placeBuilding(authentication.getName(), slotIndex, buildingType)));
    }

    @PostMapping("/boost")
    public ResponseEntity<List<SlotDTO>> activateBoost(
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {
        
        int slotIndex = request.get("slotIndex");
        return ResponseEntity.ok(convertToDTO(slotService.activateBoost(authentication.getName(), slotIndex)));
    }

    @PostMapping("/boost-all")
    public ResponseEntity<List<SlotDTO>> activateAllBoosts(Authentication authentication) {
        return ResponseEntity.ok(convertToDTO(slotService.activateAllBoosts(authentication.getName())));
    }

    @PostMapping("/destroy")
    public ResponseEntity<List<SlotDTO>> destroyBuilding(
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {
        
        int slotIndex = request.get("slotIndex");
        return ResponseEntity.ok(convertToDTO(slotService.destroyBuilding(authentication.getName(), slotIndex)));
    }

    private List<SlotDTO> convertToDTO(List<Slot> slots) {
        return slots.stream().map(s -> {
            SlotDTO dto = new SlotDTO();
            dto.setSlotIndex(s.getSlotIndex());
            dto.setUnlocked(s.isUnlocked());
            dto.setBuildingType(s.getBuildingType());
            if (s.getLastBoostAt() != null) {
                dto.setLastBoostAt(s.getLastBoostAt().toInstant(ZoneOffset.UTC).toEpochMilli());
            }
            if (s.getLastAutoBonusAt() != null) {
                dto.setLastAutoBonusAt(s.getLastAutoBonusAt().toInstant(ZoneOffset.UTC).toEpochMilli());
            }
            return dto;
        }).collect(Collectors.toList());
    }
}
