package com.com_chat.user.infrastructure.member.entity;

import com.com_chat.user.domain.member.Member;
import com.com_chat.user.support.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;


@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"email","nick"})
        }
)
public class MemberEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long   memberId;

    @Column(nullable = false,unique = true)
    private String nick;

    @Column(nullable = false,unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String profilePath;

    private String refreshToken;

    @LastModifiedDate
    private LocalDateTime lastLoginDate;


    public static MemberEntity fromDomain(
            Member member
    ){
        MemberEntity entity = new MemberEntity();
        entity.memberId    = member.memberId();
        entity.email = member.email();
        entity.nick  = member.nick();
        entity.lastLoginDate = member.lastLoginDate();
        entity.password      = member.password();
        entity.profilePath    = member.profilePath();
        entity.refreshToken  = member.refreshToken();;

        return entity;
    }

    public Member toDomain(){
        return new Member(
                memberId,
                nick,
                email,
                password,
                profilePath,
                refreshToken,
                lastLoginDate
        );
    }
}
