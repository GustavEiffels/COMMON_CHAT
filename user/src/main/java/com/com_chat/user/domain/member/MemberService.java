package com.com_chat.user.domain.member;

import com.com_chat.user.support.exceptions.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

import static org.springframework.util.StringUtils.hasText;

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
                repository.save(
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

// UPDATE
    public void update(DomainDto.UpdateCommand command){
        Optional<Member> findMember = repository.find(command.memberId());

        if ( findMember.isEmpty() ){
            throw new BaseException(MemberException.NOT_EXIST);
        }

        Member changeMember = findMember.get();
        if ( hasText(command.password()) ){
            changeMember = changeMember.changePassword(passwordEncoder.encode(command.password()));
        }
        if ( hasText(command.profilePath()) ){
            changeMember = changeMember.changeProfilePath(command.profilePath());
        }

        repository.save(changeMember);
    }
}
