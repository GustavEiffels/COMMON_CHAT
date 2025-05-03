package com.com_chat.user.domain.member;


import com.com_chat.user.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"email","nick","profilePath"})
        }
)
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long   id;


    private String nick;

    private String email; // unique

    private String password;

    private String profilePath;

    private LocalDateTime lastLoginDate;


}
