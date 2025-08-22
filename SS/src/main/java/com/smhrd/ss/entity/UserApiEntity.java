package com.smhrd.ss.entity;

import java.sql.Timestamp;

import jakarta.persistence.Column;
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
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "userAPIs")
public class UserApiEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long apiIdx;

    @Column(name = "userIdx")
    private Long userIdx;

    @Column(name = "apiTitle")
    private String apiTitle;

    @Column(name = "apiURL")
    private String apiURL;
    
    @Column(name = "createdDate")
    private Timestamp createdDate;
    
    @Column(name = "isConnected")
    private Boolean isConnected;
}
