package com.com_chat.user.domain.member;


import com.com_chat.user.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
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

    @Column(nullable = false)
    private String nick;

    @Column(nullable = false)
    private String email; // unique

    @Column(nullable = false)
    private String password;

    private String profilePath;

    private LocalDateTime lastLoginDate;


    private Member(String nick, String email, String password, String profilePath){
        this.nick           = nick;
        this.email          = email;
        this.password       = password;
        this.profilePath     = profilePath;
    }


    public static Member create(String nick, String email, String password, String profilePath){
        if( nick.isEmpty() ){

        }
        if( email.isEmpty() ){

        }
        if( password.isEmpty() ){

        }
        return new Member(nick,email,password,profilePath);
    }

}
