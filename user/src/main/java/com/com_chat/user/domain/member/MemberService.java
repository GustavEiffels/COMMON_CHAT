package com.com_chat.user.domain.member;

import com.com_chat.user.support.exceptions.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final PasswordEncoder passwordEncoder;
    private final MemberRepository repository;


// SIGNUP
    public DomainDto.SignUpInfo create(DomainDto.SignUpCommand command){

        if( repository.findByNick(command.nick()).isPresent() ){
            throw new BaseException(MemberException.ALREADY_EXIST_NICK);
        }
        return DomainDto.SignUpInfo.fromDomain(
                repository.create(
                        command.toDomain(
                                passwordEncoder.encode(
                                        command.password()
                                )
                        )
                )
        );
    }

// SEARCH
    public DomainDto.SearchInfo search(DomainDto.SearchCommand command){
        return DomainDto.SearchInfo.fromDomain(
                repository.findByQuery(
                        command.type(),
                        command.query(),
                        command.pageable()
                )
        );
    }

}
