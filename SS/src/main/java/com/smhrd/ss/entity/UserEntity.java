package com.smhrd.ss.entity;

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
@Table(name = "users")
public class UserEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long userIdx;
	
	private String name;
	private String email;
	private String password;
	
	@Column(name = "oAuth")
	private Integer OAuth;
	
	@Column(name = "depart")
	private String depart;
	private String phone;
	
	@Column(name = "level")
	private String level;
	private String joinedAt;
}
