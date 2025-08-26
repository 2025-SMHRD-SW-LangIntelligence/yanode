package com.smhrd.ss.entity;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
	
	@Column(name = "joinedAt")
	private Timestamp joinedAt;
	
	@Column(name = "lastPwChgAt")
	private Timestamp lastPwChgAt;
	
	@OneToMany(mappedBy = "userIdx", cascade = CascadeType.ALL)
	@JsonIgnore
    private List<UserApiEntity> apis = new ArrayList<>();
}
