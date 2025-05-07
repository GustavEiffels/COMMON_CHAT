package com.com_chat.user.domain.member;


import com.com_chat.user.support.exceptions.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository repository;

    public Long create(String nick,String email, String password, String profilePath ){
        if(findFromNick(nick) != null){
            throw new BaseException(MemberException.ALREADY_EXIST_NICK);
        }
        return repository.create(Member.create(nick,email,password,profilePath));
    }


    public Member findFromNick(String nick){
        return repository.findByNick(nick).orElse(null);
    }
}
