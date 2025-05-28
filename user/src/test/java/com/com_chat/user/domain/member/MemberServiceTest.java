package com.com_chat.user.domain.member;

import com.com_chat.user.support.exceptions.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository repository;

    @InjectMocks
    private MemberService memberService;

    @DisplayName("""
            이미 존재하는 닉네임을 입력한 경우, 
            BaseException ( MemberException ) 
            """)
    @Test
    void already_exist_nick(){
        // given
        String nick = "duplicateNick";
        DomainMemberDto.SignUpCommand command = new DomainMemberDto.SignUpCommand(
                nick,
                "email@example.com",
                "Qwer!@34$",
                "profile"
                );

        Member mockMember = new Member(
                null,
                nick,
                "email@example.com",
                "Qwer!@34$",
                "profile",
                "TEST",
                LocalDateTime.now()
        );
        when(repository.findByNick(nick)).thenReturn(Optional.of(mockMember));

        // when & then
        BaseException exception = assertThrows(BaseException.class,()->{
            memberService.create(command);
        });

        assertEquals(MemberException.ALREADY_EXIST_NICK.getMessage(),exception.getMessage());
    }
}