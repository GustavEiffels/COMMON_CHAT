package com.com_chat.user.domain.member;


import com.com_chat.user.support.BaseEntity;
import com.com_chat.user.support.exceptions.BaseException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"email","nick","profilePath"})
        }
)
public class Member extends BaseEntity {

    private static final Pattern NICKNAME_REGEX = Pattern.compile("^[a-zA-Z가-힣0-9_]{2,16}$");
    private static final Pattern EMAIL_REGEX  = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PASSWORD_REGEX = Pattern.compile( "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");


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
        if( nick.isEmpty() || email.isEmpty() || password.isEmpty()){
            throw new BaseException(MemberException.NOT_ENOUGH_NECESSARY);
        }
        if(!NICKNAME_REGEX.matcher(nick).matches()){
            throw new BaseException(MemberException.INVALID_NICKNAME);
        }
        if(!EMAIL_REGEX.matcher(email).matches()){
            throw new BaseException(MemberException.INVALID_EMAIL);
        }
        if(!PASSWORD_REGEX.matcher(password).matches()){
            throw new BaseException(MemberException.INVALID_PASSWORD);
        }
        return new Member(nick,email,password,profilePath);
    }

    public Long memberKey(){
        return this.id;
    }
}
