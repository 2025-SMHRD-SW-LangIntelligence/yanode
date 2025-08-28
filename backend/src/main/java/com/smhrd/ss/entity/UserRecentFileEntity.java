package com.smhrd.ss.entity;


import java.security.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "userRecentFile")
public class UserRecentFileEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recentIdx;
    
    private Long userIdx;
    private String recentFile;
    private Timestamp createdAt;
}
