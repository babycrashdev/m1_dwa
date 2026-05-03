package com.example.m1dwa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotDTO {
    private int slotIndex;
    private boolean unlocked;
    private String buildingType;
    private Long lastBoostAt;
    private Long lastAutoBonusAt;
    private boolean parcelPresent;
}
