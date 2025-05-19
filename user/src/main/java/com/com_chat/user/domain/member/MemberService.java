package com.com_chat.user.domain.member;

import com.com_chat.user.support.exceptions.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository repository;

    public DomainDto.SignUpInfo create(DomainDto.SignUpCommand command){

        if( repository.findByNick(command.nick()).isPresent() ){
            throw new BaseException(MemberException.ALREADY_EXIST_NICK);
        }
        return DomainDto.SignUpInfo.fromDomain(repository.create(command.toDomain()));
    }


}
